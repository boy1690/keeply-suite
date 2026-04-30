#!/usr/bin/env node
/**
 * Fetch Google Analytics 4 data for the keeply.work property.
 *
 * Both blog.keeply.work and keeply.work share the same GA4 property
 * (#534326745) but live on different data streams. We split traffic by
 * the `hostName` dimension to attribute back to each site.
 *
 * Output: JSON to stdout.
 * Auth: GOOGLE_SERVICE_ACCOUNT_JSON (same as GSC). The service account
 * must be added as a Viewer on the GA4 property.
 *
 * Property: GA4_PROPERTY_ID env var (numeric).
 */
'use strict';

const { google } = require('googleapis');

const SVC_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const PROPERTY_ID = process.env.GA4_PROPERTY_ID;
if (!SVC_JSON || !PROPERTY_ID) {
  console.error('GOOGLE_SERVICE_ACCOUNT_JSON / GA4_PROPERTY_ID env not set');
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(SVC_JSON),
  scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
});

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const daysAgo = (n) => fmt(new Date(today.getTime() - n * 86400000));

const property = `properties/${PROPERTY_ID}`;
const CURRENT = { startDate: daysAgo(7), endDate: daysAgo(1) };
const PREVIOUS = { startDate: daysAgo(14), endDate: daysAgo(8) };

async function runReport(ad, requestBody) {
  const r = await ad.properties.runReport({ property, requestBody });
  return r.data.rows || [];
}

async function main() {
  const ad = google.analyticsdata({ version: 'v1beta', auth });
  const out = { window: { current: CURRENT, previous: PREVIOUS } };

  const safe = async (key, fn) => {
    try {
      out[key] = await fn();
    } catch (e) {
      out[`${key}Error`] = e.message;
    }
  };

  // Sessions / users by host, current vs previous (week-over-week)
  await safe('byHost', () =>
    runReport(ad, {
      dateRanges: [
        { name: 'current', ...CURRENT },
        { name: 'previous', ...PREVIOUS },
      ],
      dimensions: [{ name: 'hostName' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'engagedSessions' },
        { name: 'screenPageViews' },
      ],
    })
  );

  // Organic Search sessions only, by host
  await safe('organic', () =>
    runReport(ad, {
      dateRanges: [
        { name: 'current', ...CURRENT },
        { name: 'previous', ...PREVIOUS },
      ],
      dimensions: [
        { name: 'sessionDefaultChannelGroup' },
        { name: 'hostName' },
      ],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
      dimensionFilter: {
        filter: {
          fieldName: 'sessionDefaultChannelGroup',
          stringFilter: { value: 'Organic Search' },
        },
      },
    })
  );

  // Top pages — current week
  await safe('topPages', () =>
    runReport(ad, {
      dateRanges: [CURRENT],
      dimensions: [{ name: 'hostName' }, { name: 'pagePath' }],
      metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 20,
    })
  );

  // Country distribution
  await safe('byCountry', () =>
    runReport(ad, {
      dateRanges: [CURRENT],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    })
  );

  // Source / medium for organic discovery
  await safe('sourceMedium', () =>
    runReport(ad, {
      dateRanges: [CURRENT],
      dimensions: [{ name: 'sessionSourceMedium' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    })
  );

  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
