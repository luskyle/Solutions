# Solutions

面向工控 / 上位机桌面软件开发的专题集与素材库（2017 年起积累）。

- 站点：[luskyle.github.io/Solutions](https://luskyle.github.io/Solutions/)
- 首页与专题导航见 [docs/index.md](docs/index.md)
- 200+ 篇原始笔记位于 `docs/`（随站点发布、可搜索，不入导航）
- 密钥 / 注册码等不便公开的内容位于 `offline/`（不入站点）

## 专题

| 专题 | 状态 |
| --- | --- |
| [无边框窗体与视觉细节](docs/topics/01-window-vfx.md) | 撰写中 |
| [DataGridView 实战](docs/topics/02-datagridview.md) | 撰写中 |
| [Excel 导出（NPOI）](docs/topics/03-excel-npoi.md) | 撰写中 |
| [条码与图形](docs/topics/04-barcode-graphics.md) | 撰写中 |
| [产线集成](docs/topics/05-line-integration.md) | 撰写中 |
| [异步与文件 IO](docs/topics/06-async-io.md) | 撰写中 |
| [打包与交付](docs/topics/07-packaging-delivery.md) | 撰写中 |
| [系统集成小技巧](docs/topics/08-system-integration.md) | 撰写中 |

## 构建与部署

- 生成器：MkDocs（Material 主题）
- 部署：GitHub Actions（`.github/workflows/deploy.yml`）→ GitHub Pages，无需本地构建或手工推送 `gh-pages`
- 本地预览：`pip install mkdocs-material jieba && mkdocs serve`

## 仓库结构

| 路径 | 说明 |
| --- | --- |
| `docs/` | 站点源：`index.md` 首页、`topics/` 八专题、其余为素材笔记 |
| `offline/` | 密钥 / 注册码等不便公开内容，不入站点 |
| `.github/workflows/deploy.yml` | 站点构建与发布 |