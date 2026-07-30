/*
 * Local import runner for the NYU Gallatin homepage.
 *
 * The live site is behind an AWS WAF CAPTCHA, so the standard browser-based
 * run-bulk-import.js cannot fetch it. This runner reproduces the exact same
 * pipeline the browser uses (helix-importer's WebImporter.html2md + the bundled
 * CustomImportScript) but sources the DOM from the locally-saved cleaned.html.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPTS_NM = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/node_modules';
const { JSDOM } = await import(pathToFileURL(`${SCRIPTS_NM}/jsdom/lib/api.js`).href);

const REPO = '/backups/oharris69/nyu-gallatin-eds/repo';
const SCRIPTS = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts';

const ORIGINAL_URL = 'https://gallatin.nyu.edu/';
const SOURCE_HTML = path.join(REPO, 'migration-work/cleaned.html');
const HELIX = path.join(SCRIPTS, 'static/inject/helix-importer.js');
const BUNDLE = path.join(REPO, 'tools/importer/import-homepage.bundle.js');
const OUT_DIR = path.join(REPO, 'content');
const REPORT_DIR = path.join(REPO, 'tools/importer/reports');

const html = fs.readFileSync(SOURCE_HTML, 'utf8');
const helixScript = fs.readFileSync(HELIX, 'utf8');
const bundleScript = fs.readFileSync(BUNDLE, 'utf8');

// Build a DOM whose document URL is the original site so relative URL logic works.
const dom = new JSDOM(html, {
  url: ORIGINAL_URL,
  runScripts: 'outside-only',
  pretendToBeVisual: true,
});
const { window } = dom;

// Minimal shims the helix bundle may touch in a browser.
window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {} }));
if (typeof window.define !== 'undefined') delete window.define;

// The helix-importer bundle expects browser/Node globals that jsdom's window
// does not provide by itself. Expose them on the window before injection.
import { TextEncoder, TextDecoder } from 'node:util';
window.TextEncoder = window.TextEncoder || TextEncoder;
window.TextDecoder = window.TextDecoder || TextDecoder;
window.Buffer = window.Buffer || Buffer;
window.process = window.process || process;
window.global = window;
window.setTimeout = window.setTimeout || setTimeout;
window.clearTimeout = window.clearTimeout || clearTimeout;
window.queueMicrotask = window.queueMicrotask || queueMicrotask;
if (typeof window.crypto === 'undefined') {
  window.crypto = globalThis.crypto;
}

// Inject helix-importer, then the bundled custom import script, into the window
// context (mirrors the two page.evaluate injections in run-bulk-import.js).
const ctx = vm.createContext(window);
vm.runInContext(helixScript, ctx, { filename: 'helix-importer.js' });
vm.runInContext(bundleScript, ctx, { filename: 'import-homepage.bundle.js' });

if (!window.WebImporter || typeof window.WebImporter.html2md !== 'function') {
  throw new Error('WebImporter.html2md not available after injecting helix-importer.');
}
const cfg = window.CustomImportScript && window.CustomImportScript.default;
if (!cfg || typeof cfg.transform !== 'function') {
  throw new Error('CustomImportScript.default.transform not available after injecting bundle.');
}

const run = async () => {
  const result = await window.WebImporter.html2md(ORIGINAL_URL, window.document, cfg, {
    toMd: true,
    toDocx: false,
    originalURL: ORIGINAL_URL,
  });

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const items = Array.isArray(result) ? result : [result];
  const reports = [];
  for (const item of items) {
    const rel = (item.path || '/index').replace(/^\/+/, '');
    const base = path.join(OUT_DIR, rel);
    fs.mkdirSync(path.dirname(base), { recursive: true });

    if (item.md) fs.writeFileSync(`${base}.md`, item.md, 'utf8');

    // Produce the .plain.html EDS expects. Prefer md2html; fall back to md2da->html.
    let plainHtml = item.html;
    if (!plainHtml && item.md && typeof window.WebImporter.md2html === 'function') {
      plainHtml = window.WebImporter.md2html(item.md);
    }
    if (!plainHtml && item.md && typeof window.WebImporter.md2da === 'function') {
      plainHtml = window.WebImporter.md2da(item.md);
    }
    if (plainHtml) fs.writeFileSync(`${base}.plain.html`, plainHtml, 'utf8');

    reports.push({
      url: ORIGINAL_URL, path: item.path, status: 'success', ...(item.report || {}),
    });
    console.log(`✅ wrote ${rel}.plain.html  (blocks: ${(item.report && item.report.blocks || []).join(', ')})`);
  }

  fs.writeFileSync(path.join(REPORT_DIR, 'import-homepage.report.json'), JSON.stringify(reports, null, 2));
  console.log(`\nReport: tools/importer/reports/import-homepage.report.json`);
};

run().catch((e) => { console.error('IMPORT FAILED:', e); process.exit(1); });
