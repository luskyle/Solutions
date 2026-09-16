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

## 专题

| 专题                                                  | 状态   |
| ----------------------------------------------------- | ------ |
| [无边框窗体与视觉细节](docs/topics/01-window-vfx.md)   | 撰写中 |
| [DataGridView 实战](docs/topics/02-datagridview.md)    | 撰写中 |
| [Excel 导出（NPOI）](docs/topics/03-excel-npoi.md)     | 撰写中 |
| [条码与图形](docs/topics/04-barcode-graphics.md)       | 撰写中 |
| [产线集成](docs/topics/05-line-integration.md)         | 已发布 |
| [异步与文件 IO](docs/topics/06-async-io.md)            | 已发布 |
| [打包与交付](docs/topics/07-packaging-delivery.md)     | 撰写中 |
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
