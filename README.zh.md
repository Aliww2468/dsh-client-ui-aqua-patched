> **非官方修补分支 —— 已修复以适配 DSH 0.1.2-rc.1。**
> 上游 `dsh-client-ui-aqua@1.3.1`（npm，2026-08-17）与上游仓库 HEAD 在 DSH 0.1.2 线上均无法工作。
> 本分支修复了三处独立缺陷，并已在 DSH 0.1.2-rc.1（宿主 Node v22.21.1）上完成端到端验证。
> 诊断、逐项改动、证据与注意事项见 **[REPAIR.md](REPAIR.md)**。与上游作者无隶属、无背书、
> 无维护关系；按 **AGPL-3.0-only** 分发（见[许可证](#许可证)）。本分支所依据的上游源码说明
> 见[上游与本分支](#上游与本分支)。

# dsh-client-ui-aqua —— DeepSeek Harness 玻璃质感主题

[English](README.md) | 中文

## 一句话价值

装上它，DSH 网页端立刻变成磨砂玻璃——顶栏、侧边栏、输入框、统计行与轨迹视图化作悬浮玻璃片，背景可以是流动的流体板，也可以是你自己的壁纸。关掉唯一的总开关，界面完全还原，不留任何残留。

## 安装

Profile：**`web`**（浏览器界面所用的 profile）。可直接复制，三条命令：

```sh
dsh plugin --profile web add github:Aliww2468/dsh-client-ui-aqua-patched
dsh --profile web --dump-config     # 校验：应出现 "# == dsh-client-ui-aqua" 这一层
dsh web                             # 重启宿主；主题默认开启
```

需要 `git` 位于 `PATH` 且能访问 `github.com`（受限网络需要 HTTP 代理）。插件会把自身追加进 `dsh.profile.bundles`。各控件见[使用](#使用)；权限、外部服务与兼容性见[权限、外部服务与兼容性](#权限外部服务与兼容性)。

### 从本仓库安装（推荐）

上面那段就是全部：安装本修补版，并通过包内的 `dsh.bundle.patch` 自动注册为 profile 插件层，所有平台通用。

### 从本地克隆安装

```sh
git clone https://github.com/Aliww2468/dsh-client-ui-aqua-patched.git
dsh plugin --profile web add link:/本仓库的绝对路径
```

### 卸载

```sh
dsh plugin --profile web remove dsh-client-ui-aqua
```

然后重启 `dsh web`。所有视觉效果都是可释放的 effect，随插件一并回收，原生界面随之还原。

### 环境要求

DSH **0.1.2-rc.1**（本分支的验证基线，宿主 Node v22.21.1）。安装会往 profile 的
`dsh.profile.bundles` 追加 `dsh-client-ui-aqua`，因此**必须重启宿主**主题才会加载。

### ⚠️ 不要安装 npm 上的裸包名

```sh
dsh plugin --profile web add dsh-client-ui-aqua   # ← 装到的是上游未修复的 1.3.1
```

裸包名解析到上游的 npm 发布版，它在 DSH 0.1.2 线**无法工作**：浏览器半引用了 DSH 0.1.2
已移除的 `@deepseek-ai/dsh-client-runtime`，且其设置卡片每次加载都会抛异常。请使用上面的
`github:` 形式（或本地克隆形式），直到上游修好为止。详见 [REPAIR.md](REPAIR.md)。
## 它能给你什么

以下全部是**上游的设计**，本分支原样沿用——本分支只修掉了导致它加载失败的三处缺陷（见 [REPAIR.md](REPAIR.md)）。

- **双模式**：**云母效果**把布局改成悬浮玻璃卡片（模糊度、磨砂度可调）；**兼容模式**保持原版排版一字不动，只把材质换成通用玻璃，其他插件的界面也会自动玻璃化
- **背景自由**：流体板（颜色可调）或自定义壁纸（铺满页面、比例不变，可单独调模糊度/磨砂度）；浅色壁纸配浅色模式、深色壁纸配深色模式观感更佳
- **背景亮度**：自动跟随深浅模式——深色模式 0–50 压暗、浅色模式 50–100 提亮，50 原样
- **粒子鲸鱼**：deepseek.com/harness 同款粒子鱼（官网粒子引擎移植），显示在聊天区域正中央（不含侧边栏），深色模式白粒子、浅色模式灰粒子，设置里可开关
- **Harness 光泽铭牌**：深色模式下侧边栏铭牌换成官网同款「Harness」药丸（135° 渐变描边 + 柔光），浅色模式保持原版铭牌
- **边缘渐变模糊**：页面顶部/底部各 5px 渐变模糊带，悬浮在聊天内容上层，内容滚到边缘渐入模糊；浅色微泛白、深色微泛黑
- 一键开关：关闭即完全还原原生界面，所有效果随插件卸载一并消失

## 可见的证明

以下是**真实输出**，不是示意图：由 `tools/` 里那套零依赖测试夹具，在临时的 DSH 0.1.2-rc.1 实例（宿主 Node v22.21.1）上跑出，安装的是本仓库已发布的产物：

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
VALUE: {"cardText":"玻璃主题卡片 ... 总开关开启","foundToggle":true,
        "appliedBefore":true,"switchedOff":true,"appliedAfterOff":false,
        "canvasAfterOff":false,"flagAfterOff":"false",
        "appliedAfterOn":true,"flagAfterOn":"true"}
EXCEPTIONS: []
```

怎么读：主题层确实渲染了（`ambient`、`fluidCanvas`、`wallpaperLayer`，并注入一张样式表）；页面保持干净（无异常、无 console 错误、无日志错误）；总开关确实能把主题**关掉再打开**（`appliedAfterOff:false` → `appliedAfterOn:true`，且状态被持久化）。输出已裁剪至被断言的字段。

想在自己机器上复现：先跑上面三条安装命令，再跑两条夹具命令，约一分钟，除 Node 与 Chrome 外无需其它依赖。上游自己拍的界面截图见[上游与本分支](#上游与本分支)。

## 权限、外部服务与兼容性

以下结论审计自随包产物（`lib/client.js`、`lib/index.js`），即 REPAIR.md §3 中给出哈希的那份字节。

| 问题 | 结论 |
|---|---|
| 运行时网络请求 | **无。** 浏览器半中 `fetch`、`XMLHttpRequest`、`WebSocket`、`EventSource`、`sendBeacon` 出现次数均为 0；宿主半不 import 任何模块，也不触网。 |
| 文件 / 凭据 / Cookie | **无。** 不使用文件系统或凭据服务，不读 `document.cookie`，无 `eval` / `new Function`，不加载远程代码。 |
| 实际触碰的内容 | 往页面注入一张 `<style>` 与若干装饰性 DOM 节点（氛围场景、壁纸层、边缘渐隐），并注册一个名为 `aqua` 的设置命名空间。效果仅此而已。 |
| 存储的状态 | 仅 `localStorage` 中 `dsh.ui-aqua.*` 前缀的键（开关、模式、模糊度、磨砂度、背景、壁纸、鲸鱼、小鱼、网状、悬停、按下…）。自定义壁纸以 data URL 存在 `localStorage`，因此超大图片或视频可能触及浏览器存储配额。 |
| 遥测 / 账号 | 无。没有统计上报、不需要账号、不需要 API key。 |
| 安装期执行代码 | **无。** `package.json` 未声明 `install` / `postinstall` / `prepare`，且 `lib/` 随包提供预构建产物，因此 `dsh plugin add` 不会执行任何包脚本。 |
| 外部服务 | 主题本身不依赖任何外部服务。安装过程需访问一次 GitHub 且需要 `git`；受限网络下需要 HTTP 代理。 |
| 兼容性 | 仅在 **DSH 0.1.2-rc.1**（宿主 Node v22.21.1）上验证通过。上游的 peer 基线是 `^0.1.0-rc.5`，本分支未在其它 DSH 线上测试。上游已停止维护，未来 DSH 版本可能再次使其失效——建议把 `dump-config` 那一步固定进你的升级流程。 |
| 卸载 | `dsh plugin --profile web remove dsh-client-ui-aqua` 后重启。所有视觉效果都是可释放的 effect，移除即回收，原生界面随之还原。 |
| 维护 | 一次性的社区修复，非上游维护。无任何担保；唯一可依赖的兼容性承诺是那两组产物哈希。 |

## DSH 插件规范符合性

- **宿主半导出 `apply(ctx)`** —— `lib/index.js` 提供 `export { apply }` 与
  `function apply(ctx)`：它注册浏览器半卡片所依的 key（设置命名空间 `aqua`），这正是
  DSH 0.1.2 上总开关能被派发的原因。
- **浏览器半导出 `apply` + `inject`** —— `lib/client.js` 是 lazy-CJS 的
  `window.__ModuleLoader__.load({ id: "dsh-client-ui-aqua", factory })` 产物，工厂返回
  `exports.apply` 与 `exports.inject = ['theme', 'slots', 'locale']`。
- **bundle 补丁** —— `dsh.bundle.patch` 指向 `cordis.patch.yml`，其中插入唯一的加载器行
  `{ id: ui-aqua, name: 'dsh-client-ui-aqua' }`；包名与该行一致，因此一条
  `dsh plugin add` 即可同时完成安装与挂载。
- **浏览器 roster** —— `dsh.client` 声明 `platform: web`，并列出需先加载的模块 id。
- **无构建步骤** —— `lib/` 随包提供预构建产物，安装过程不执行任何包脚本。

## 使用

刷新 Web 界面。Aqua **默认开启**；总开关在 **设置 → 插件 → 玻璃主题**（形状与其他插件卡片一致），其余全部调节在 **设置 → 通用设置 → 外观** 的正下方（无独立标题）：模式、模糊度/磨砂度（云母模式）、流体颜色、背景亮度、背景（流体/壁纸）、壁纸设置，以及粒子鲸鱼开关。总开关关闭时，外观下方的整块调节自动隐藏。

## 上游与本分支

本仓库是 [`WYH66666666/DSH-Transparent-UI-Plugin`](https://github.com/WYH66666666/DSH-Transparent-UI-Plugin) 在提交 `d94431a`（2026-08-22）处的分支，依据已发布的 npm 包 `dsh-client-ui-aqua@1.3.1` 建立。上游在自己的 monorepo 内把包命名为 `@deepseek-ai/dsh-client-ui-aqua`；发布到 npm 的名字是不带 scope 的 `dsh-client-ui-aqua`，本分支沿用该名字以便作为可直接替换的版本。

**所有设计与用户可见行为都是上游的成果。** 本分支只改了三件事——浏览器半 import 的模块、其设置卡片注册所用的 key、以及提供设置命名空间的宿主半——并把结果作为经过审计的产物发布。完整 diff 见 [REPAIR.md](REPAIR.md) §2，验证见 §3。

### 上游自己的提醒——它针对的是上游的构建，不是本分支

> **注意⚠️⚠️⚠️（务必仔细阅读）**：随着 DSH 版本更新，本人因学业繁忙无法及时为该插件适配新的 API，请自行使用其他 agent 更换或修理，以免在安装该插件时出现崩溃问题。

这段提醒正是本分支存在的原因，而它描述的正是上游已发布的构建：`dsh plugin --profile web add dsh-client-ui-aqua` 装到的是未修复的 1.3.1，其浏览器半引用了 DSH 0.1.2 已移除的包，设置卡片每次加载都会抛异常。本分支**就是**那段提醒里所说的「修理」。

### 上游的原始介绍

> Aqua 是一层高自由度的玻璃质感主题，套在 DeepSeek Harness 网页端。顶栏、侧边栏、输入框、统计行、轨迹视图都成了磨砂玻璃片，你还可以添加视频和图片作为背景。关掉开关就回到原生界面，不改 DSH 任何一行源码。

### 上游的截图

由上游在其当时适配的 DSH 版本上拍摄，因此周边界面细节可能与你的不同。

![](assets/1.png)

![](assets/2.png)

![](assets/3.png)

![](assets/4.png)

### 仓库结构

| 路径 | 说明 |
|---|---|
| `lib/`、`package.json`、`cordis.patch.yml` | 实际发布的、经过审计的构建——`dsh plugin add` 装的就是它。 |
| `src/` | 三处修复的源码镜像，供审阅。上游的目录无法独立构建（`@deepseek-ai/*` 依赖写作 `workspace:^`，且未声明 `tsdown`/`typescript`），因此这些改动此处未经类型检查。 |
| `tools/` | 上面验证所用的零依赖 Chrome DevTools Protocol 夹具。 |
| `REPAIR.md` | 诊断、改动、证据、限制与许可证情况。 |
| `PUBLISH.md` | 本分支的发布记录（topic、安装命令、推送产物哈希）。 |
| `install.ps1`、`publish.ps1`、`build.ps1` | 上游的脚本，仅作出处保留——它们安装的是未修复的构建，本分支不支持。 |

## 许可证

上游**仓库是 AGPL-3.0**（其 `LICENSE` 文件），而同一版本的 npm 包含的却是 MIT——这是上游自身引入的不一致，记录在 REPAIR.md §5。本分支采用更严格的一侧：保留上游 `LICENSE` 原样，并按 **AGPL-3.0-only** 分发。若 AGPL 与你的部署不相容，请不要安装。原始作品的版权归上游作者所有。
