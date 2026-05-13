#!/usr/bin/env node
/**
 * Backlink monitoring — captures Ubersuggest overview snapshot for
 * both keeply origins. Saves to _dev/seo/backlinks-baseline.json so
 * future runs can detect deltas (new backlinks gained, lost, DA shift).
 *
 * IMPORTANT — runtime constraint:
 *   Ubersuggest is accessed via Claude Code's MCP server which is
 *   only reachable from an interactive Claude Code session, NOT from
 *   GitHub Actions runners. Therefore:
 *
 *   1. This script does NOT call Ubersuggest directly — it reads a
 *      latest_snapshot.json that you generate by asking Claude Code
 *      to "refresh backlink baseline" within a session (Claude runs
 *      the MCP calls, writes the JSON).
 *   2. The script's job is to compare the current snapshot vs the
 *      prior baseline and emit a delta report.
 *
 * Manual cadence: monthly is plenty for a young site (DA-shifts are
 * slow). Once backlinks grow past ~50 referring domains, automate via
 * a paid API instead of MCP.
 *
 * Output: JSON delta to stdout.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const BASELINE_PATH = path.join(__dirname, 'backlinks-baseline.json');
const SNAPSHOT_PATH = path.join(__dirname, 'backlinks-snapshot-latest.json');

function loadJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function main() {
  const baseline = loadJson(BASELINE_PATH);
  const snapshot = loadJson(SNAPSHOT_PATH);

  if (!snapshot) {
    console.error(`No latest snapshot at ${SNAPSHOT_PATH}.`);
    console.error('Ask Claude Code in a session: "refresh backlink baseline" — it will call');
    console.error('Ubersuggest MCP and write the snapshot.');
    process.exit(1);
  }

  if (!baseline) {
    // First-run: snapshot becomes baseline.
    fs.copyFileSync(SNAPSHOT_PATH, BASELINE_PATH);
    console.log(JSON.stringify({
      message: 'First-run: snapshot adopted as baseline. No delta to report.',
      snapshot,
    }, null, 2));
    return;
  }

  const delta = { generated_at: new Date().toISOString(), domains: {} };
  for (const [domain, cur] of Object.entries(snapshot.domains || {})) {
    const prev = baseline.domains?.[domain];
    if (!prev) { delta.domains[domain] = { ...cur, _note: 'new domain in snapshot' }; continue; }
    delta.domains[domain] = {
      domainAuthority: { current: cur.domainAuthority, prev: prev.domainAuthority, delta: cur.domainAuthority - prev.domainAuthority },
      backlinks: { current: cur.backlinks, prev: prev.backlinks, delta: cur.backlinks - prev.backlinks },
      refDomains: { current: cur.refDomains, prev: prev.refDomains, delta: cur.refDomains - prev.refDomains },
      refDomainsGovEdu: { current: cur.refDomainsGovEdu, prev: prev.refDomainsGovEdu, delta: cur.refDomainsGovEdu - prev.refDomainsGovEdu },
    };
  }
  console.log(JSON.stringify(delta, null, 2));
}

main();
