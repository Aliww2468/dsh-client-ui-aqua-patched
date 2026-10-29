# Aqua patch.2 — DSH 0.2.1-rc.3 compatibility

This is the patch.2 compatibility record. The current **1.3.1-patch.3** also
fixes desktop rendering; see [Desktop layout repair](REPAIR-DESKTOP.md).

Version: **1.3.1-patch.2**. Validation date: **2026-10-29**.
The earlier [patch.1 report](REPAIR.md) is retained as historical evidence.

## Why installation was refused

The inspected DSH NEXT **2.0.20-next** distribution contains
`@deepseek-ai/dsh` and `@deepseek-ai/dsh-app-boot` **0.2.1-rc.3**. Its own
`evaluatePluginCompatibility()` reproduced all eight unmet peer requirements
from patch.1 with no version exemptions.

`^0.1.0-rc.5` and `^0.1.2-rc.1` have an upper bound below `0.2.0`.
The host is **newer than the allowed range**; the refusal does not mean the
plugin requires a newer host. The validator includes prereleases in matching.

Each existing DSH peer range now adds `|| 0.2.1-rc.3`. The previous range is
preserved; other 0.2 releases need further testing. No `engines.dsh` override,
wildcard peer, or `allow-version` exemption is used. The package version is
bumped so installed metadata identifies the new build.

## Runtime changes

Changing the manifest alone is insufficient. The isolated host and browser
reproduced these additional failures:

| Old contract | DSH 0.2.1-rc.3 | Patch.2 |
|---|---|---|
| `scope.settings.register('aqua', ...)` | `TypeError: scope.settings.register is not a function` | Only call it when the legacy method exists. Browser-local settings need no new host Config fields. |
| `settings.plugin.item`, key `aqua` | Slot removed; the switch has no UI entry. | Also inject into `plugins.bundle.config`, key `dsh-client-ui-aqua`, rendered by the package detail page. Keep the old injection for 0.1. |
| `IconCheckOutline16` | Export removed; enabled controls throw React error #130 and their slot is withdrawn. | Use a local 16px SVG checkmark in the master card and Appearance controls. |

The modern configuration section wraps the existing list-item card in a list.
Both entry points use the same state/actions; no storage keys change.
Changes in `src/` and the distributed `lib/` artifacts are kept together.
The repository metadata now points at this fork.

## Verification

Runtime packages were copied from the installed DSH NEXT distribution into
an isolated directory. Tests used **Node v24.21.0**, a fresh `DSH_HOME`, a fresh
`DSH_AGENTS_HOME`, and a local web server. The user's desktop profile and its
installed themes were not changed.

| Check | Result |
|---|---|
| Official validator, no exemptions | Accepts `0.1.2-rc.1` and `0.2.1-rc.3`; rejects `0.1.1`, `0.2.0`, `0.2.1-rc.4`, and `0.3.0`. |
| Official CLI installation | Both local link and packed `.tgz` installation succeed in fresh profiles and append the Aqua bundle, without a compatibility exemption file. |
| Packed host startup | Starts on 0.2.1-rc.3 with empty stderr; installed client/host artifact hashes match the browser-tested files. pnpm reports missing peer packages in the profile; DSH resolves its shared host packages through its normal runtime resolver. |
| Source and distributed host module | Six tests pass: legacy registration/schema, new Settings without `register`, context without optional injection. |
| Host startup | No `settings.register` error after the fix. |
| Plugin details | Shows patch.2, a running component and the Glass theme card. |
| Switch off and reload | Ambient layer and fluid canvas disappear and stay absent; the card remains off. |
| Switch on | Both layers return. |
| Appearance controls | Modes, blur/frost, backdrop, color, brightness and all five decoration toggles render. |
| Blur | 20 → 28 updates `--dsh-aqua-blur: 28px`, retained after reload. |
| Mode | Mica → compatibility → Mica works; mode-specific controls hide and return. |
| Color scheme | Light mode applies `color-scheme: light` and updates the brightness hint; system mode restores dark on the test machine. |
| Browser health | No warnings or errors in the final test tab during these interactions. |

Run non-browser checks with a DSH installation root that resolves
`@deepseek-ai/dsh-app-boot` from its `node_modules`:

```sh
node tools/check-compatibility.mjs /path/to/dsh-install-root
node --test tools/host-compatibility.test.mjs
node --check lib/client.js
```

The host test uses Node's `stripTypeScriptTypes` (Node 22.13+) and exercises
the actual source and artifact. The compatibility test imports DSH's real
validator instead of copying its semver rules.

Tested distributed artifact SHA-256 values (the archive contains these bytes):

```text
lib/client.js  64426C4E8381B9E926C56DA925A9BCAED83C89DD74737718981FFEF3776DD4DF
lib/index.js   1EFFDC155CFDE9EF17F3C1B8D12D11DCE2B32B3D41674372A769884C66A0DD43
```

## Installation and controls

Install from this fork through the plugin manager using
`github:Aliww2468/dsh-client-ui-aqua-patched`, or use the web CLI:

```sh
dsh plugin --profile web add github:Aliww2468/dsh-client-ui-aqua-patched
```

For a local checkout, `link:/absolute/path/to/dsh-client-ui-aqua-patched`
remains supported.

For an archive produced with `npm pack --ignore-scripts`, use the manager's
local-package source or `file:/absolute/path/to/dsh-client-ui-aqua-1.3.1-patch.2.tgz`.
Restart/reload as requested by the host. Check that the detail page reports
**1.3.1-patch.2**; a cached patch.1 checkout still has the old requirements.
GitHub installations must resolve the updated `main` branch containing patch.2.

- DSH 0.2 master switch: **Plugins → dsh-client-ui-aqua → Glass theme**.
- Other controls: **Settings → General → Appearance**, as before.
- DSH 0.1 master switch: the legacy **Settings → Plugins** card.

## Limits

- Browser tests used the isolated **web** surface with the installed runtime
  packages, not the live Electron desktop window.
- The old 0.1 browser test was not repeated. Its dependency ranges, registration
  and schema behavior are preserved and covered by focused checks.
- Image/video wallpaper selection, interactions with other themes, and future
  DSH releases were not tested in this repair.
- The extracted upstream repository still needs an absent monorepo build preset
  and `workspace:` devDependencies. Full standalone build/typecheck and upstream's
  complete suite are not claimed. Prebuilt artifacts were syntax checked and
  exercised in the real host/browser.

The original license and attribution remain unchanged.
