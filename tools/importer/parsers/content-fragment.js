/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: content-fragment
 * Base block: content-fragment ("Content Fragment")
 * Source: faculty person-detail page (lecturer profile)
 *
 * The content-fragment block (blocks/content-fragment/content-fragment.js) reads:
 *   row 1 -> a link whose text/href is the CF path (reference / aem-content-fragment)
 *   row 2 -> the variation name (default 'master')
 *   row 3 -> the display style (e.g. image-left / image-right / image-top)
 *
 * Source element carries data attributes:
 *   data-cf-path, data-cf-variation, data-cf-style
 * with a fallback <a href> to the CF path.
 */
export default function parse(element, { document }) {
  const cfPath = element.getAttribute('data-cf-path')
    || element.querySelector('a[href]')?.getAttribute('href')
    || '';
  const variation = element.getAttribute('data-cf-variation') || 'master';
  const style = element.getAttribute('data-cf-style') || '';

  if (!cfPath) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Row 1: CF reference as a link (path as both href and text).
  const refLink = document.createElement('a');
  refLink.href = cfPath;
  refLink.textContent = cfPath;

  const cells = [
    [refLink],
    [variation],
    [style],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'Content Fragment', cells });
  element.replaceWith(block);
}
