# Solutions

面向工控 / 上位机（HMI、MES 客户端、产线工具）桌面软件开发的专题集。仓库沉淀于 2017–2024，现以专题文章的形式对外输出；旧笔记作为素材库随站点发布、可搜索，但不进入导航。

## 专题

| 专题 | 定位 | 状态 |
| --- | --- | --- |
| [无边框窗体与视觉细节](topics/01-window-vfx.md) | WPF/Winform 自绘窗口：拖动、阴影、缩放、Popup | 撰写中 |
| [DataGridView 实战](topics/02-datagridview.md) | 产线界面核心控件：自绘、排序、编辑、滚动 | 已发布 |
| [Excel 导出（NPOI）](topics/03-excel-npoi.md) | 样式、合并单元格、列宽自适应 | 撰写中 |
| [条码与图形](topics/04-barcode-graphics.md) | Code128/Code39、截图、绘图 | 撰写中 |
| [产线集成](topics/05-line-integration.md) | PLC 地址表、打印机、Access、部署权限 | 已发布 |
| [异步与文件 IO](topics/06-async-io.md) | Async/Await、文件 IO、目录搜索 | 已发布 |
| [打包与交付](topics/07-packaging-delivery.md) | VS 打包、inno setup、注册 ocx、权限 | 撰写中 |
| [系统集成小技巧](topics/08-system-integration.md) | 快捷键、U 盘与端口排查、注册表配置 | 已发布 |

!!! note "素材库"
    2017–2024 年间积累的 200+ 篇原始笔记随站点发布，可用站内搜索找到，但不在左侧导航中。密钥、注册码等不便公开的内容存放在仓库根目录的 `offline/` 下，不会发布。

## 站点说明

- 生成器：MkDocs（Material 主题），部署：GitHub Actions → GitHub Pages
- 源码：[luskyle/Solutions](https://github.com/luskyle/Solutions)

## 更新记录

| 日期 | 内容 |
| --- | --- |
| 2026-09-16 | 发布专题《DataGridView 实战》《产线集成》《异步与文件 IO》《系统集成小技巧》 |
| 2026-09-16 | 仓库收尾：素材库迁移至 `docs/`、新增站点与专题导航，旧的 Hexo/Travis/gh-pages 发布流程退役 |