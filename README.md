# Solutions

面向工控 / 上位机桌面软件开发的专题集与素材库（2017 年起积累）。

> 我已经很久没往这个项目里添加内容了，今后也不打算继续添加。这个项目是我当年新手初期时候做的。当我还是新手还在不断增长见识的时候，遇到新知识就迫不及待想记录下来，我怕忘了，留着未来翻阅，同时也为了别人能够从我的经验中受益。随着经验的累计，见识的增长，我早已经不需要害怕忘记这些知识了。
>
> 尤其是 AI 时代，有了 AI 的协助，博文强识就更加没有必要了。省下来的精力，完全可以投入更加具有创造性的工作。从“古法编程”时代一路走来，其实思考的不是 AI 是否能够替代我们。如果你认为 AI 是强力的助手，那你具有主体意识，你主导项目的走向，贯彻你的意图；如果你认为 AI 是威胁，那说明你把自己当做工具。你的工具性太强，而工具性是 AI 时代要被替代的。
>
> AI 可以让经验累计更加容易，但这不意味着有了 AI 就不需要积累经验了。
>
> 我按专题将这个项目变得更加易于阅读，希望对你有所帮助。

- 站点：[luskyle.github.io/Solutions](https://luskyle.github.io/Solutions/)
- 首页与专题导航见 [docs/index.md](docs/index.md)
- 200+ 篇原始笔记位于 `docs/`（随站点发布、可搜索，不入导航）
- 密钥 / 注册码等不便公开的内容位于 `offline/`（不入站点）
- 协议：[CC BY-SA 4.0](LICENSE)（署名 - 相同方式共享）

## 桌面知识工作台（开发预览版）

基于 **Code - OSS** 源码构建的独立桌面应用，而不是浏览器资料库。打开本机任意目录，以子目录作为集合、文件作为来源，在多标签工作台中浏览资料、按集合搜索证据和查看 Git 历史。不复制、移动或自动上传原始文件。

已构建的本机环境可直接启动：

```bash
npm start -- /absolute/path/to/your/knowledge
```

也可以执行 `npm start` 后通过“知识：打开文件夹”选择目录。全新检出需先安装本机构建前置条件，使用上游要求的 Node.js 24.22.1+（同一主版本），再执行 `npm run desktop:prepare`；这会下载并构建固定版本的 Code - OSS，首次需要网络、数 GB 磁盘与较长时间。

- 当前支持 Markdown/文本、DOCX 段落、PPTX 页面文字与备注、draw.io 节点与连线、图片原图预览。
- Git 支持当前分支的相关提交、历史文件内容、提取文字结构对照与原始 Git 差异，不切换分支、不改动工作区。
- Office 为结构阅读而非原版式渲染；暂不支持旧 DOC/PPT、PDF、图片 OCR、生成式问答或自动解释变更动机。

构建、操作、限制与验证方式见 [桌面应用说明](desktop/README.md)。最早的浏览器实验版仍保留为 `npm run legacy:web`，其 [独立说明](knowledge/README.md) 不代表桌面版能力。完整规划见 [产品设计草案](knowledge/DESIGN.md)。

## 专题

| 专题                                                  | 状态   |
| ----------------------------------------------------- | ------ |
| [无边框窗体与视觉细节](docs/topics/01-window-vfx.md)   | 已发布 |
| [DataGridView 实战](docs/topics/02-datagridview.md)    | 已发布 |
| [Excel 导出（NPOI）](docs/topics/03-excel-npoi.md)     | 已发布 |
| [条码与图形](docs/topics/04-barcode-graphics.md)       | 已发布 |
| [产线集成](docs/topics/05-line-integration.md)         | 已发布 |
| [异步与文件 IO](docs/topics/06-async-io.md)            | 已发布 |
| [打包与交付](docs/topics/07-packaging-delivery.md)     | 已发布 |
| [系统集成小技巧](docs/topics/08-system-integration.md) | 已发布 |

## 构建与部署

- 生成器：MkDocs（Material 主题）
- 部署：GitHub Actions（`.github/workflows/deploy.yml`）→ GitHub Pages，无需本地构建或手工推送 `gh-pages`
- 本地预览：`pip install mkdocs-material jieba && mkdocs serve`

## 仓库结构

| 路径                             | 说明                                                          |
| -------------------------------- | ------------------------------------------------------------- |
| `docs/`                        | 站点源：`index.md` 首页、`topics/` 八专题、其余为素材笔记 |
| `offline/`                     | 密钥 / 注册码等不便公开内容，不入站点                         |
| `.github/workflows/deploy.yml` | 站点构建与发布                                                |
| `desktop/`                    | Code - OSS 固定基线、补丁、内置知识扩展与桌面验证             |
| `.desktop/`                   | 本机生成的上游源码、依赖、桌面运行时与独立用户配置（已忽略）  |
| `knowledge/`                  | 产品设计草案与早期浏览器实验版                               |
| `.knowledge/`                 | 本机生成的 SQLite 数据库（已忽略，不随站点发布）              |
