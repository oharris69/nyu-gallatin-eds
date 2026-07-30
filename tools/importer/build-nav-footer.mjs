/*
 * Build the nav and footer fragment documents (content/en/nav.plain.html and
 * content/en/footer.plain.html) that the header/footer blocks load via
 * loadFragment(). The live site is CAPTCHA-gated, so these are generated from
 * the authored source docs in migration-work/source/.
 *
 * EDS fragment .plain.html format: each top-level <div> in the source becomes a
 * section (the block JS reads nav.children[0..2] as brand/sections/tools, and
 * appends footer children directly). We emit each source top-level <div> as its
 * own <div>…</div> block, which is exactly the .plain.html section convention.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SCRIPTS_NM = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/node_modules';
const { JSDOM } = await import(pathToFileURL(`${SCRIPTS_NM}/jsdom/lib/api.js`).href);

const REPO = '/backups/oharris69/nyu-gallatin-eds/repo';
const OUT_DIR = path.join(REPO, 'content/en');

function build(srcFile, outFile) {
  const html = fs.readFileSync(path.join(REPO, 'migration-work/source', srcFile), 'utf8');
  const dom = new JSDOM(html);
  const body = dom.window.document.body;

  // Collect the top-level <div> sections (ignore <hr> separators used in source).
  const sections = [...body.children].filter((el) => el.tagName === 'DIV');

  // EDS .plain.html: sections are sibling <div> blocks. Join with newlines.
  const out = sections.map((sec) => sec.outerHTML.trim()).join('\n');

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${out}\n`, 'utf8');
  console.log(`✅ wrote ${path.relative(REPO, outFile)} (${sections.length} sections)`);
}

build('nav.html', path.join(OUT_DIR, 'nav.plain.html'));
build('footer.html', path.join(OUT_DIR, 'footer.plain.html'));
