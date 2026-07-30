# nyu-gallatin-homepage — package changelog

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

