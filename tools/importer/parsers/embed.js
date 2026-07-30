/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: embed
 * Base block: embed
 * Source URL: https://gallatin.nyu.edu/
 * Generated: 2026-07-30
 *
 * Library convention: 1 column, 2 rows.
 *   Row 1: block name.
 *   Row 2: a SINGLE cell containing the URL to the external content. Optionally an
 *          image (poster) may be placed ABOVE the link in the SAME cell.
 *
 * embed model fields (blocks/embed/_embed.json from project library):
 *   embed_placeholder    (reference) -> field:embed_placeholder ; optional poster, before link.
 *   embed_placeholderAlt (Alt)       -> collapsed into the placeholder image, no hint.
 *   embed_uri            (text)      -> field:embed_uri ; the embed/source URL.
 *
 * Source (section.cc--code-embed):
 *   <script async src="https://connect.nyu.edu/ping"></script> — a code embed with
 *   no placeholder image. We emit the script src as a link so it can be re-embedded.
 */
export default function parse(element, { document }) {
  // Find the embed source: prefer a <script src>, fall back to iframe/anchor.
  const script = element.querySelector('script[src]');
  const iframe = element.querySelector('iframe[src]');
  const anchor = element.querySelector('a[href]');
  const embedUri = (script && script.getAttribute('src'))
    || (iframe && iframe.getAttribute('src'))
    || (anchor && anchor.getAttribute('href'))
    || '';

  // Optional placeholder image (none in this source, but handle variation).
  const img = element.querySelector('img');

  if (!embedUri && !img) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single content cell: optional placeholder image ABOVE the embed URI link.
  const cell = [];
  if (img) {
    cell.push(document.createComment(' field:embed_placeholder '));
    cell.push(img);
  }
  cell.push(document.createComment(' field:embed_uri '));
  if (embedUri) {
    const link = document.createElement('a');
    link.href = embedUri;
    link.textContent = embedUri;
    cell.push(link);
  }

  const cells = [[cell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'embed', cells });
  element.replaceWith(block);
}
