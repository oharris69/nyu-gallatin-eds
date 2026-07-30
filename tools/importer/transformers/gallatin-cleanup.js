/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: NYU Gallatin site-wide cleanup.
 *
 * All selectors below are verified against migration-work/cleaned.html.
 * The scraped source already begins at <main id="content"> and contains no
 * site chrome (no header, footer, nav, breadcrumbs, sidebar, search, or cookie
 * banner), so cleanup here is limited to defensive removal of standard
 * non-authorable element types and normalization of leftover attributes.
 *
 * NOTE: <script async src="https://connect.nyu.edu/ping"> inside
 * div.code-embed (cleaned.html line 321) is intentionally NOT removed here —
 * it is the authorable payload of the code-embed block and is handled by the
 * embed parser.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Unwrap redundant single-child <span> nesting if present (defensive;
    // WebImporter markdown conversion prefers flat inline text).
    element.querySelectorAll('span > span:only-child').forEach((span) => {
      span.replaceWith(span.textContent);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Safe, standard non-authorable element types. These are element-type
    // removals (per the reference guide's "safe element removal" list), not
    // guessed class/id selectors. None currently present in this pre-cleaned
    // source, but included so the transformer is robust across pages that
    // reuse this template.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'noscript',
      'source',
    ]);

    // Strip non-authorable tracking/handler attributes wherever present.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
    });
  }
}
