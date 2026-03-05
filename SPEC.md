# P17 Spec - 灾前/灾后对比滑块

## 1. Summary

- **Project ID**: P17
- **Project Name**: 灾前/灾后对比滑块
- **Goal**: 拖拽滑块叠加对比两张图片（灾前/灾后），适合视觉新闻报道
- **User Persona**: 视觉编辑 / 记者

## 2. Scope

- **In scope**:
  - 拖拽滑块叠加对比两张图片（灾前/灾后）
  - 适合视觉新闻报道
- **Out of scope**:
  - 后端代理或服务端逻辑
  - API Key 持久化存储

## 3. UX

- **Core workflow**: 用户输入 → 前端处理 → 结果展示
- **Inputs**: 两张对比图片
- **Outputs**: 拖拽对比滑块组件
- **States**: empty (初始) / loading (处理中) / error (失败) / success (完成)

## 4. Functional Requirements

1. FR-1: 拖拽滑块叠加对比两张图片（灾前/灾后）
2. FR-2: 结果可视化展示
3. FR-3: 错误状态可见提示

## 5. Non-Functional Requirements

- **Performance**: 核心任务 3 分钟内完成
- **Accessibility**: 键盘导航、aria-label、焦点可见、WCAG AA 对比度
- **Privacy**: 本地处理优先，不默认上传数据
- **Browser support**: 现代 Chromium (Chrome 110+)

## 6. Dependencies

- **Libraries/CDNs**: 无外部依赖
- **Local data**: 无

## 7. Risks & Mitigations

- **Risk**: 图片尺寸不一致时对齐问题
- **Mitigation**: 自动缩放至相同尺寸

## 8. Acceptance Criteria

- [ ] 双图上传
- [ ] 滑块对比
- [ ] 移动端可用
- [ ] 纯静态页面可部署 GitHub Pages
- [ ] 移动端可用
- [ ] 隐私提示清晰可见
