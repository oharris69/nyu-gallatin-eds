/*
 * Build a *versioned* FileVault content package.
 *
 * Usage:
 *   node tools/importer/build-package.mjs            # bump patch (1.0.0 -> 1.0.1)
 *   node tools/importer/build-package.mjs --minor    # 1.0.0 -> 1.1.0
 *   node tools/importer/build-package.mjs --major    # 1.0.0 -> 2.0.0
 *   node tools/importer/build-package.mjs --set 1.4.0
 *   node tools/importer/build-package.mjs --version 1.2.0 --note "re-root under language-masters"
 *
 * What it does (deterministic, no overwrite of history):
 *   1. Reads the current version from package/version.json (source of truth).
 *   2. Computes the next version (bump or explicit --set/--version).
 *   3. Stamps it into META-INF/vault/properties.xml (name, group, version)
 *      so AEM Package Manager shows the version and keeps prior installs.
 *   4. Zips the staged package tree into  dist/nyu-gallatin-homepage-<version>.zip
 *      (versioned filename => every build is preserved, rollback is trivial).
 *   5. Appends an entry to package/CHANGELOG.md and updates version.json.
 *
 * The staged tree (package/nyu-gallatin-homepage/{jcr_root,META-INF}) is produced
 * by the content build steps (md2jcr-convert.mjs etc.); this script only versions
 * + zips it. Run the content build first, then this.
 */
import fs from 'node:fs';
import path from 'node:path';

const REPO = '/backups/oharris69/nyu-gallatin-eds/repo';
const PKG_DIR = path.join(REPO, 'tools/importer/package');
const STAGE = path.join(PKG_DIR, 'nyu-gallatin-homepage');
const DIST = path.join(PKG_DIR, 'dist');
const VERSION_FILE = path.join(PKG_DIR, 'version.json');
const CHANGELOG = path.join(PKG_DIR, 'CHANGELOG.md');
const PROPS = path.join(STAGE, 'META-INF/vault/properties.xml');

const PKG_NAME = 'nyu-gallatin-homepage';
const PKG_GROUP = 'nyu-gallatin';

// --- args ---
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };
const noteArg = val('--note');

function readCurrent() {
  if (fs.existsSync(VERSION_FILE)) return JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8')).version;
  return '1.0.0';
}

function bump(v, kind) {
  const [maj, min, pat] = v.split('.').map((n) => parseInt(n, 10));
  if (kind === 'major') return `${maj + 1}.0.0`;
  if (kind === 'minor') return `${maj}.${min + 1}.0`;
  return `${maj}.${min}.${pat + 1}`;
}

function nextVersion() {
  const explicit = val('--set') || val('--version');
  if (explicit) {
    if (!/^\d+\.\d+\.\d+$/.test(explicit)) throw new Error(`--set/--version must be semver x.y.z, got "${explicit}"`);
    return explicit;
  }
  const cur = readCurrent();
  if (has('--major')) return bump(cur, 'major');
  if (has('--minor')) return bump(cur, 'minor');
  return bump(cur, 'patch');
}

function stampProperties(version) {
  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
    <comment>FileVault Package Definition</comment>
    <entry key="name">${PKG_NAME}</entry>
    <entry key="group">${PKG_GROUP}</entry>
    <entry key="version">${version}</entry>
    <entry key="packageType">content</entry>
    <entry key="requiresRoot">false</entry>
    <entry key="allowIndexDefinitions">false</entry>
    <entry key="createdBy">excat-migration</entry>
</properties>
`;
  fs.writeFileSync(PROPS, xml, 'utf8');
}

function zipDir(srcDir, outFile) {
  // Deterministic zip via Node's built-in — walk + store with relative arcnames.
  // Node has no stdlib zip writer, so shell out to python3 (present in this env).
  const { execFileSync } = require('node:child_process');
  const py = `
import zipfile, os, sys
base, out = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(base):
        for f in sorted(files):
            full = os.path.join(root, f)
            z.write(full, os.path.relpath(full, base))
print(out)
`;
  execFileSync('python3', ['-c', py, srcDir, outFile], { stdio: 'inherit' });
}

const version = nextVersion();
if (!fs.existsSync(STAGE)) throw new Error(`staged package not found at ${STAGE} — run the content build first`);

stampProperties(version);
fs.mkdirSync(DIST, { recursive: true });
const outFile = path.join(DIST, `${PKG_NAME}-${version}.zip`);

// require() in ESM
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
zipDir(STAGE, outFile);

// update version.json + changelog (timestamp passed via env to avoid Date in scripts)
const ts = process.env.BUILD_TS || new Date().toISOString();
fs.writeFileSync(VERSION_FILE, `${JSON.stringify({ name: PKG_NAME, group: PKG_GROUP, version }, null, 2)}\n`, 'utf8');

const note = noteArg || '(no note)';
const entry = `## ${version} — ${ts}\n- ${note}\n- Artifact: dist/${PKG_NAME}-${version}.zip\n\n`;
let changelog = '';
if (fs.existsSync(CHANGELOG)) changelog = fs.readFileSync(CHANGELOG, 'utf8');
else changelog = `# ${PKG_NAME} — package changelog\n\n`;
// insert new entry right after the H1
const lines = changelog.split('\n');
const h1idx = lines.findIndex((l) => l.startsWith('# '));
const head = lines.slice(0, h1idx + 1).join('\n');
const tail = lines.slice(h1idx + 1).join('\n').replace(/^\n+/, '');
fs.writeFileSync(CHANGELOG, `${head}\n\n${entry}${tail}`, 'utf8');

console.log(`\n✅ Built ${PKG_NAME} v${version}`);
console.log(`   -> ${path.relative(REPO, outFile)}`);
console.log(`   properties.xml stamped, version.json + CHANGELOG.md updated`);
