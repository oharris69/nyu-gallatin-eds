/*
 * Local import runner for the Amanda Petrusich faculty page (CAPTCHA-gated live
 * site; runs against the saved DOM). Mirrors run-local-import.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';
import { TextEncoder, TextDecoder } from 'node:util';

const REPO = '/backups/oharris69/nyu-gallatin-eds/repo';
const SCRIPTS_NM = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts';
const { JSDOM } = await import(pathToFileURL(`${SCRIPTS_NM}/node_modules/jsdom/lib/api.js`).href);

const ORIGINAL_URL = 'https://gallatin.nyu.edu/academics/faculty/amanda-petrusich.html';
const html = fs.readFileSync(path.join(REPO, 'migration-work/cleaned-faculty.html'), 'utf8');
const helixScript = fs.readFileSync(path.join(SCRIPTS_NM, 'static/inject/helix-importer.js'), 'utf8');
const bundleScript = fs.readFileSync(path.join(REPO, 'tools/importer/import-faculty.bundle.js'), 'utf8');

const dom = new JSDOM(html, { url: ORIGINAL_URL, runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {} }));
if (typeof window.define !== 'undefined') delete window.define;
window.TextEncoder = window.TextEncoder || TextEncoder;
window.TextDecoder = window.TextDecoder || TextDecoder;
window.Buffer = window.Buffer || Buffer;
window.process = window.process || process;
window.global = window;
window.setTimeout = window.setTimeout || setTimeout;
window.clearTimeout = window.clearTimeout || clearTimeout;
window.queueMicrotask = window.queueMicrotask || queueMicrotask;
if (typeof window.crypto === 'undefined') window.crypto = globalThis.crypto;

const ctx = vm.createContext(window);
vm.runInContext(helixScript, ctx, { filename: 'helix-importer.js' });
vm.runInContext(bundleScript, ctx, { filename: 'import-faculty.bundle.js' });

const cfg = window.CustomImportScript && window.CustomImportScript.default;
const run = async () => {
  const result = await window.WebImporter.html2md(ORIGINAL_URL, window.document, cfg, {
    toMd: true, toDocx: false, originalURL: ORIGINAL_URL,
  });
  const items = Array.isArray(result) ? result : [result];
  const OUT = path.join(REPO, 'content');
  for (const item of items) {
    const rel = (item.path || '/academics/faculty/amanda-petrusich').replace(/^\/+/, '');
    const base = path.join(OUT, rel);
    fs.mkdirSync(path.dirname(base), { recursive: true });
    if (item.md) fs.writeFileSync(`${base}.md`, item.md, 'utf8');
    let plain = item.html;
    if (!plain && item.md && typeof window.WebImporter.md2html === 'function') plain = window.WebImporter.md2html(item.md);
    if (!plain && item.md && typeof window.WebImporter.md2da === 'function') plain = window.WebImporter.md2da(item.md);
    if (plain) fs.writeFileSync(`${base}.plain.html`, plain, 'utf8');
    console.log(`✅ wrote ${rel}.plain.html (blocks: ${(item.report && item.report.blocks || []).join(', ')})`);
  }
};
run().catch((e) => { console.error('FACULTY IMPORT FAILED:', e); process.exit(1); });
