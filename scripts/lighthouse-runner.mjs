#!/usr/bin/env node

/**
 * Lighthouse Performance Runner
 *
 * Usage:
 *   node scripts/lighthouse-runner.mjs --target=local
 *   node scripts/lighthouse-runner.mjs --target=prod
 *
 * Runs Lighthouse against target pages (3 runs × 2 devices per page).
 * Outputs HTML + JSON reports to ./lighthouse-reports/{local|prod}/
 * Writes summary.json with median scores + Core Web Vitals.
 *
 * IMPORTANT: Run against `next start` (production build), not dev server.
 */

import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const REPORT_DIR = join(PROJECT_ROOT, "lighthouse-reports");

// ─── Configuration ───────────────────────────────────────────────

const TARGETS = {
  local: "http://localhost:3002",
  prod: "https://mane-ex.vercel.app",
};

const PAGES = {
  home: "/",
  browse: "/browse",
  listing: "/horses/bellissimos-legacy",
  dashboard: "/dashboard/listings",
};

const RUNS_PER_PAGE = 3;

// Lighthouse config presets
const MOBILE_CONFIG = {
  extends: "lighthouse:default",
  settings: {
    formFactor: "mobile",
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
    },
    screenEmulation: {
      mobile: true,
      width: 412,
      height: 823,
      deviceScaleFactor: 1.75,
    },
    emulatedUserAgent:
      "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36",
  },
};

const DESKTOP_CONFIG = {
  extends: "lighthouse:default",
  settings: {
    formFactor: "desktop",
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
    },
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
    },
    emulatedUserAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const targetArg = args.find((a) => a.startsWith("--target="));
  if (!targetArg) {
    console.error("Usage: node lighthouse-runner.mjs --target=local|prod");
    process.exit(1);
  }
  const target = targetArg.split("=")[1];
  if (!TARGETS[target]) {
    console.error(`Unknown target: ${target}. Use 'local' or 'prod'.`);
    process.exit(1);
  }
  return { target, baseUrl: TARGETS[target] };
}

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function extractScores(lhr) {
  const cat = (key) => Math.round((lhr.categories[key]?.score ?? 0) * 100);
  const audit = (key) => lhr.audits[key]?.numericValue ?? null;

  return {
    performance: cat("performance"),
    accessibility: cat("accessibility"),
    bestPractices: cat("best-practices"),
    seo: cat("seo"),
    // Core Web Vitals + key metrics
    lcp: audit("largest-contentful-paint"), // ms
    cls: lhr.audits["cumulative-layout-shift"]?.numericValue ?? null,
    tbt: audit("total-blocking-time"), // ms
    fcp: audit("first-contentful-paint"), // ms
    si: audit("speed-index"), // ms
    tti: audit("interactive"), // ms
  };
}

function extractTopOpportunities(lhr, count = 5) {
  // Collect diagnostics: LCP element, render-blocking resources, unused JS, etc.
  const opportunities = [];

  // LCP element
  const lcpAudit = lhr.audits["largest-contentful-paint-element"];
  if (lcpAudit?.details?.items?.[0]) {
    opportunities.push({
      id: "lcp-element",
      label: "LCP Element",
      detail: lcpAudit.details.items[0].node?.snippet || lcpAudit.displayValue || "unknown",
    });
  }

  // Render-blocking resources
  const renderBlocking = lhr.audits["render-blocking-resources"];
  if (renderBlocking?.details?.items?.length > 0) {
    opportunities.push({
      id: "render-blocking-resources",
      label: `Render-blocking resources (${renderBlocking.details.items.length})`,
      savings: `${Math.round(renderBlocking.details.overallSavingsMs || 0)}ms`,
      items: renderBlocking.details.items.slice(0, 3).map((i) => i.url),
    });
  }

  // Unused JavaScript
  const unusedJS = lhr.audits["unused-javascript"];
  if (unusedJS?.details?.items?.length > 0) {
    const totalKB = unusedJS.details.items.reduce(
      (sum, i) => sum + (i.wastedBytes || 0),
      0
    );
    opportunities.push({
      id: "unused-javascript",
      label: `Unused JavaScript (${unusedJS.details.items.length} files)`,
      savings: `${Math.round(totalKB / 1024)}KB`,
      items: unusedJS.details.items
        .sort((a, b) => (b.wastedBytes || 0) - (a.wastedBytes || 0))
        .slice(0, 5)
        .map((i) => ({
          url: i.url?.split("/").pop() || i.url,
          wastedKB: Math.round((i.wastedBytes || 0) / 1024),
        })),
    });
  }

  // Long tasks / main thread work
  const mainThread = lhr.audits["mainthread-work-breakdown"];
  if (mainThread?.details?.items?.length > 0) {
    opportunities.push({
      id: "main-thread-work",
      label: `Main thread work: ${mainThread.displayValue}`,
      items: mainThread.details.items
        .slice(0, 5)
        .map((i) => ({ group: i.group, ms: Math.round(i.duration) })),
    });
  }

  // JS execution time
  const bootup = lhr.audits["bootup-time"];
  if (bootup?.details?.items?.length > 0) {
    opportunities.push({
      id: "js-execution-time",
      label: `JS execution: ${bootup.displayValue}`,
      items: bootup.details.items
        .slice(0, 5)
        .map((i) => ({
          url: i.url?.split("/").pop() || i.url,
          totalMs: Math.round(i.total),
          scriptingMs: Math.round(i.scripting),
        })),
    });
  }

  // CLS sources
  const clsAudit = lhr.audits["layout-shift-elements"];
  if (clsAudit?.details?.items?.length > 0) {
    opportunities.push({
      id: "cls-sources",
      label: "CLS Sources",
      items: clsAudit.details.items.map((i) => ({
        node: i.node?.snippet || "unknown",
        score: i.score,
      })),
    });
  }

  // Largest image / unoptimized images
  const modernFormats = lhr.audits["modern-image-formats"];
  if (modernFormats?.details?.items?.length > 0) {
    opportunities.push({
      id: "modern-image-formats",
      label: `Images not in modern format (${modernFormats.details.items.length})`,
      savings: `${Math.round((modernFormats.details.overallSavingsBytes || 0) / 1024)}KB`,
      items: modernFormats.details.items
        .slice(0, 3)
        .map((i) => ({ url: i.url?.split("/").pop() || i.url })),
    });
  }

  // Properly size images
  const sizedImages = lhr.audits["uses-responsive-images"];
  if (sizedImages?.details?.items?.length > 0) {
    opportunities.push({
      id: "responsive-images",
      label: `Oversized images (${sizedImages.details.items.length})`,
      savings: `${Math.round((sizedImages.details.overallSavingsBytes || 0) / 1024)}KB`,
    });
  }

  return opportunities.slice(0, count);
}

function formatMs(ms) {
  if (ms === null || ms === undefined) return "N/A";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  const { target, baseUrl } = parseArgs();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outDir = join(REPORT_DIR, target, timestamp);
  mkdirSync(outDir, { recursive: true });

  console.log(`\n🔍 Lighthouse Runner`);
  console.log(`   Target: ${target} (${baseUrl})`);
  console.log(`   Output: ${outDir}`);
  console.log(`   Runs per page/device: ${RUNS_PER_PAGE}\n`);

  // Skip dashboard on prod (auth-walled)
  const pageEntries = Object.entries(PAGES).filter(
    ([key]) => !(target === "prod" && key === "dashboard")
  );

  // Launch Chrome once, reuse across all runs
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
  });

  const results = {};

  for (const [pageKey, pagePath] of pageEntries) {
    const url = `${baseUrl}${pagePath}`;
    results[pageKey] = {};

    for (const [deviceName, config] of [
      ["mobile", MOBILE_CONFIG],
      ["desktop", DESKTOP_CONFIG],
    ]) {
      const runs = [];

      for (let run = 1; run <= RUNS_PER_PAGE; run++) {
        const label = `${pageKey}/${deviceName}/run${run}`;
        process.stdout.write(`  ▸ ${label}...`);

        try {
          const runResult = await lighthouse(url, {
            port: chrome.port,
            output: ["html", "json"],
            onlyCategories: [
              "performance",
              "accessibility",
              "best-practices",
              "seo",
            ],
          }, config);

          const lhr = runResult.lhr;
          const scores = extractScores(lhr);
          const opportunities =
            run === 1 ? extractTopOpportunities(lhr, 5) : null;
          runs.push({ run, scores, opportunities });

          // Write HTML report
          const htmlFile = `${pageKey}-${deviceName}-run${run}.html`;
          writeFileSync(join(outDir, htmlFile), runResult.report[0]);

          // Write JSON report
          const jsonFile = `${pageKey}-${deviceName}-run${run}.json`;
          writeFileSync(join(outDir, jsonFile), runResult.report[1]);

          console.log(
            ` Perf=${scores.performance} LCP=${formatMs(scores.lcp)} TBT=${formatMs(scores.tbt)} CLS=${scores.cls?.toFixed(3) ?? "N/A"}`
          );
        } catch (err) {
          console.log(` ERROR: ${err.message}`);
          runs.push({ run, scores: null, error: err.message });
        }
      }

      // Calculate medians from successful runs
      const validRuns = runs.filter((r) => r.scores);
      if (validRuns.length > 0) {
        const medianScores = {};
        const scoreKeys = Object.keys(validRuns[0].scores);
        for (const key of scoreKeys) {
          const values = validRuns.map((r) => r.scores[key]).filter((v) => v !== null);
          medianScores[key] = values.length > 0 ? median(values) : null;
        }

        // Get opportunities from the median run (closest to median perf score)
        const medianPerf = medianScores.performance;
        const medianRun = validRuns.reduce((best, r) =>
          Math.abs(r.scores.performance - medianPerf) <
          Math.abs(best.scores.performance - medianPerf)
            ? r
            : best
        );

        results[pageKey][deviceName] = {
          median: medianScores,
          opportunities:
            medianRun.opportunities ||
            validRuns.find((r) => r.opportunities)?.opportunities ||
            [],
          runs: runs.map((r) => ({
            run: r.run,
            performance: r.scores?.performance ?? null,
          })),
        };
      } else {
        results[pageKey][deviceName] = {
          median: null,
          error: "All runs failed",
          runs,
        };
      }
    }
  }

  await chrome.kill();

  // Write summary
  const summary = {
    timestamp: new Date().toISOString(),
    target,
    baseUrl,
    lighthouseVersion: (await import("lighthouse/package.json", { with: { type: "json" } })).default.version,
    runsPerPage: RUNS_PER_PAGE,
    results,
  };

  writeFileSync(
    join(outDir, "summary.json"),
    JSON.stringify(summary, null, 2)
  );

  // Print summary table
  console.log("\n" + "═".repeat(90));
  console.log("  MEDIAN SCORES");
  console.log("═".repeat(90));
  console.log(
    "  Page".padEnd(16) +
      "Device".padEnd(10) +
      "Perf".padEnd(7) +
      "A11y".padEnd(7) +
      "BP".padEnd(7) +
      "SEO".padEnd(7) +
      "LCP".padEnd(9) +
      "CLS".padEnd(8) +
      "TBT".padEnd(9) +
      "FCP".padEnd(9)
  );
  console.log("─".repeat(90));

  for (const [pageKey] of pageEntries) {
    for (const device of ["mobile", "desktop"]) {
      const m = results[pageKey]?.[device]?.median;
      if (!m) continue;
      console.log(
        `  ${pageKey}`.padEnd(16) +
          `${device}`.padEnd(10) +
          `${m.performance}`.padEnd(7) +
          `${m.accessibility}`.padEnd(7) +
          `${m.bestPractices}`.padEnd(7) +
          `${m.seo}`.padEnd(7) +
          `${formatMs(m.lcp)}`.padEnd(9) +
          `${m.cls?.toFixed(3) ?? "N/A"}`.padEnd(8) +
          `${formatMs(m.tbt)}`.padEnd(9) +
          `${formatMs(m.fcp)}`.padEnd(9)
      );
    }
  }
  console.log("═".repeat(90));

  // Print top issues per page
  console.log("\n  TOP ISSUES PER PAGE (from median run)");
  console.log("─".repeat(90));

  for (const [pageKey] of pageEntries) {
    for (const device of ["mobile", "desktop"]) {
      const data = results[pageKey]?.[device];
      if (!data?.opportunities?.length) continue;
      console.log(`\n  ${pageKey} (${device}):`);
      for (const opp of data.opportunities) {
        const savings = opp.savings ? ` [saves ${opp.savings}]` : "";
        console.log(`    • ${opp.label}${savings}`);
        if (opp.items) {
          for (const item of opp.items.slice(0, 3)) {
            if (typeof item === "string") {
              console.log(`      → ${item.split("/").pop()}`);
            } else if (item.url) {
              console.log(
                `      → ${item.url}${item.wastedKB ? ` (${item.wastedKB}KB unused)` : ""}`
              );
            } else if (item.group) {
              console.log(`      → ${item.group}: ${item.ms}ms`);
            } else if (item.node) {
              console.log(`      → ${item.node} (shift: ${item.score?.toFixed(4)})`);
            }
          }
        }
        if (opp.detail) {
          console.log(`      → ${opp.detail}`);
        }
      }
    }
  }

  console.log(`\n\n✅ Reports saved to: ${outDir}`);
  console.log(`   Summary: ${join(outDir, "summary.json")}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
