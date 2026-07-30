/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards
 * Base block: cards (container block; child items use the `card` model)
 * Source URL: https://gallatin.nyu.edu/
 * Generated: 2026-07-30
 *
 * Library convention: container block. Row 1 = block name. Each subsequent row
 * = one card, with two cells:
 *   Cell 1 image (reference) -> field:image ; alt collapses into imageAlt. May be
 *          empty but must still be present.
 *   Cell 2 text  (richtext)  -> field:text  ; grouped title / subtitle / quote /
 *          description / CTA rendered as rich text.
 *
 * Handles TWO source instances that share this parser:
 *   A. section.cc--portrait-image-cards — ul.cards-wrapper > li.card
 *        each card = image + quote(.f--description) + name(.f--cta-title h3) + subtitle(.f--sub-title h3)
 *   B. section.cc--article-cards — a.item (linked card)
 *        each card = image + title(.article-card-title h3) + description(.f--description); whole card is a link
 */
export default function parse(element, { document }) {
  // Portrait cards are <li class="card">; article cards are <a class="item">.
  let cards = Array.from(element.querySelectorAll('li.card, a.item'));
  if (!cards.length) cards = Array.from(element.querySelectorAll('.card, .item'));

  const cells = [];

  cards.forEach((card) => {
    const img = card.querySelector('img');

    // Text pieces in DOM order, mutually-exclusive selectors:
    //   .f--cta-title   -> name (portrait) / title (article), contains <h3>
    //   .f--sub-title   -> subtitle (portrait, e.g. "BA '28")
    //   .f--description -> quote (portrait) / description (article)
    const textPieces = Array.from(
      card.querySelectorAll('.f--cta-title, .f--sub-title, .f--description')
    );

    if (!img && textPieces.length === 0) return;

    // Image cell (alt collapses into imageAlt, no separate hint). Cell always
    // present per convention, even when no image.
    const imageCell = [document.createComment(' field:image ')];
    if (img) imageCell.push(img);

    // Text cell. For article cards the whole card is a link (a.item) — wrap the
    // grouped text in a preserved anchor so the article href round-trips.
    const textCell = [document.createComment(' field:text ')];
    const href = card.matches('a[href]') ? card.getAttribute('href') : null;
    if (href) {
      const link = document.createElement('a');
      link.href = href;
      textPieces.forEach((el) => link.appendChild(el));
      textCell.push(link);
    } else {
      textPieces.forEach((el) => textCell.push(el));
    }

    cells.push([imageCell, textCell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
