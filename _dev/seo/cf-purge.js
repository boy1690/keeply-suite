#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const TOKEN = process.env.CF_PURGE_TOKEN;
const ZONE = process.env.CF_ZONE_ID;
if (!TOKEN || !ZONE) {
  console.error('Missing CF_PURGE_TOKEN or CF_ZONE_ID in _dev/seo/.env');
  process.exit(1);
}

const urls = process.argv.slice(2);
if (!urls.length) {
  console.error('Usage: node cf-purge.js <url> [<url> ...]');
  console.error('       node cf-purge.js --all   (purge entire zone)');
  process.exit(1);
}

const body = urls[0] === '--all'
  ? { purge_everything: true }
  : { files: urls };

(async () => {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${ZONE}/purge_cache`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  const json = await res.json();
  if (!json.success) {
    console.error('Purge failed:', JSON.stringify(json.errors, null, 2));
    process.exit(1);
  }
  console.log('Purged:', urls[0] === '--all' ? 'ENTIRE ZONE' : urls.join(', '));
  console.log('id:', json.result.id);
})();
