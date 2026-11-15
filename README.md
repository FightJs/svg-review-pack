# SVG Review Pack

**压缩后的 SVG 能用，不代表它看起来没变。**

SVG Review Pack 帮你审阅一张 SVG 的优化结果：在浏览器里运行固定版本的 SVGO，对照优化前后的渲染图，查看像素差异，再导出一份可交给别人复验的审阅包。它适合图标维护、设计交接和代码审查中需要说明「改了什么、能否重跑」的场景。

**[打开在线工具](https://fightjs.github.io/svg-review-pack/)** · [先看一个例子](#先看一个例子) · [复验审阅包](#复验审阅包) · [支持的-svg](#支持的-svg)

![真实浏览器结果：蓝色路径优化前后存在可见差异，差异图标出了不同像素](docs/images/example-result.png)

> 这是一个独立工具，并非 SVGO 官方项目。像素差异是特定渲染条件下的观察结果，不是对所有浏览器、尺寸或 SVG 语义等价性的证明。

## 先看一个例子

打开页面后会自动载入一个手写的蓝色路径示例。它使用 `transform-origin` 和旋转，灵感来自 [SVGO #2320](https://github.com/svg/svgo/issues/2320) 中讨论的问题类型，并非复制该 issue 的素材。

在记录的浏览器环境中，使用默认配置得到：

| 项目 | 观察结果 |
| --- | --- |
| 优化前 → 优化后 | 159 → 175 字节 |
| 不同像素 | 3,409 / 16,384 |
| 渲染条件 | 128 × 128 物理像素、白色背景 |
| 使用版本 | SVGO 4.1.0、pixelmatch 8.0.0 |

这个例子说明优化可能改变渲染，也可能让文件变大。**数字由页面在当前浏览器重新计算**；不同浏览器或版本可能得到不同结果。示例的历史验证材料见 [VERIFICATION.md](VERIFICATION.md)，也可以下载仓库中的[示例审阅包](evidence/example-review-pack.zip)自行复验。

## 如何使用

1. [打开页面](https://fightjs.github.io/svg-review-pack/)。先查看自动运行的示例，也可以选择或拖入一张受支持的 SVG。
2. 如有需要，修改页面中的 JSON 配置。目前只开放两个字段：

   ```json
   {
     "floatPrecision": 3,
     "multipass": false
   }
   ```

   `floatPrecision` 为 0–6 的整数；`multipass` 为布尔值。其他 SVGO 配置固定，不能加载任意插件或用户 JavaScript。
3. 点击 **优化并比较**，查看原图、优化图、差异图、文件字节数和不同像素数。
4. 检查结果后点击 **下载审阅 ZIP**。修改输入或配置会使旧结果失效，需要重新运行后才能下载。

文件在浏览器中处理，页面没有上传接口或分析统计。优化和两张图渲染成功后才允许导出；失败时不会把旧结果当作新结果。

## 审阅包里有什么

| 文件 | 用途 |
| --- | --- |
| `input.svg` / `optimized.svg` | 原始输入与实际优化结果 |
| `effective-config.json` | 运行时使用的完整固定配置 |
| `manifest.json` | 版本、渲染条件、像素数和三个文件的 SHA-256 |
| `before.png` / `after.png` / `diff.png` | 审阅时看到的两张渲染图与差异图 |
| `report.html` | 可离线打开的查看报告 |
| `verify.mjs`、`package.json`、`package-lock.json` | 在 Node.js 中重跑优化所需的脚本与依赖信息 |

`report.html` 用于**查看**，不会自动验证。SHA-256 用于检查文件是否与包内记录一致；它不是签名，无法证明作者身份或材料来源，也不能证明 SVG 安全或语义等价。

## 复验审阅包

将收到的 ZIP 解压到新目录，在该目录执行：

```bash
npm ci --ignore-scripts
node verify.mjs
```

安装依赖通常需要网络。脚本检查 SVGO 版本、配置和三个文件的哈希，再用包内输入和配置重新优化，比较输出的 UTF-8 字节。文件缺失、配置不合法、版本或字节不一致时会以非零状态退出。包内锁文件与应用构建使用的完整锁文件一致，也包括开发依赖。

复验回答的是「在当前环境中，能否用这份输入和配置重跑出相同字节」。它不会重新证明原页面的像素结果，也不保证不同浏览器的渲染一致。

## 如何理解像素差异

页面把原图和优化图放进 **128 × 128 物理像素**的白色画布，按 `viewBox` 以 `xMidYMid meet` 适配；pixelmatch 使用 `threshold: 0.1`、`includeAA: true`。设备像素比不会改变画布的物理像素尺寸。

差异为零，只表示在**当前浏览器及上述条件下**没有检测到不同像素。换背景、尺寸或浏览器后仍可能不同；动画、交互和语义也不在这项比较之内。审阅时请结合原始文件和目标使用场景判断。

## 支持的 SVG

本工具有意限制输入范围，适合简单几何图形，不是通用 SVG 优化器。原图和优化结果都会验证；不支持时会停止并说明原因，不会悄悄删去不支持的内容。

- 单文件，严格 UTF-8、无 BOM，最多 **65,536 字节**；必须是有效 XML，根元素为 SVG 命名空间下的 `svg`，并有有限、宽高为正的 `viewBox`。
- 最多 300 个元素、20 层嵌套（根元素算第 1 层）；单个 `d` 属性最多 8,192 个字符。
- 支持 `svg`、`g`、`path`、`rect`、`circle`、`ellipse`、`line`、`polyline`、`polygon`，以及限定的几何、填充、描边、透明度和变换属性。
- 不支持嵌套 SVG、CSS/style、脚本、事件、文字、图片、`use`、动画、URL、渐变、滤镜或外部引用；未知元素、属性和命名空间会被拒绝。
- 配置固定使用 `preset-default`、`path: input.svg`、LF 和非美化输出。优化在 worker 中运行，超时为 10 秒；worker **不是安全沙箱**。

属性白名单和具体语法以 [输入校验实现](src/svg.js) 为准；浏览器对不认识的颜色标识符可能忽略该颜色。若你的文件超出范围，请先在可信工具中处理，再人工确认是否适合使用本项目。

## 本地运行与开发

需要 Node.js **20.13 或更高版本**及 npm：

```bash
git clone https://github.com/FightJs/svg-review-pack.git
cd svg-review-pack
npm ci --ignore-scripts
npm run dev
```

打开 Vite 输出的本地地址。生产预览使用 `npm run build` 和 `npm run preview`；请通过 HTTP(S) 提供构建文件，直接以 `file://` 打开应用不一定能加载模块 worker。

```bash
npm run typecheck
npm test
npm run build
node tests/verify-export.mjs
```

最后一条命令会对仓库中的示例 ZIP 进行临时安装、复验及篡改检查，通常需要网络。[验证记录](VERIFICATION.md)还列出了浏览器测试、浏览器与 Node 入口的有限样本比对，以及未覆盖的情况；有限样本结果不代表所有 SVG 或平台都一致。

## 反馈与许可证

遇到误判或无法复现的结果，欢迎[提交 issue](https://github.com/FightJs/svg-review-pack/issues)，并在适合公开的前提下附上最小 SVG、配置、浏览器版本和审阅包；请勿提交不便公开的素材。

项目采用 [MIT License](LICENSE)。SVGO、pixelmatch、JSZip 等依赖保留各自的许可证和版权声明，详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
