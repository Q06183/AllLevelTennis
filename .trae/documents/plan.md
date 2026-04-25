# AllLevelTennis 跨端适配与重构计划

## 1. 现状分析 (Current State Analysis)
在对整个 App 进行跨端兼容性排查后，发现以下问题：

1. **仅 iOS 实现的功能 (`StudentListScreen.tsx`)**：
   - “新增学员”功能中使用了 `Alert.prompt`。这是一个**仅支持 iOS 的原生 API**。
   - 虽然代码中为了兼容 Android 编写了 `else` 分支并实现了一个自定义的 `<Modal>` 弹窗，但这导致了**两端用户体验不一致**，且增加了后续维护表单逻辑的成本（如增加校验、多字段输入等）。
2. **键盘避让体验不一致 (跨端表单缺陷)**：
   - 移动端 App 在表单输入时，键盘容易遮挡底部输入框。目前仅在 `SkillDetailScreen.tsx` 和 `StudentListScreen.tsx` 中使用了 `KeyboardAvoidingView`。
   - 其他包含大量底部输入的表单页（如教案编辑、长期规划编辑、打卡编辑等）完全**遗漏了键盘避让处理**，导致在 iOS 设备（或部分 Android 设备）上输入长文本时，视图无法自动上推，严重影响可用性。

## 2. 拟定修改 (Proposed Changes)

### 2.1 重构与统一“新增学员”弹窗逻辑
- **文件**: `src/screens/StudentListScreen.tsx`
- **操作**:
  - 移除 `if (Platform.OS === 'ios') { Alert.prompt(...) }` 的平台特异性代码。
  - **统一使用自定义的 `Modal` 组件**来处理 iOS 和 Android 的“新增学员”交互。
  - 清理多余的 `Platform` 引用。
- **目的**: 让跨端交互保持绝对一致，逻辑更加清晰，为以后可能的表单字段扩展（如录入联系方式等）打下统一基础。

### 2.2 全局补全并规范 `KeyboardAvoidingView`
- **文件**: 
  - `src/screens/LessonPlanEditScreen.tsx`
  - `src/screens/LongTermPlanEditScreen.tsx`
  - `src/screens/TrainingRecordEditScreen.tsx`
  - `src/screens/NotesScreen.tsx`
- **操作**:
  - 在这些页面的最外层或 `ScrollView` 外层包裹 `KeyboardAvoidingView`。
  - 统一配置跨端属性：`behavior={Platform.OS === 'ios' ? 'padding' : undefined}`。
- **目的**: 修复 iOS 下输入框被键盘遮挡的严重缺陷，确保两端输入体验的健壮性。

## 3. 假设与决定 (Assumptions & Decisions)
- **决定**: 废弃 iOS 原生的 `Alert.prompt` 而不是引入第三方库去模拟。因为 App 内已经实现了一套美观的自定义 `Modal`（含深色半透明遮罩与居中卡片），直接复用是最优解。
- **决定**: 针对 Android，`behavior={undefined}` 是因为 Expo 默认在 `AndroidManifest.xml` 中配置了 `windowSoftInputMode="adjustResize"`，Android 原生层会自动处理布局压缩，不需要 RN 层的过度干预；而 iOS 则必须依赖 `padding` 行为。

## 4. 验证步骤 (Verification steps)
1. 运行代码检查，确保无语法报错。
2. 验证 `StudentListScreen` 中的“新增学员”按钮，确认 iOS 和 Android 均弹出自定义的卡片式弹窗，且能成功创建学员。
3. 验证四个表单编辑页面 (`LessonPlanEdit`, `LongTermPlanEdit`, `TrainingRecordEdit`, `Notes`)，当聚焦底部多行输入框（如“课后总结”、“备忘录内容”）时，页面能正确上推，不被键盘遮挡。