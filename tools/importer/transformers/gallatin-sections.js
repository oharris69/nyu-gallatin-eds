/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: NYU Gallatin section breaks + section metadata.
 *
 * Runs in afterTransform only. Reads payload.template.sections and, for the
 * homepage template's 11 sections, inserts an <hr> before every non-first
 * section and a "Section Metadata" block (style cell) after every section that
 * declares a style.
 *
 * Selectors come from tools/importer/page-templates.json, verified against
 * migration-work/cleaned.html. Note the mixed depth of the template selectors:
 *   - s1 "div.hero-home" / s3 "div.full-width-video" target the top-level
 *     wrapper <div> that is a direct child of div.content-main.
 *   - s2, s4–s10 target the inner "section.cc--*" element nested one level
 *     inside its wrapper <div>.
 *   - s11 "section.cc--code-embed" does not exist as a <section>; the real node
 *     is <div class="cc--code-embed"> (cleaned.html line 320). A tag-tolerant
 *     resolver handles this.
 * To keep <hr>/metadata at a consistent level, every matched element is climbed
 * to its top-level ancestor under the sections' common container.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

// Resolve a section selector, tolerating a wrong leading tag name.
// e.g. "section.cc--code-embed" falls back to ".cc--code-embed".
function resolveSection(root, selector) {
  let el = root.querySelector(selector);
  if (el) return el;
  const tagMatch = selector.match(/^[a-zA-Z][\w-]*(?=[.#])/);
  if (tagMatch) {
    const classPart = selector.slice(tagMatch[0].length);
    if (classPart) {
      el = root.querySelector(classPart);
      if (el) return el;
    }
  }
  return null;
}

function ancestorChain(el) {
  const chain = [];
  let n = el;
  while (n) {
    chain.push(n);
    n = n.parentElement;
  }
  return chain;
}

// Closest common ancestor of all resolved section elements.
function commonContainer(elements) {
  if (!elements.length) return null;
  let common = ancestorChain(elements[0]);
  for (let i = 1; i < elements.length; i += 1) {
    const set = new Set(ancestorChain(elements[i]));
    common = common.filter((a) => set.has(a));
    if (!common.length) return null;
  }
  return common[0];
}

// Climb from a matched element to the ancestor that is a direct child of the
// common container, so inserts sit at the section level.
function topLevelUnder(el, container) {
  let n = el;
  while (n.parentElement && n.parentElement !== container) {
    n = n.parentElement;
  }
  return n;
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const sections = payload && payload.template && payload.template.sections;
  if (!Array.isArray(sections) || sections.length < 2) return;

  const doc = element.ownerDocument;

  // Resolve each section to its top-level node, preserving template order.
  const resolved = sections.map((section) => ({
    section,
    el: resolveSection(element, section.selector),
  }));

  const matchedEls = resolved.filter((r) => r.el).map((r) => r.el);
  const container = commonContainer(matchedEls);
  if (!container) return;

  const nodes = resolved.map((r) => ({
    section: r.section,
    node: r.el ? topLevelUnder(r.el, container) : null,
  }));

  // Process in reverse so earlier inserts do not shift later reference nodes.
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const { section, node } = nodes[i];
    if (!node) continue;

    // Section Metadata block for the preceding section, placed right before
    // the following <hr> break (EDS: last block in a section carries its meta).
    if (section.style) {
      const smBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      node.after(smBlock);
    }

    // Section break before every section except the first.
    if (i > 0) {
      node.before(doc.createElement('hr'));
    }
  }
}
