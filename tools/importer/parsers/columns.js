/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: columns
 * Base block: columns (core Columns component)
 * Source URL: https://gallatin.nyu.edu/
 * Generated: 2026-07-30
 *
 * Library convention: row 1 = block name; row 2 = as many cells as columns
 * needed, mapped left-to-right to the visual columns; additional rows must
 * have the same column count. Per the field-hinting rules, Columns blocks do
 * NOT use field:xyz comments — cells hold default content. Emits a SINGLE
 * content row.
 *
 * Handles FOUR source instances that share this parser:
 *   A. section.cc--50-50-feature.bg-violet — [ image | text(h2 + description + CTA) ]
 *   B. section.cc--50-50-feature.bg-white  — [ image | text(h2 + description + 2 CTAs) ]
 *   C. section.cc--stats                   — [ image | intro(title+desc+CTA) | stat | stat | stat ]
 *   D. section.cc--full-width-cta          — [ text(h2 + description) | image | CTAs ]
 */
export default function parse(element, { document }) {
  const isStats = element.matches('.cc--stats') || !!element.querySelector('.items-container .item');
  const isFullWidthCta = element.matches('.cc--full-width-cta')
    || (!!element.querySelector('.text-wrapper.bg-orange') && !!element.querySelector('.links-container'));

  const row = [];

  if (isStats) {
    // Instance C: image, intro block, then one cell per stat item.
    const img = element.querySelector('img');
    if (img) row.push([img]);

    const intro = element.querySelector('.title-desc-container');
    if (intro) row.push([intro]);

    const stats = Array.from(element.querySelectorAll('.items-container .item'));
    stats.forEach((stat) => row.push([stat]));
  } else if (isFullWidthCta) {
    // Instance D: text (heading + description) | image | CTA links.
    const textWrapper = element.querySelector('.text-wrapper');
    const img = element.querySelector('img');
    const links = element.querySelector('.links-container');

    row.push(textWrapper ? [textWrapper] : ['']);
    row.push(img ? [img] : ['']);

    // Individual CTA anchors as default content in the third column.
    const linksCell = links ? Array.from(links.querySelectorAll('a')) : [];
    row.push(linksCell.length ? linksCell : ['']);
  } else {
    // Instances A & B: 50-50 feature — image | text(title + description + CTAs).
    const img = element.querySelector('img');

    const textCell = [];
    const title = element.querySelector('.f--section-title');
    const description = element.querySelector('.f--description');
    const ctaLinks = Array.from(element.querySelectorAll('.links-container a'));
    if (title) textCell.push(title);
    if (description) textCell.push(description);
    ctaLinks.forEach((a) => textCell.push(a));

    row.push(img ? [img] : ['']);
    row.push(textCell.length ? textCell : ['']);
  }

  // Empty-block guard: true if any cell holds a real (non-empty-string) node.
  const hasContent = row.some((cell) => cell.some((c) => c && c !== ''));
  if (!hasContent) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
