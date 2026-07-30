# NYU Gallatin — FileVault content package

Versioned AEM content package (homepage, nav, footer, Amanda Petrusich faculty
page, lecturer Content Fragment + model).

## Layout
```
package/
  nyu-gallatin-homepage/      # staged FileVault tree (jcr_root + META-INF)
  dist/                       # built, versioned artifacts — nyu-gallatin-homepage-<version>.zip
  version.json               # current version (source of truth)
  CHANGELOG.md               # one entry per build
  README.md
```

## Build a new version
Regenerate the staged content first (JCR), then build the versioned zip:
```bash
node tools/importer/md2jcr-convert.mjs          # (re)generate jcr_root + copy into staged tree
node tools/importer/build-package.mjs --minor --note "what changed"
```
Version selection:
- `build-package.mjs`            → patch bump (1.1.0 → 1.1.1)
- `build-package.mjs --minor`    → 1.1.0 → 1.2.0
- `build-package.mjs --major`    → 1.1.0 → 2.0.0
- `build-package.mjs --set 2.3.0`→ explicit version

Each build:
- stamps the version into `META-INF/vault/properties.xml` (AEM Package Manager
  shows it and keeps prior installs),
- writes `dist/nyu-gallatin-homepage-<version>.zip` (versioned filename — nothing
  is overwritten, rollback = install an older zip),
- updates `version.json` and prepends a `CHANGELOG.md` entry.

> Timestamps: pass `BUILD_TS=<iso8601>` to stamp a specific time in the changelog
> (the script avoids nondeterministic clock calls otherwise).

## Install in AEM
AEM → Tools → Deployment → Package Manager → Upload Package → pick the desired
`dist/nyu-gallatin-homepage-<version>.zip` → Install.

## Contents (paths)
- `/content/nyu-gallatin-eds/language-masters/en` (homepage) + `/nav`, `/footer`,
  `/academics/faculty/amanda-petrusich`
- `/content/dam/nyu-gallatin-eds/en/fragments/lecturers/amanda-petrusich` (CF)
- `/conf/nyu-gallatin-eds/settings/dam/cfm/models/lecturer` (CF model)

Images referenced by the content live at the original `/content/dam/nyugallatin/...`
paths — see `migration-work/image-upload-mapping.md` (upload separately to the DAM).
