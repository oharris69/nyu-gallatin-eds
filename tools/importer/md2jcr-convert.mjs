/*
 * Convert imported EDS content (markdown / .plain.html) to JCR XML using
 * @adobe/helix-md2jcr, then assemble a FileVault package tree under jcr_root/.
 *
 * Live site is CAPTCHA-gated; conversion is fully local. Images reference the
 * external DAM (/content/dam/nyugallatin/...) and are NOT included in the package.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = '/backups/oharris69/nyu-gallatin-eds/repo';
const md2jcrMod = await import(pathToFileURL(path.join(REPO, 'node_modules/@adobe/helix-md2jcr/src/index.js')).href);
const md2jcr = md2jcrMod.md2jcr || md2jcrMod.default;

const models = JSON.parse(fs.readFileSync(path.join(REPO, 'component-models.json'), 'utf8'));
const definition = JSON.parse(fs.readFileSync(path.join(REPO, 'component-definition.json'), 'utf8'));
const filters = JSON.parse(fs.readFileSync(path.join(REPO, 'component-filters.json'), 'utf8'));

const opts = { models, definition, filters };

// site path under jcr_root
const SITE = 'content/nyu-gallatin-eds';
const JCR_ROOT = path.join(REPO, 'jcr_root');

// Documents to convert: { md source, jcr path (under site) }
const DOCS = [
  { md: 'content/index.md', jcr: `${SITE}/index` },
  { md: 'content/en/nav.md', html: 'content/en/nav.plain.html', jcr: `${SITE}/en/nav` },
  { md: 'content/en/footer.md', html: 'content/en/footer.plain.html', jcr: `${SITE}/en/footer` },
  { md: 'content/academics/faculty/amanda-petrusich.md', jcr: `${SITE}/academics/faculty/amanda-petrusich` },
];

// md2jcr needs markdown; nav/footer only have .plain.html. Wrap their HTML as a
// trivial markdown doc (md2jcr accepts HTML tables/blocks embedded in md, and
// nav/footer are plain default content — lists/links — which pass through).
function sourceMarkdown(doc) {
  if (fs.existsSync(path.join(REPO, doc.md))) return fs.readFileSync(path.join(REPO, doc.md), 'utf8');
  // Fallback: use the .plain.html directly as the document body.
  return fs.readFileSync(path.join(REPO, doc.html), 'utf8');
}

/*
 * Post-process md2jcr output to fix two known serialization artifacts:
 *  1. Bare `&` inside attribute values (e.g. Kaltura URL query strings) that
 *     md2jcr does not entity-encode — invalid XML. Encode `&` not already part
 *     of an entity (&amp; &lt; &gt; &quot; &apos; &#...;).
 *  2. Stray `item1="[object Object]"` attribute md2jcr emits on carousel
 *     container blocks (the repeated items already serialize as item_N child
 *     nodes; this attribute is spurious).
 */
function sanitizeXml(xml) {
  let out = xml.replace(/item\d+="\[object Object\]"\s*/g, '');
  out = out.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');
  return out;
}

const results = [];
for (const doc of DOCS) {
  const md = sourceMarkdown(doc);
  let xml;
  try {
    xml = await md2jcr(md, opts);
  } catch (e) {
    console.error(`✗ md2jcr failed for ${doc.jcr}: ${e.message}`);
    results.push({ jcr: doc.jcr, ok: false, error: e.message });
    continue;
  }
  const outDir = path.join(JCR_ROOT, doc.jcr);
  xml = sanitizeXml(xml);
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, '.content.xml');
  fs.writeFileSync(outFile, xml, 'utf8');
  console.log(`✓ ${doc.jcr}/.content.xml (${xml.length} bytes)`);
  results.push({ jcr: doc.jcr, ok: true, bytes: xml.length });
}

console.log('\nSummary:', JSON.stringify(results, null, 2));
