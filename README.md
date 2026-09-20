> **Unofficial patched fork — repaired for DSH 0.1.2-rc.1.**
>
> Upstream `dsh-client-ui-aqua@1.3.1` (npm, 2026-08-17) and the upstream repository
> HEAD do not work on the DSH 0.1.2 line. This fork fixes three independent defects
> and is verified end-to-end on DSH 0.1.2-rc.1 (host Node v22.21.1): the theme
> applies, the Appearance controls render, and the Plugins-tab master switch
> appears and works. Read **[REPAIR.md](REPAIR.md)** for the diagnosis, the exact
> changes, the evidence and the test harness.
>
> ```sh
> dsh plugin --profile web add github:Aliww2468/dsh-client-ui-aqua-patched   # then restart dsh web
> ```
>
> Not affiliated with, endorsed by, or maintained by the upstream author.
> Distributed under **AGPL-3.0-only**, following the upstream repository
> `LICENSE`; the npm tarball of the same version declares MIT instead — see
> REPAIR.md §5. `src/` edits are not type-checked here (upstream's tree cannot be
> built standalone) and the shipped `lib/` artifacts are the verified 1.3.1 build
> patched in place.

# dsh-client-ui-aqua — Aqua glassmorphism theme for DeepSeek Harness

> Upstream package name: `@deepseek-ai/dsh-client-ui-aqua` (the author's monorepo
> name). The package published to npm is the unscoped `dsh-client-ui-aqua`, and that
> is the name this fork keeps so it stays a drop-in replacement.

English | [中文](README.zh.md)

## What it does, in one line

Install it and the DSH web UI becomes frosted glass — the header, sidebar, composer, stats line and trajectory view turn into floating glass panes over a living fluid board or your own wallpaper. Flip one switch and the stock UI comes back exactly, with nothing left behind.

## Install (copy-paste)

Profile: **`web`** — the browser UI profile. Three commands:

```sh
dsh plugin --profile web add github:Aliww2468/dsh-client-ui-aqua-patched
dsh --profile web --dump-config     # verify: an "# == dsh-client-ui-aqua" layer must appear
dsh web                             # restart the host; the theme is ON by default
```

`git` must be on `PATH` and `github.com` reachable (an HTTP proxy may be required). The plugin appends itself to `dsh.profile.bundles`. Controls are under [Usage](#usage); permissions, external services and compatibility under [Permissions, external services and compatibility](#permissions-external-services-and-compatibility).
# Notice ⚠️: As DSH has been updated, I am unable to promptly update the plugin with the new APIdue to my academic commitments. Please use an alternative agent to replace or repair it yourself to avoid crashes when installing this plugin.


Aqua is a highly customizable glassmorphism theme for the DeepSeek Harness web UI. The header, sidebar, composer, stats line, and trajectory view all become panes of frosted glass. you can put video for wallpaper and Switch it off and the stock UI comes back exactly, with no source changes to DSH itself.

![](assets/1.png)

![](assets/2.png)

![](assets/3.png)

![](assets/4.png)

## Features

- **Two modes**: **Mica** restyles the layout into floating glass cards (blur and frost adjustable), while **Compatibility Mode** keeps the stock layout byte-for-byte and only swaps the material to generic glass — other plugins' UI gets the same treatment automatically
- **Free backdrop**: a living fluid board (hue adjustable) or your own wallpaper (fills the page, aspect preserved, with its own blur and frost); light wallpapers look best in light mode, dark wallpapers in dark mode
- **Background brightness**: follows the resolved scheme — dark mode darkens (0–50), light mode brightens (50–100), 50 is unchanged
- **Particle whale**: the deepseek.com/harness centerpiece fish (a 2D port of the site's particle engine), centered in the chat area right of the sidebar — white particles on dark, gray on light, toggleable in settings
- **Glossy "Harness" badge**: in dark mode the sidebar wordmark wears the official nameplate pill (135° gradient ring + soft glow); light mode keeps the stock plate
- **Edge fades**: 5px gradient blur bands pinned to the top and bottom of the page, above the chat content — scrolling content melts into the edges; faint white veil on light, faint black on dark
- One switch: off restores the stock UI exactly, and every effect is removed with the plugin

## Installation

### From this repository (recommended)

```sh
dsh plugin --profile web add github:Aliww2468/dsh-client-ui-aqua-patched
```

Installs this patched build and registers it as a profile plugin layer through the
package's `dsh.bundle.patch` — works on every platform. The command shells out to
`git` and reaches `github.com`, so a proxy may be needed on restricted networks.

Verify the layer composed, then restart the host:

```sh
dsh --profile web --dump-config     # expect an "# == dsh-client-ui-aqua" layer
dsh web                             # restart; the theme is on by default
```

### From a local clone

```sh
git clone https://github.com/Aliww2468/dsh-client-ui-aqua-patched.git
dsh plugin --profile web add link:/absolute/path/to/dsh-client-ui-aqua-patched
```

### Uninstall

```sh
dsh plugin --profile web remove dsh-client-ui-aqua
```

### Requirements

DSH **0.1.2-rc.1** — the line this fork is verified against (host Node v22.21.1).
Installing appends `dsh-client-ui-aqua` to `dsh.profile.bundles` in the profile,
so the host must be **restarted** before the theme loads.

### ⚠️ Do not install the bare package name from npm

```sh
dsh plugin --profile web add dsh-client-ui-aqua   # ← installs the UNPATCHED upstream 1.3.1
```

That bare name resolves to upstream's npm release, which does **not** work on the
DSH 0.1.2 line: its browser half imports `@deepseek-ai/dsh-client-runtime`, a
package DSH 0.1.2 removed, and its settings card throws on every page load. Use
the `github:` form above until upstream ships a fix. Details in
[REPAIR.md](REPAIR.md).

## DSH plugin spec conformance

- **Host half exports `apply(ctx)`** — `lib/index.js` ships `export { apply }` with
  `function apply(ctx)`. It registers the settings namespace that the browser
  half's card is keyed by (`aqua`), which is what makes the master switch
  dispatchable on DSH 0.1.2.
- **Browser half exports `apply` + `inject`** — `lib/client.js` is a lazy-CJS
  `window.__ModuleLoader__.load({ id: "dsh-client-ui-aqua", factory })` bundle whose
  factory returns `exports.apply` and `exports.inject = ['theme', 'slots', 'locale']`.
- **Bundle patch** — `dsh.bundle.patch` points at `cordis.patch.yml`, which inserts
  the single loader row `{ id: ui-aqua, name: 'dsh-client-ui-aqua' }`. The package
  name matches that row, so one `dsh plugin add` both installs and mounts the plugin.
- **Browser roster** — `dsh.client` declares `platform: web` plus the module ids the
  web shell must have loaded first.
- **No build step** — prebuilt artifacts ship in `lib/`, so installation never runs a
  package script.

### Legacy installer (upstream, unsupported here)

Upstream's `install.ps1` and its manual symlink recipe install the **unpatched**
build, and they point at the old repository. They are kept in this tree for
provenance only; they are not supported on DSH 0.1.2-rc.1.
## Visible proof

Real output, not a mock-up — produced by the dependency-free harness in `tools/` against a throwaway DSH 0.1.2-rc.1 instance (host Node v22.21.1), with the published artifacts of this repository installed:

```console
$ dsh plugin --profile web add github:Aliww2468/dsh-client-ui-aqua-patched
+ dsh-client-ui-aqua github:Aliww2468/dsh-client-ui-aqua-patched

$ node tools/cdp-aqua-test.mjs "http://127.0.0.1:<port>/?token=<token>" 15000
DOM: {"title":"DeepSeek Harness","ambient":true,"fluidCanvas":true,"wallpaperLayer":true,"aquaStyleTags":1,"lsEnabled":null,"bodyChildren":25}
EXCEPTIONS: []
CONSOLE_ERRORS: []
LOG_ERRORS: []
RESULT: PASS

$ node tools/cdp-eval.mjs "<url>" 12000 @tools/expr-toggle.js
VALUE: {"cardText":"glass theme card ... master switch on","foundToggle":true,
        "appliedBefore":true,"switchedOff":true,"appliedAfterOff":false,
        "canvasAfterOff":false,"flagAfterOff":"false",
        "appliedAfterOn":true,"flagAfterOn":"true"}
EXCEPTIONS: []
```

Read it as: the layer really rendered (`ambient`, `fluidCanvas`, `wallpaperLayer`, one injected stylesheet), the page stayed clean (no exceptions, no console errors, no log errors), and the master switch genuinely turns the layer **off and back on** (`appliedAfterOff:false` → `appliedAfterOn:true`, with the flag persisted). Output is trimmed to the asserted fields.

`assets/1.png` – `assets/4.png` are upstream's screenshots of the same theme, if you want the visual reference. To reproduce the run above on your own machine: execute the three install commands, then the two harness commands — about a minute, and nothing beyond Node and Chrome is needed.
## Permissions, external services and compatibility

Audited from the shipped artifacts (`lib/client.js`, `lib/index.js`) — the exact bytes hashed in REPAIR.md §3.

| Question | Answer |
|---|---|
| Network calls at runtime | **None.** The browser half contains zero `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource` or `sendBeacon` occurrences; the node half imports nothing and never touches the network. |
| Files, credentials, cookies | **None.** No filesystem or credential-service use, no `document.cookie`, no `eval` / `new Function`, no remote code loading. |
| What it does touch | Injects one `<style>` element and a few decorative DOM nodes (ambient scene, wallpaper layer, edge fades) into the page, plus one settings namespace named `aqua`. That is the entire effect. |
| Stored state | Only `localStorage` keys under `dsh.ui-aqua.*` (enable flag, mode, blur, frost, backdrop, wallpaper, whale, critters, mesh, spotlight, press, …). A custom wallpaper is kept as a data URL in `localStorage`, so a very large image or video can hit the browser storage quota. |
| Telemetry / accounts | None. No analytics, no account, no API key. |
| Install-time code execution | **None.** `package.json` declares no `install` / `postinstall` / `prepare` script and `lib/` ships prebuilt, so `dsh plugin add` never runs package code. |
| External services | None for the theme itself. Installing reaches GitHub once and needs `git`; on a restricted network an HTTP proxy is required. |
| Compatibility | Verified on **DSH 0.1.2-rc.1** with host Node v22.21.1 only. Upstream's peer baseline was `^0.1.0-rc.5`; this fork is not tested on other DSH lines. Upstream stopped maintaining the plugin, so a future DSH release can break it again — keep the `dump-config` step in your upgrade routine. |
| Uninstall | `dsh plugin --profile web remove dsh-client-ui-aqua` then restart. Every visual effect is an effect handle disposed on removal, so the stock UI returns. |
| License | The upstream **repository is AGPL-3.0** while the npm tarball of the same version declares MIT — an upstream inconsistency (REPAIR.md §5). This fork follows **AGPL-3.0-only**. If AGPL is incompatible with your deployment, do not install it. |
| Support | A one-off community repair, not upstream maintenance. No warranty; the audited artifact hashes are the only compatibility guarantee. |

## Usage

Reload the web UI. Aqua is **on by default**; the master switch lives in **Settings → Plugins → Glass theme** (same shape as the other plugin cards), and every other control sits directly under **Settings → General → Appearance** (no title of its own): mode, blur/frost (Mica mode), fluid color, background brightness, backdrop (fluid/wallpaper) with its wallpaper controls, and the particle-whale toggle. With the master switch off, the whole control block under Appearance is hidden.
