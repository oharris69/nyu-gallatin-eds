/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: video
 * Base block: video
 * Source URL: https://gallatin.nyu.edu/
 * Generated: 2026-07-30
 *
 * Library convention: 1 column, 3 rows.
 *   Row 1: block name.
 *   Row 2: video source (link to video file / streaming URL).
 *   Row 3: optional poster image (this cell).
 *
 * Source (section.cc--full-width-video):
 *   - Kaltura embed: div.kaltura-video[data-video-id="1_28gzt3o8"] (no plain media file URL)
 *   - poster image: div.video-poster with background-image url(...)
 *   - title (h2), description (p), CTA link — kept as supporting content in the poster row
 *     so no page content is lost when the section element is replaced.
 *
 * xwalk field hinting (blocks/video/_video.json -> video model):
 *   videoUrl (text, required) — the only model field. Kaltura has no direct file URL,
 *   so we reconstruct a stable Kaltura playback URL from the data-video-id (entryId)
 *   so the reference round-trips through HTML -> markdown -> JCR.
 */
export default function parse(element, { document }) {
  const title = element.querySelector('.f--section-title, h2');
  const description = element.querySelector('.f--description');
  const cta = element.querySelector('.links-container a, a.link');

  // Kaltura entry id -> reconstructed playback URL so the reference round-trips.
  const kaltura = element.querySelector('.kaltura-video[data-video-id], [data-video-id]');
  const videoId = kaltura ? kaltura.getAttribute('data-video-id') : '';

  // Poster image lives in a background-image style; rebuild it as an <img>.
  const poster = element.querySelector('.video-poster, [style*="background-image"]');
  let posterImg = null;
  if (poster) {
    const style = poster.getAttribute('style') || '';
    const match = style.match(/url\((['"]?)(.*?)\1\)/i);
    if (match && match[2]) {
      posterImg = document.createElement('img');
      posterImg.src = match[2];
      posterImg.alt = title ? title.textContent.trim() : 'Video poster';
    }
  }

  if (!videoId && !posterImg && !title) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Kaltura entries are addressable by entryId; a full CDN player URL cannot be
  // built without the partner/uiconf ids (not present in source), so emit a
  // canonical Kaltura embed URL that preserves the entryId.
  const videoUrl = videoId
    ? `https://cdnapisec.kaltura.com/html5/html5lib/v2.104/mwEmbedFrame.php?wid=_&entry_id=${videoId}`
    : '';

  const cells = [];

  // Row 2: video source (field:videoUrl).
  const sourceCell = [document.createComment(' field:videoUrl ')];
  if (videoUrl) {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.textContent = videoUrl;
    sourceCell.push(link);
  }
  cells.push([sourceCell]);

  // Row 3: poster image + supporting content (title / description / CTA) so no
  // content from the replaced section is lost.
  const posterCell = [];
  if (posterImg) posterCell.push(posterImg);
  if (title) posterCell.push(title);
  if (description) posterCell.push(description);
  if (cta) posterCell.push(cta);
  if (posterCell.length) cells.push([posterCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'video', cells });
  element.replaceWith(block);
}
