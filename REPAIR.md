# REPAIR.md — Aqua on DSH 0.1.2-rc.1

**This is an unofficial patched fork.** It is not affiliated with, endorsed by, or
maintained by the upstream author (`WYH66666666`). It exists because upstream
`dsh-client-ui-aqua` (npm `1.3.1`, published 2026-08-17; repo HEAD `d94431a9`,
2026-08-22) does not work on the DSH 0.1.2 line, and the upstream README itself
opens with a notice that the author cannot keep up with DSH's API changes.

Base: npm `dsh-client-ui-aqua@1.3.1` artifacts + upstream repository tree.
Target: **DSH 0.1.2-rc.1** (host Node v22.21.1), verified end-to-end — see
[Verification](#verification).

---

## 1. What breaks on DSH 0.1.2-rc.1

Three independent defects, all reproduced before the fix.

### 1.1 The browser half imports a package that no longer exists

`lib/client.js` opens with a lazy-CJS factory whose externals are resolved by the
web shell's static module table:

```js
let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
let react_jsx_runtime = require("react/jsx-runtime");
let react = require("react");
let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");   // ← gone
```

DSH 0.1.2-rc.1's shell only answers these ids:

```js
{ react, "react/jsx-runtime", "react-dom", "react-dom/client",
  "@deepseek-ai/cordis", "@deepseek-ai/dsh-client-store",
  "@deepseek-ai/dsh-client-ui-slots", "@deepseek-ai/dsh-client-ui-primitives" }
```

`@deepseek-ai/dsh-client-runtime` was removed in the 0.1.2 line. Aqua uses exactly
**one** value from it — `defineStore` — which the shell now exports from
`@deepseek-ai/dsh-client-store` (`{ createSnapshotStore, defineStore,
notifySubscribers, shallowEqual }`).

### 1.2 The settings card is registered into a keyed slot without a key

`settings.plugin.item` is a **keyed** slot since DSH rc.7 (it used to be a list
slot). Registering it with only `id` throws on every page load:

```
Error: keyed slot "settings.plugin.item" requires options.key
```

### 1.3 The host half serves no settings namespace, so the card can never render

The node half is `export function apply(): void {}`. Since rc.7 the settings page
dispatches cards **by served settings namespace** — `ConfigurablePluginsTab`
renders `renderSlot("settings.plugin.item", {}, { entryKey: ns })` once per
namespace the host answers for. With no namespace registered, no `entryKey`
equals `aqua`, so the card is never dispatched even after 1.2 is fixed: the
master on/off switch silently disappears.

---

## 2. Changes in this fork

| File | Change |
|---|---|
| `lib/client.js` | `require("@deepseek-ai/dsh-client-runtime/client")` → `require("@deepseek-ai/dsh-client-store")` |
| `lib/client.js` | `settings.plugin.item` registration gains `key: "aqua"` (keeps `id`) |
| `lib/index.js` | empty `apply()` → registers an empty pass-through settings namespace `aqua` via `ctx.inject(['settings'], scope => scope.settings.register('aqua', schema, { base: {} }))` |
| `src/client/settings-store.ts` | import re-pointed at `@deepseek-ai/dsh-client-store` |
| `src/client/index.ts` | slot registration gains `key: 'aqua'`; the type-only `ClientContext` import re-pointed at `@deepseek-ai/cordis` |
| `src/index.ts` | source-level mirror of the host-half namespace registration |
| `lib/types/index.d.ts` | matches the new `apply(ctx)` signature |
| `package.json` | version `1.3.1-patch.1`; `dsh.client.inject` and `peerDependencies` re-pointed from `dsh-client-runtime` to `dsh-client-store`; license statement corrected (see §5) |

The namespace registered by the node half is a deliberate **empty pass-through**:
Aqua keeps its state in `localStorage` behind the browser half, so the namespace's
only job is to make the card dispatchable. Host-side settings values for `aqua`
are stored but unused. The same technique is used in production by
`@liustack/modsearch` on this DSH line.

### Why the built artifacts are patched by hand

Upstream's repository is an extraction from the author's `deepseek-harness`
monorepo: every `@deepseek-ai/*` dependency is declared as `workspace:^`, and
`tsdown`/`typescript` are not declared at all even though `scripts.bundle` calls
`tsdown`. The tree therefore **cannot be built standalone**. The shipped
`lib/*.js` is the published 1.3.1 build patched in place, and the `src/` edits
mirror those artifact patches at source level so the change is reviewable. The
`src/` edits have **not** been type-checked here (no toolchain available); they
need `pnpm typecheck` inside the author's monorepo before any upstream PR.

---

## 3. Verification

Harness: headless Chrome driven over the DevTools Protocol by two dependency-free
Node scripts in `tools/` (`cdp-aqua-test.mjs`, `cdp-eval.mjs`), run against a
throwaway DSH instance booted on a random port with the host's own runtime
(`resources/node/node.exe`, v22.21.1). The page is probed for Aqua's live DOM
signatures rather than for a screenshot:

| Check | Result |
|---|---|
| Visual layer applied | `[data-dsh-aqua-ambient]`, `[data-dsh-aqua-fluid-canvas]`, `[data-dsh-aqua-wallpaper-layer]` present, Aqua CSS `<style>` injected |
| Page health | `EXCEPTIONS: []`, `CONSOLE_ERRORS: []`, `LOG_ERRORS: []` (before the fix: `keyed slot "settings.plugin.item" requires options.key`) |
| General → Appearance controls | rendered: mode (mica/compat), glass blur, frost, backdrop (fluid/wallpaper), hue, brightness, particle whale / critters / mesh / hover effects |
| Plugins tab card | “玻璃主题 …” card with master switch present |
| Master switch functional | click → layer removed, `localStorage['dsh.ui-aqua.enabled'] = "false"`, fluid canvas gone; click again → layer back, flag `"true"`; zero exceptions |

Shipped artifact hashes (SHA-256), i.e. the exact bytes that passed the tests:

```
lib/client.js  C2E0E6DFBAAC69ABF70D8A9D57FE233EDC2BDAFB0188709EAA1BE1FEB3FCE214
lib/index.js   983FE201220FFD74F103961E882B549AEAD22390567BF0D8BDF6582E3D07A56D
```

`lib/client.js.map` was removed: it belonged to upstream's repository build,
which is not the build shipped here.

Reproduce:

```sh
dsh plugin --profile web add link:<path-to-this-repo>       # or github:<owner>/<repo>
dsh --profile web --port 0 --no-open                        # note the printed token URL
node tools/cdp-aqua-test.mjs "http://127.0.0.1:<port>/?token=<token>" 15000
node tools/cdp-eval.mjs     "http://127.0.0.1:<port>/?token=<token>" 12000 @tools/expr-toggle.js
```

---

## 4. Known limitations of this fork

- **Upstream's own limits still apply** — no maintenance, no upstream test suite
  run here, and the DSH UI may drift again: this fork is pinned to what
  **0.1.2-rc.1** actually serves.
- The `src/` edits are unverified by `tsc` (see §2).
- The card's values live in `localStorage`, not in the host settings store the
  namespace nominally backs.
- Office document previews, embedded-browser logins and other upstream caveats are
  unchanged.

## 5. License and copyright

- Upstream repository `LICENSE` = **GNU AGPL-3.0** (34.5 kB, read in full).
- The published npm tarball `dsh-client-ui-aqua@1.3.1` ships a 1.1 kB **MIT**
  `LICENSE` and declares `"license": "MIT"`. The same code, two licenses — an
  upstream inconsistency, not something this fork can resolve.
- This fork therefore follows the **more restrictive** reading: it keeps the
  upstream AGPL-3.0 `LICENSE` file untouched and is distributed under
  **AGPL-3.0-only**. All modifications are listed in §2 and the repository is
  public, satisfying AGPL's source-availability terms.
- Copyright in the original work remains with the upstream author. Please ask
  upstream to clarify the MIT/AGPL discrepancy before redistributing elsewhere.
