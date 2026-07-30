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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/cards.js
  function parse(element, { document }) {
    let cards = Array.from(element.querySelectorAll("li.card, a.item"));
    if (!cards.length) cards = Array.from(element.querySelectorAll(".card, .item"));
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector("img");
      const textPieces = Array.from(
        card.querySelectorAll(".f--cta-title, .f--sub-title, .f--description")
      );
      if (!img && textPieces.length === 0) return;
      const imageCell = [document.createComment(" field:image ")];
      if (img) imageCell.push(img);
      const textCell = [document.createComment(" field:text ")];
      const href = card.matches("a[href]") ? card.getAttribute("href") : null;
      if (href) {
        const link = document.createElement("a");
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
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel.js
  function parse2(element, { document }) {
    let slides = Array.from(element.querySelectorAll(".swiper-slide"));
    if (!slides.length) {
      slides = Array.from(element.querySelectorAll(".item, .tabbed-stories-carousel-slide"));
    }
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector(".media-wrapper img, img");
      const textPieces = Array.from(
        slide.querySelectorAll(".hero-home-desc, .attribution, .f--cta-title, h3.pane-title, .f--description, .links-container a")
      );
      if (!img && textPieces.length === 0) return;
      const imageCell = [document.createComment(" field:media_image ")];
      if (img) imageCell.push(img);
      const textCell = [document.createComment(" field:content_text ")];
      textPieces.forEach((el) => textCell.push(el));
      cells.push([imageCell, textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse3(element, { document }) {
    const isStats = element.matches(".cc--stats") || !!element.querySelector(".items-container .item");
    const isFullWidthCta = element.matches(".cc--full-width-cta") || !!element.querySelector(".text-wrapper.bg-orange") && !!element.querySelector(".links-container");
    const row = [];
    if (isStats) {
      const img = element.querySelector("img");
      if (img) row.push([img]);
      const intro = element.querySelector(".title-desc-container");
      if (intro) row.push([intro]);
      const stats = Array.from(element.querySelectorAll(".items-container .item"));
      stats.forEach((stat) => row.push([stat]));
    } else if (isFullWidthCta) {
      const textWrapper = element.querySelector(".text-wrapper");
      const img = element.querySelector("img");
      const links = element.querySelector(".links-container");
      row.push(textWrapper ? [textWrapper] : [""]);
      row.push(img ? [img] : [""]);
      const linksCell = links ? Array.from(links.querySelectorAll("a")) : [];
      row.push(linksCell.length ? linksCell : [""]);
    } else {
      const img = element.querySelector("img");
      const textCell = [];
      const title = element.querySelector(".f--section-title");
      const description = element.querySelector(".f--description");
      const ctaLinks = Array.from(element.querySelectorAll(".links-container a"));
      if (title) textCell.push(title);
      if (description) textCell.push(description);
      ctaLinks.forEach((a) => textCell.push(a));
      row.push(img ? [img] : [""]);
      row.push(textCell.length ? textCell : [""]);
    }
    const hasContent = row.some((cell) => cell.some((c) => c && c !== ""));
    if (!hasContent) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed.js
  function parse4(element, { document }) {
    const script = element.querySelector("script[src]");
    const iframe = element.querySelector("iframe[src]");
    const anchor = element.querySelector("a[href]");
    const embedUri = script && script.getAttribute("src") || iframe && iframe.getAttribute("src") || anchor && anchor.getAttribute("href") || "";
    const img = element.querySelector("img");
    if (!embedUri && !img) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cell = [];
    if (img) {
      cell.push(document.createComment(" field:embed_placeholder "));
      cell.push(img);
    }
    cell.push(document.createComment(" field:embed_uri "));
    if (embedUri) {
      const link = document.createElement("a");
      link.href = embedUri;
      link.textContent = embedUri;
      cell.push(link);
    }
    const cells = [[cell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "embed", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video.js
  function parse5(element, { document }) {
    const title = element.querySelector(".f--section-title, h2");
    const description = element.querySelector(".f--description");
    const cta = element.querySelector(".links-container a, a.link");
    const kaltura = element.querySelector(".kaltura-video[data-video-id], [data-video-id]");
    const videoId = kaltura ? kaltura.getAttribute("data-video-id") : "";
    const poster = element.querySelector('.video-poster, [style*="background-image"]');
    let posterImg = null;
    if (poster) {
      const style = poster.getAttribute("style") || "";
      const match = style.match(/url\((['"]?)(.*?)\1\)/i);
      if (match && match[2]) {
        posterImg = document.createElement("img");
        posterImg.src = match[2];
        posterImg.alt = title ? title.textContent.trim() : "Video poster";
      }
    }
    if (!videoId && !posterImg && !title) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const videoUrl = videoId ? `https://cdnapisec.kaltura.com/html5/html5lib/v2.104/mwEmbedFrame.php?wid=_&entry_id=${videoId}` : "";
    const cells = [];
    const sourceCell = [document.createComment(" field:videoUrl ")];
    if (videoUrl) {
      const link = document.createElement("a");
      link.href = videoUrl;
      link.textContent = videoUrl;
      sourceCell.push(link);
    }
    cells.push([sourceCell]);
    const posterCell = [];
    if (posterImg) posterCell.push(posterImg);
    if (title) posterCell.push(title);
    if (description) posterCell.push(description);
    if (cta) posterCell.push(cta);
    if (posterCell.length) cells.push([posterCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "video", cells });
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

  // tools/importer/import-homepage.js
  var parsers = {
    cards: parse,
    carousel: parse2,
    columns: parse3,
    embed: parse4,
    video: parse5
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "NYU Gallatin homepage (tc--home template): hero carousel of alumni, 50-50 features, full-width video, tabbed faculty stories, stats module, full-width CTA, image gallery, portrait cards, and news article cards.",
    urls: ["https://gallatin.nyu.edu/"],
    blocks: [
      { name: "carousel", instances: ["section.cc--hero-home"], section: "hero" },
      { name: "columns", instances: ["section.cc--50-50-feature.bg-violet"], section: "violet" },
      { name: "video", instances: ["section.cc--full-width-video"] },
      { name: "carousel", instances: ["section.cc--tabbed-stories-carousel"], section: "violet" },
      { name: "columns", instances: ["section.cc--stats"] },
      { name: "columns", instances: ["section.cc--full-width-cta"], section: "orange" },
      { name: "columns", instances: ["section.cc--50-50-feature.bg-white"] },
      { name: "carousel", instances: ["section.cc--gallery"] },
      { name: "cards", instances: ["section.cc--portrait-image-cards"], section: "violet" },
      { name: "cards", instances: ["section.cc--article-cards"], section: "violet" },
      { name: "embed", instances: ["div.cc--code-embed"] }
    ],
    sections: [
      { id: "s1", name: "Hero Carousel", selector: "div.hero-home", style: "deep-violet", blocks: ["carousel"], defaultContent: [] },
      { id: "s2", name: "It's Your Journey", selector: "section.cc--50-50-feature.bg-violet", style: "violet", blocks: ["columns"], defaultContent: [] },
      { id: "s3", name: "Discovery Video", selector: "div.full-width-video", style: null, blocks: ["video"], defaultContent: [] },
      { id: "s4", name: "Meet Your Guides", selector: "section.cc--tabbed-stories-carousel", style: "violet", blocks: ["carousel"], defaultContent: [] },
      { id: "s5", name: "The Gallatin Effect (stats)", selector: "section.cc--stats", style: "light", blocks: ["columns"], defaultContent: [] },
      { id: "s6", name: "Ready to Begin CTA", selector: "section.cc--full-width-cta", style: "orange", blocks: ["columns"], defaultContent: [] },
      { id: "s7", name: "Learn Without Walls", selector: "section.cc--50-50-feature.bg-white", style: "light", blocks: ["columns"], defaultContent: [] },
      { id: "s8", name: "Culture of Collaboration Gallery", selector: "section.cc--gallery", style: null, blocks: ["carousel"], defaultContent: [] },
      { id: "s9", name: "Community of Individuals", selector: "section.cc--portrait-image-cards", style: "violet", blocks: ["cards"], defaultContent: [] },
      { id: "s10", name: "News and Stories", selector: "section.cc--article-cards", style: "violet", blocks: ["cards"], defaultContent: [] },
      { id: "s11", name: "Code Embed", selector: "div.cc--code-embed", style: null, blocks: ["embed"], defaultContent: [] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
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
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
