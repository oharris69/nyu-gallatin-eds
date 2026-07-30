/* eslint-disable */
/* global WebImporter */

import contentFragmentParser from './parsers/content-fragment.js';
import cleanupTransformer from './transformers/gallatin-cleanup.js';
import sectionsTransformer from './transformers/gallatin-sections.js';

const parsers = {
  'content-fragment': contentFragmentParser,
};

const PAGE_TEMPLATE = {
  name: 'faculty',
  description: 'NYU Gallatin faculty/lecturer person-detail page: lecturer profile rendered from a Content Fragment, plus Courses, Work, and Commendations sections.',
  urls: ['https://gallatin.nyu.edu/academics/faculty/amanda-petrusich.html'],
  blocks: [
    { name: 'content-fragment', instances: ['section.cc--content-fragment'] },
  ],
  sections: [
    { id: 'f1', name: 'Lecturer Profile', selector: 'section.cc--content-fragment', style: null, blocks: ['content-fragment'], defaultContent: [] },
    { id: 'f2', name: 'Courses', selector: 'section.cc--chapter-section#courses', style: 'light', blocks: [], defaultContent: [] },
    { id: 'f3', name: 'Work', selector: 'section.cc--chapter-section#work', style: null, blocks: [], defaultContent: [] },
    { id: 'f4', name: 'Commendations', selector: 'section.cc--chapter-section#commendations', style: 'light', blocks: [], defaultContent: [] },
  ],
};

const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn.call(null, hookName, element, enhancedPayload); } catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
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

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    executeTransformers('beforeTransform', main, payload);
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try { parser(block.element, { document, url, params }); } catch (e) { console.error(`Failed to parse ${block.name}:`, e); }
      }
    });
    executeTransformers('afterTransform', main, payload);
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );
    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
