/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-faculty.js
  var import_faculty_exports = {};
  __export(import_faculty_exports, {
    default: () => import_faculty_default
  });

  // tools/importer/parsers/content-fragment.js
  function parse(element, { document }) {
    var _a;
    const cfPath = element.getAttribute("data-cf-path") || ((_a = element.querySelector("a[href]")) == null ? void 0 : _a.getAttribute("href")) || "";
    const variation = element.getAttribute("data-cf-variation") || "master";
    const style = element.getAttribute("data-cf-style") || "";
    if (!cfPath) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const refLink = document.createElement("a");
    refLink.href = cfPath;
    refLink.textContent = cfPath;
    const cells = [
      [refLink],
      [variation],
      [style]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "Content Fragment", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/gallatin-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      element.querySelectorAll("span > span:only-child").forEach((span) => {
        span.replaceWith(span.textContent);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "link",
        "noscript",
        "source"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-track");
      });
    }
  }

  // tools/importer/transformers/gallatin-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
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
  function topLevelUnder(el, container) {
    let n = el;
    while (n.parentElement && n.parentElement !== container) {
      n = n.parentElement;
    }
    return n;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const sections = payload && payload.template && payload.template.sections;
    if (!Array.isArray(sections) || sections.length < 2) return;
    const doc = element.ownerDocument;
    const resolved = sections.map((section) => ({
      section,
      el: resolveSection(element, section.selector)
    }));
    const matchedEls = resolved.filter((r) => r.el).map((r) => r.el);
    const container = commonContainer(matchedEls);
    if (!container) return;
    const nodes = resolved.map((r) => ({
      section: r.section,
      node: r.el ? topLevelUnder(r.el, container) : null
    }));
    for (let i = nodes.length - 1; i >= 0; i -= 1) {
      const { section, node } = nodes[i];
      if (!node) continue;
      if (section.style) {
        const smBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        node.after(smBlock);
      }
      if (i > 0) {
        node.before(doc.createElement("hr"));
      }
    }
  }

  // tools/importer/import-faculty.js
  var parsers = {
    "content-fragment": parse
  };
  var PAGE_TEMPLATE = {
    name: "faculty",
    description: "NYU Gallatin faculty/lecturer person-detail page: lecturer profile rendered from a Content Fragment, plus Courses, Work, and Commendations sections.",
    urls: ["https://gallatin.nyu.edu/academics/faculty/amanda-petrusich.html"],
    blocks: [
      { name: "content-fragment", instances: ["section.cc--content-fragment"] }
    ],
    sections: [
      { id: "f1", name: "Lecturer Profile", selector: "section.cc--content-fragment", style: null, blocks: ["content-fragment"], defaultContent: [] },
      { id: "f2", name: "Courses", selector: "section.cc--chapter-section#courses", style: "light", blocks: [], defaultContent: [] },
      { id: "f3", name: "Work", selector: "section.cc--chapter-section#work", style: null, blocks: [], defaultContent: [] },
      { id: "f4", name: "Commendations", selector: "section.cc--chapter-section#commendations", style: "light", blocks: [], defaultContent: [] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var import_faculty_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name}:`, e);
          }
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_faculty_exports);
})();
