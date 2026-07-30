/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsParser from './parsers/cards.js';
import carouselParser from './parsers/carousel.js';
import columnsParser from './parsers/columns.js';
import embedParser from './parsers/embed.js';
import videoParser from './parsers/video.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/gallatin-cleanup.js';
import sectionsTransformer from './transformers/gallatin-sections.js';

// PARSER REGISTRY
const parsers = {
  cards: cardsParser,
  carousel: carouselParser,
  columns: columnsParser,
  embed: embedParser,
  video: videoParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (template "homepage")
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'NYU Gallatin homepage (tc--home template): hero carousel of alumni, 50-50 features, full-width video, tabbed faculty stories, stats module, full-width CTA, image gallery, portrait cards, and news article cards.',
  urls: ['https://gallatin.nyu.edu/'],
  blocks: [
    { name: 'carousel', instances: ['section.cc--hero-home'], section: 'hero' },
    { name: 'columns', instances: ['section.cc--50-50-feature.bg-violet'], section: 'violet' },
    { name: 'video', instances: ['section.cc--full-width-video'] },
    { name: 'carousel', instances: ['section.cc--tabbed-stories-carousel'], section: 'violet' },
    { name: 'columns', instances: ['section.cc--stats'] },
    { name: 'columns', instances: ['section.cc--full-width-cta'], section: 'orange' },
    { name: 'columns', instances: ['section.cc--50-50-feature.bg-white'] },
    { name: 'carousel', instances: ['section.cc--gallery'] },
    { name: 'cards', instances: ['section.cc--portrait-image-cards'], section: 'violet' },
    { name: 'cards', instances: ['section.cc--article-cards'], section: 'violet' },
    { name: 'embed', instances: ['div.cc--code-embed'] },
  ],
  sections: [
    { id: 's1', name: 'Hero Carousel', selector: 'div.hero-home', style: 'deep-violet', blocks: ['carousel'], defaultContent: [] },
    { id: 's2', name: "It's Your Journey", selector: 'section.cc--50-50-feature.bg-violet', style: 'violet', blocks: ['columns'], defaultContent: [] },
    { id: 's3', name: 'Discovery Video', selector: 'div.full-width-video', style: null, blocks: ['video'], defaultContent: [] },
    { id: 's4', name: 'Meet Your Guides', selector: 'section.cc--tabbed-stories-carousel', style: 'violet', blocks: ['carousel'], defaultContent: [] },
    { id: 's5', name: 'The Gallatin Effect (stats)', selector: 'section.cc--stats', style: 'light', blocks: ['columns'], defaultContent: [] },
    { id: 's6', name: 'Ready to Begin CTA', selector: 'section.cc--full-width-cta', style: 'orange', blocks: ['columns'], defaultContent: [] },
    { id: 's7', name: 'Learn Without Walls', selector: 'section.cc--50-50-feature.bg-white', style: 'light', blocks: ['columns'], defaultContent: [] },
    { id: 's8', name: 'Culture of Collaboration Gallery', selector: 'section.cc--gallery', style: null, blocks: ['carousel'], defaultContent: [] },
    { id: 's9', name: 'Community of Individuals', selector: 'section.cc--portrait-image-cards', style: 'violet', blocks: ['cards'], defaultContent: [] },
    { id: 's10', name: 'News and Stories', selector: 'section.cc--article-cards', style: 'violet', blocks: ['cards'], defaultContent: [] },
    { id: 's11', name: 'Code Embed', selector: 'div.cc--code-embed', style: null, blocks: ['embed'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY (section transformer runs after cleanup, only when 2+ sections)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 */
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
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. discover blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. parse each block (skip elements already replaced)
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

    // 4. afterTransform cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index',
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
