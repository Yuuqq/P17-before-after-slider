# Code Review: P17-before-after-slider

审查对象是当前 `main` 上的修复，不是 PR #3 那份过期 diff。PR #3（`ce4d0a4`）不要合：它落后当前 `main` 9 个提交，合并状态是 dirty，而且会删掉课堂说明、`modern-styles.css`，并把 Service Worker 缓存名退回 `journalism-tool-v1`。

## 这次修掉的

### 滑块把灾后图重新裁切（原 HIGH）

`#afterImg` 以前是 `#afterWrap` 的 100% 宽。拖动滑块会改变后图元素的盒子，`object-fit: cover` 随之重新裁切，两帧对不齐。

现在 `.compare` 是 `inline-size` 容器，`.after-wrap img` 的宽度是 `100cqi`（对比框的宽度），高度仍是对比框的高度。滑块只改变裁切窗口。两张图都 `object-fit: cover`、`object-position: center`。`img { max-width: 100% }` 被 `.compare img` 的 `max-width: none` 压住。

仍保留 16:9 画幅。竖图上下会被裁掉，但两张图裁的是同一套框，拖动时不再变。这和 SPEC 里「自动缩放到同一尺寸」一致，动态比例留给以后。

### 图片加载

`FileReader.readAsDataURL` 换成 `URL.createObjectURL`。只回收这张 `<img>` 上一次由本页创建的 `blob:` URL，不回收示例图的 `data:` URL。换图有序号，慢返回的解码不会盖住新图。

成功状态写在 `onload` 里，而且两张图都解码出像素后才记一次完成。解码失败会撤掉 `src`，状态写成错误。超过 10MB、以及 `image/svg+xml`，在赋值前拒绝。空 MIME 仍交给浏览器解码，避免误伤 HEIC。取消选择文件不会把状态改成已加载。示例图会先作废上一次加载的序号和回调，避免慢解码把示例状态盖掉。

### Service Worker

缓存名升到 `journalism-tool-P17-v5-slider-align`，高于 `main` 上的 `...r20260922`。预缓存清单仍是页面真正引用的脚本，没有改去缓存未使用的 `loader.js`。`waitUntil` 保留。脚本缓存未命中且网络失败时返回 504 `Response`，不再把 `undefined` 交给 `respondWith`。

### 其他

- `alt` 改为「灾前图 / 灾后图」。没有加入 `<img ... / loading>` 这种多斜杠写法。
- `#demoBtn` 不再无限 `btnPulse`。
- `pm-metrics.js` 的集群和默认任务改成这个工具自己的名字。两张图都就绪后调用一次 `markTaskComplete("slider_compare")`。遥测仍只写 `localStorage`。

## 还没做

- `../shared/` 在孤立克隆或 `file://` 下会 404。Pages 上用户站点的 `/shared/` 是通的。绝对 URL 回退在 PR #1，不在这里重复。
- 非文档请求的离线失败现在有响应，但没有可用的脚本替身。离线时共享脚本本来就不在这个仓库里。
- 没有端到端测试套件。课堂页用一次手动或浏览器脚本覆盖「示例 + 拖动 + 宽度不变」就够，不必上 Cypress。
- `README.md` 仍把暗色模式和 Ctrl+K 算作本仓库的功能。它们来自 `../shared/`，不在本仓库。
- `QA.md` 的勾选没有覆盖这次的对齐修复。

## 安全

没有上传、没有密钥、没有把文件名写进 HTML。`file.type` 只用来挡 SVG 和明显的非图片，不是安全边界。
