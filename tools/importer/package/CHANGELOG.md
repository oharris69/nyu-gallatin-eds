# nyu-gallatin-homepage — package changelog

## 1.4.6 — 2026-07-30T09:00:00Z
- Consolidate CF models under /conf/nyu-gallatin-eds (matches Config Browser container + DAM folder binding); ship v1.4.5-correct models with mode=replace to overwrite stale root-node-metadata copies; repoint CF instances cq:model
- Artifact: dist/nyu-gallatin-homepage-1.4.6.zip

## 1.4.5 — 2026-07-30T08:00:00Z
- Move CF model metadata (jcr:title, status, allowedPaths, description) from cq:Template root node to jcr:content, where AEMaaCS reads it; root-node placement (AEM 6.x scaffolding style) left status unreadable so the New CF dialog filtered our models out
- Artifact: dist/nyu-gallatin-homepage-1.4.5.zip

## 1.4.4 — 2026-07-30T07:00:00Z
- Fix faculty-profile multi-value fields (education, researchInterests): use textfield + multiple=true + valueType string[] (CF model pattern) instead of Granite multifield wrapper, which AEM could not parse (installed with no name/valueType)
- Artifact: dist/nyu-gallatin-homepage-1.4.4.zip

## 1.4.3 — 2026-07-30T06:00:00Z
- Deliver CF models into AEM-validated /conf/nyu (Content Fragment Models enabled) instead of hand-authored /conf/nyu-gallatin-eds; repoint CF instances cq:model to /conf/nyu; drop stale container
- Artifact: dist/nyu-gallatin-homepage-1.4.3.zip

## 1.4.2 — 2026-07-30T05:00:00Z
- Add cq:templateType=/libs/settings/dam/cfm/model-types/fragment to both CF models so AEM recognizes them as Content Fragment models and lists them in the New CF dialog
- Artifact: dist/nyu-gallatin-homepage-1.4.2.zip

## 1.4.1 — 2026-07-30T04:00:00Z
- Register /conf/nyu-gallatin-eds as a titled config container ('NYU Gallatin EDS') so CF models appear in the Content Fragment Models console; broaden filter to whole /conf/nyu-gallatin-eds
- Artifact: dist/nyu-gallatin-homepage-1.4.1.zip

## 1.4.0 — 2026-07-30T03:00:00Z
- Add rich faculty-profile CF model + Amanda Petrusich faculty CF (name/role/dept/email/pronouns/shortBio/bio/education/researchInterests/publications/awards); repoint faculty page to new CF
- Artifact: dist/nyu-gallatin-homepage-1.4.0.zip

## 1.3.2 — 2026-07-30T02:00:00Z
- Header polish: white bold menu labels, compact dark utility pill, single caret, two-row layout
- Artifact: dist/nyu-gallatin-homepage-1.3.2.zip

## 1.3.1 — 2026-07-30T01:00:00Z
- Nav sections need unique node names (section/section_1/section_2); JCR kept only last on import
- Artifact: dist/nyu-gallatin-homepage-1.3.1.zip

## 1.3.0 — 2026-07-30T00:00:00Z
- Split nav into brand/sections/tools sections (fixes flat/expanded menu); violet banner via --nav-background-color token; scoped brand logo mask
- Artifact: dist/nyu-gallatin-homepage-1.3.0.zip

## 1.2.1 — 2026-07-30T20:05:00Z
- Fix nav logo: render the NYU Gallatin wordmark via CSS mask on .nav-brand instead of a franklin image node (which produced src=about:error for the static /icons/ SVG). Brand reverts to accessible text link.
- Artifact: dist/nyu-gallatin-homepage-1.2.1.zip

## 1.2.0 — 2026-07-30T19:35:00Z
- Add NYU Gallatin logo SVG (icons/) wired into nav brand; header JS null-guards for nested-ul nav (no more toggleAllNavSections crash).
- Artifact: dist/nyu-gallatin-homepage-1.2.0.zip

## 1.1.1 — 2026-07-30T19:08:00Z
- Fix CF instance XML that broke install: removed duplicate jcr:primaryType on <master> and invalid @ContentType attribute names. Amanda Petrusich CF now installs cleanly.
- Artifact: dist/nyu-gallatin-homepage-1.1.1.zip

## 1.1.0 — 2026-07-30T18:55:00Z
- Content under language-masters/en; lecturer CFs under en/fragments; homepage+nav+footer+faculty page+Amanda Petrusich CF+lecturer model.
- Artifact: dist/nyu-gallatin-homepage-1.1.0.zip

