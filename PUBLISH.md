# PUBLISH.md — push this fork to GitHub

Runbook for publishing this repository. Written to be executed verbatim once the
account is authenticated. The three listing requirements are covered first.

## Requirements coverage

| Requirement | Where it is satisfied | Status |
|---|---|---|
| GitHub topic **`dsh-plugin`** | `gh repo edit --add-topic dsh-plugin …` below; also mirrored into `package.json` → `keywords` | **pending** — can only be set after the repository exists |
| README carries an install command of the form `dsh plugin --profile web add <package>` | `README.md` → `## Installation` → *From this repository*; `README.zh.md` → `## 安装` → *从本仓库安装* | done, minus the `<owner>/<repo>` placeholder |
| Plugin exports an **`apply(ctx)`** module per the DSH plugin spec | host half `lib/index.js`: `export { apply }` / `function apply(ctx)`; browser half `lib/client.js`: `exports.apply` + `exports.inject = ['theme','slots','locale']` inside `window.__ModuleLoader__.load({ id: "dsh-client-ui-aqua", … })` | done and empirically verified |

Evidence for the third row: a throwaway DSH instance reported
`loaded: […, dsh-client-ui-aqua, …]`, its `córdís` row registered the `aqua`
settings namespace, and the Plugins-tab card appeared and toggled the theme.
See REPAIR.md §3.

## 0. Prerequisites

```powershell
gh auth login                 # interactive: browser or device code — must be you
gh auth status

# github.com is unreachable without the local proxy on this machine
$env:HTTPS_PROXY = 'http://127.0.0.1:7890'
$env:HTTP_PROXY  = 'http://127.0.0.1:7890'
```

The repository itself already carries a repo-local `http.proxy` setting, so `git
push` works without touching the global git config.

The commit author is currently a placeholder. To make the commits yours:

```powershell
$login = gh api user --jq .login
$id    = gh api user --jq .id
git -C <repo> config user.name "$login"
git -C <repo> config user.email "$id+$login@users.noreply.github.com"
git -C <repo> commit --amend --reset-author --no-edit
```

## 1. Create the repository and push

```powershell
gh repo create dsh-client-ui-aqua-patched `
  --public `
  --source <repo> `
  --remote origin `
  --push `
  --description "Aqua glassmorphism theme for the DeepSeek Harness web UI — unofficial patched fork, repaired for DSH 0.1.2-rc.1 (upstream 1.3.1 crashes there)"
```

## 2. Set the topics (requirement 1)

`gh repo create` has no topic flag, so topics are set immediately afterwards.

```powershell
gh repo edit <owner>/dsh-client-ui-aqua-patched `
  --add-topic dsh-plugin `
  --add-topic dsh-plugins `
  --add-topic deepseek-harness `
  --add-topic dsh `
  --add-topic cordis `
  --add-topic theme `
  --add-topic glassmorphism

gh repo view <owner>/dsh-client-ui-aqua-patched --json repositoryTopics
```

`dsh-plugin` is the required one; the rest are for discovery.

## 3. Replace the install-command placeholders (requirement 2)

Both READMEs deliberately ship `github:<owner>/<repo>` so the command shape is
already correct. Point it at the real repository:

```powershell
$owner = gh api user --jq .login
$repo  = 'dsh-client-ui-aqua-patched'
Get-ChildItem <repo>\README*.md | ForEach-Object {
  $p = $_.FullName
  (Get-Content $p -Raw) -replace [regex]::Escape('github:<owner>/<repo>'), "github:$owner/$repo" `
                         -replace [regex]::Escape('github.com/<owner>/<repo>'), "github.com/$owner/$repo" `
    | Set-Content $p -NoNewline -Encoding utf8
}
git -C <repo> commit -am "README: point install commands at $owner/$repo"
git -C <repo> push
```

## 4. Post-publish verification

```powershell
# the published README must show the real install command
gh api "repos/$owner/$repo/readme" --jq .content |
  ForEach-Object { [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($_)) } |
  Select-String 'dsh plugin --profile web add'

# the topic must be present
gh repo view "$owner/$repo" --json repositoryTopics --jq '.repositoryTopics[].name'

# the pushed artifacts must still be the audited bytes
git -C <repo> cat-file blob "origin/main:lib/client.js" | sha256sum   # or: git show origin/main:lib/client.js | sha256sum
# expected:
#   client.js  C2E0E6DFBAAC69ABF70D8A9D57FE233EDC2BDAFB0188709EAA1BE1FEB3FCE214
#   index.js   983FE201220FFD74F103961E882B549AEAD22390567BF0D8BDF6582E3D07A56D
```

Then install from the published repository on a machine with DSH 0.1.2-rc.1:

```sh
dsh plugin --profile web add github:<owner>/<repo>
dsh --profile web --dump-config
dsh web
```

## 5. Optional: publish to npm

Only if the `dsh-client-ui-aqua` name is ever transferred to this fork. The name
is currently upstream's; publishing to it is not possible without their consent,
and publishing under a scope would require renaming the loader row in
`cordis.patch.yml` to match (the row name must equal the package name).

## Notes

- License: this fork follows the upstream repository's **AGPL-3.0** (the npm
  tarball of the same version claims MIT — see REPAIR.md §5). Publishing publicly
  satisfies AGPL's source-availability terms; keep `LICENSE` untouched and the
  modification list in REPAIR.md §2 accurate.
- Never force-push over the audited commits: the artifact hashes quoted in
  REPAIR.md §3 and this file are the guarantee that what users install is what was
  tested.
