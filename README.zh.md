> **非官方修补分支 —— 已修复以适配 DSH 0.1.2-rc.1。**
>
> 上游 `dsh-client-ui-aqua@1.3.1`（npm，2026-08-17）与上游仓库 HEAD 在 DSH 0.1.2 线上
> 均无法工作。本分支修复了三处独立缺陷，并已在 DSH 0.1.2-rc.1（宿主 Node v22.21.1）
> 上完成端到端验证：主题生效、Appearance 控件完整渲染、「插件」页总开关卡片出现且可用。
> 诊断、逐项改动、证据与测试脚本见 **[REPAIR.md](REPAIR.md)**。
>
> ```sh
> dsh plugin --profile web add github:<owner>/<repo>   # 之后重启 dsh web
> ```
>
> 与上游作者无隶属、无背书、无维护关系。按上游仓库 `LICENSE` 以
> **AGPL-3.0-only** 分发（同版本 npm 包含的却是 MIT，见 REPAIR.md §5）。
> `src/` 的改动此处未经类型检查（上游仓库无法独立构建），随包 `lib/` 产物是经过验证的
> 1.3.1 构建就地打补丁后的结果。

# dsh-client-ui-aqua —— DeepSeek Harness 玻璃质感主题

> 上游包名：`@deepseek-ai/dsh-client-ui-aqua`（作者 monorepo 内的名字）。发布到 npm 的是
> 不带 scope 的 `dsh-client-ui-aqua`，本分支沿用该名字，以便作为可直接替换的版本使用。

[English](README.md) | 中文

# 注意⚠️⚠️⚠️（务必仔细阅读）：随着DSH版本更新，本人因学业繁忙无法及时为该插件适配新的API，请自行使用其他agent更换或修理，以免在安装该插件时出现崩溃问题

Aqua 是一层高自由度的玻璃质感主题，套在 DeepSeek Harness 网页端。顶栏、侧边栏、输入框、统计行、轨迹视图都成了磨砂玻璃片,你还可以添加视频和图片作为背景。关掉开关就回到原生界面，不改 DSH 任何一行源码。

![](assets/1.png)

![](assets/2.png)

![](assets/3.png)

![](assets/4.png)

## 特性

- **双模式**：**云母效果**把布局改成悬浮玻璃卡片（模糊度、磨砂度可调）；**兼容模式**保持原版排版一字不动，只把材质换成通用玻璃，其他插件的界面也会自动玻璃化
- **背景自由**：流体板（颜色可调）或自定义壁纸（铺满页面、比例不变，可单独调模糊度/磨砂度）；浅色壁纸配浅色模式、深色壁纸配深色模式观感更佳
- **背景亮度**：自动跟随深浅模式——深色模式 0–50 压暗、浅色模式 50–100 提亮，50 原样
- **粒子鲸鱼**：deepseek.com/harness 同款粒子鱼（官网粒子引擎移植），显示在聊天区域正中央（不含侧边栏），深色模式白粒子、浅色模式灰粒子，设置里可开关
- **Harness 光泽铭牌**：深色模式下侧边栏铭牌换成官网同款「Harness」药丸（135° 渐变描边 + 柔光），浅色模式保持原版铭牌
- **边缘渐变模糊**：页面顶部/底部各 5px 渐变模糊带，悬浮在聊天内容上层，内容滚到边缘渐入模糊；浅色微泛白、深色微泛黑
- 一键开关：关闭即完全还原原生界面，所有效果随插件卸载一并消失

## 安装

### 从本仓库安装（推荐）

```sh
dsh plugin --profile web add github:<owner>/<repo>
```

安装本修补版，并通过包内的 `dsh.bundle.patch` 自动注册为 profile 插件层，所有平台通用。
该命令会调用 `git` 访问 `github.com`，受限网络下可能需要代理。

确认层已组合，然后重启宿主：

```sh
dsh --profile web --dump-config     # 应能看到 "# == dsh-client-ui-aqua" 这一层
dsh web                             # 重启；主题默认开启
```

### 从本地克隆安装

```sh
git clone https://github.com/<owner>/<repo>.git
dsh plugin --profile web add link:/本仓库的绝对路径
```

### 卸载

```sh
dsh plugin --profile web remove dsh-client-ui-aqua
```

### 环境要求

DSH **0.1.2-rc.1**（本分支的验证基线，宿主 Node v22.21.1）。安装会往 profile 的
`dsh.profile.bundles` 追加 `dsh-client-ui-aqua`，因此**必须重启宿主**主题才会加载。

### ⚠️ 不要安装 npm 上的裸包名

```sh
dsh plugin --profile web add dsh-client-ui-aqua   # ← 装到的是上游未修复的 1.3.1
```

裸包名解析到上游的 npm 发布版，它在 DSH 0.1.2 线**无法工作**：浏览器半引用了 DSH 0.1.2
已移除的 `@deepseek-ai/dsh-client-runtime`，且其设置卡片每次加载都会抛异常。请使用上面的
`github:` 形式，直到上游修好为止。详见 [REPAIR.md](REPAIR.md)。

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

### 上游遗留安装器（本分支不支持）

上游的 `install.ps1` 与手动软链方案安装的是**未修复**的构建，且指向旧仓库。本仓库保留它们
仅为追溯出处，在 DSH 0.1.2-rc.1 上不受支持。

## 使用

刷新 Web 界面。Aqua **默认开启**；总开关在 **设置 → 插件 → 玻璃主题**（形状与其他插件卡片一致），其余全部调节在 **设置 → 通用设置 → 外观** 的正下方（无独立标题）：模式、模糊度/磨砂度（云母模式）、流体颜色、背景亮度、背景（流体/壁纸）、壁纸设置，以及粒子鲸鱼开关。总开关关闭时，外观下方的整块调节自动隐藏。
