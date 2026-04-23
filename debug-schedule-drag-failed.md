# Debug Session: schedule-drag-failed

## Meta
- **Session ID:** schedule-drag-failed
- **Status:** [CLOSED]
- **Bug Description:** 长按后滑动，不会触发滚动，但是还是无法移动时间块。在 ScheduleListScreen 中，长按课程卡片后虽然禁止了 ScrollView 滚动，但拖拽动作未能正常改变课程的 `top` 位置，释放后也没有保存新的时间。

## Hypotheses
1. **Hypothesis 1:** `onPanResponderMove` 中的更新逻辑被阻止。可能是 `isDraggingRef.current` 状态在移动中没有正确同步或被意外重置，导致 `setDragOffset(gestureState.dy)` 没有执行。
2. **Hypothesis 2:** `gestureState.dy` 的值没有被正确传递到渲染组件的 `top` 样式中。当前代码 `currentTop = isDragging ? top + dragOffset : top;` 中，可能 `isDragging` (`draggingLessonId === lesson.id`) 计算为 `false`，导致 `currentTop` 始终为原始 `top`。
3. **Hypothesis 3:** 发生了频繁的 `setState` (例如 `setDragOffset`) 导致 React 渲染跟不上，或者因为重渲染导致手势意外终端，特别是与父级 `ScrollView` 在处理滚动事件的竞争时，React 的重绘阻断了拖拽反馈。

## Root Cause
经分析证实了 Hypothesis 3 和 2 的结合问题。由于我之前的实现中，将每个卡片渲染放在了一个庞大的 `renderLessons` 方法中，并依赖全局的 `dragOffset` 状态进行 `setState` 重绘。这种方法在 React Native 中极其脆弱：
1. 频繁的 `setState` 引起整个页面的重绘，造成严重的卡顿并阻断手势持续捕获。
2. 没有使用原生的 `Animated` API，导致位置修改无法平滑过渡，`top` 属性未能实时响应手势的 `dy`。

## Fix Plan
已彻底重构：
1. 抽离独立的组件 `DraggableLessonCard`，将拖拽逻辑和状态局限在单张卡片内。
2. 放弃通过 `setState` 更新 `top`，全面改用 React Native 官方的 `Animated.ValueXY` 和 `Animated.View`。
3. 使用 `transform: [{ translateY: pan.y }]` 来处理实时位置变化，将拖拽渲染推给原生线程执行。
4. 拖拽结束后，使用 `Animated.spring` 提供回弹效果，并同步修改后端存储时间。