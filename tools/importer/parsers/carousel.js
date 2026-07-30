/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: carousel
 * Base block: carousel (container block; child slides use the `carousel-item` model)
 * Source URL: https://gallatin.nyu.edu/
 * Generated: 2026-07-30
 *
 * Library convention (authoritative):
 *   Row 1: block name.
 *   Each subsequent row = one slide with cells:
 *     - Image cell  -> field:media_image (reference); alt collapses into media_imageAlt.
 *     - Text cell   -> field:content_text (richtext): title / quote / description / CTA grouped.
 *
 * Handles THREE source instances that share this parser:
 *   A. section.cc--hero-home              — slides in .swiper-slide (image + "At Gallatin" quote + attribution + "After Gallatin" quote + CTA)
 *   B. section.cc--tabbed-stories-carousel — slides in .tabbed-stories-carousel-slide.swiper-slide (hidden pane-title + quote + CTA + image)
 *   C. section.cc--gallery                — slides in .item.swiper-slide (image + title + description + CTA)
 * All three slide types carry the .swiper-slide class, so one selector covers them.
 */
export default function parse(element, { document }) {
  // Select slides across all three carousel variants (all use .swiper-slide).
  let slides = Array.from(element.querySelectorAll('.swiper-slide'));
  if (!slides.length) {
    // Fallbacks for DOM variation across pages.
    slides = Array.from(element.querySelectorAll('.item, .tabbed-stories-carousel-slide'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // --- Image (media_image) ---
    // hero uses .media-wrapper img; tabbed & gallery use a direct <img>.
    const img = slide.querySelector('.media-wrapper img, img');

    // --- Text content (content_text) ---
    // Collect text pieces in DOM order using mutually-exclusive selectors:
    //   .hero-home-desc   -> hero "At Gallatin" / "After Gallatin" quotes
    //   .attribution      -> hero attribution
    //   .f--cta-title     -> gallery card title (contains <h3>)
    //   h3.pane-title     -> tabbed hidden pane title
    //   .f--description   -> tabbed / gallery description or quote
    //   .links-container a -> CTA link(s)
    const textPieces = Array.from(
      slide.querySelectorAll('.hero-home-desc, .attribution, .f--cta-title, h3.pane-title, .f--description, .links-container a')
    );

    // Skip slides that have neither image nor text.
    if (!img && textPieces.length === 0) return;

    // Image cell: field hint (alt is collapsed into media_imageAlt, no separate hint).
    const imageCell = [document.createComment(' field:media_image ')];
    if (img) imageCell.push(img);

    // Text cell: field hint + grouped rich text content.
    const textCell = [document.createComment(' field:content_text ')];
    textPieces.forEach((el) => textCell.push(el));

    cells.push([imageCell, textCell]);
  });

  // Empty-block guard: nothing extracted -> unwrap children so content is not lost.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
