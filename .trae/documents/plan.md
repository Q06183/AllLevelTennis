# 数据迁移功能实现计划 (Data Migration Feature Plan)

## 1. 目标与背景 (Summary)
用户需要一个“一键导出所有数据”的能力，以便在更换手机时能够方便地进行数据迁移。
根据项目的“极简交互”与“直接操作”原则，计划在现有的全局顶部菜单（学生/教练模式切换的下拉菜单）中，直接增加“导出数据”和“导入数据”的快捷入口。

## 2. 现状分析 (Current State Analysis)
- **数据存储**：当前应用使用 `Zustand` 结合 `persist` 中间件，将数据存储在 `AsyncStorage` 中。包含两个主要的 Store：`tennis-app-storage` (学生端数据) 和 `all-level-tennis-coach-storage` (教练端数据)。
- **UI 入口**：在 `src/navigation/AppNavigator.tsx` 中，右上角有一个包含 `Modal` 的下拉菜单，目前仅用于切换“学生模式”和“教练模式”。
- **依赖库**：项目中已安装 `expo-sharing`，但尚未安装用于文件系统操作和文件选择的库。

## 3. 拟定变更 (Proposed Changes)

### 3.1 完善产品与技术文档
- **修改文件**：`.trae/documents/prd.md`
  - **内容**：在 Core Features 中新增「数据迁移」功能说明，阐述导出（生成 JSON 备份文件并调用系统分享）和导入（选择 JSON 文件并覆盖现有数据）的流程。
- **修改文件**：`.trae/documents/technical-architecture.md`
  - **内容**：补充 `expo-file-system` 和 `expo-document-picker` 依赖说明；新增 `DataMigration` 的架构设计，明确通过 Zustand 的 `setState` 实现数据重水合（Rehydration），避免需要强杀 App 重启。

### 3.2 安装依赖
- 执行命令安装所需 Expo 模块：
  ```bash
  npx expo install expo-file-system expo-document-picker
  ```

### 3.3 创建数据迁移工具类
- **新增文件**：`src/utils/dataMigration.ts`
  - **`exportData()`**：
    1. 从 `AsyncStorage` 读取 `tennis-app-storage` 和 `all-level-tennis-coach-storage`。
    2. 构造成统一的 JSON 对象，并附加版本号与时间戳。
    3. 利用 `expo-file-system` 将 JSON 写入应用的缓存目录。
    4. 利用 `expo-sharing` 调用系统原生分享面板，用户可将其 AirDrop 或保存到“文件”。
  - **`importData()`**：
    1. 调用 `expo-document-picker` 让用户选择备份的 JSON 文件。
    2. 读取文件内容并解析，校验文件格式。
    3. 弹出二次确认弹窗，警告用户当前数据将被覆盖。
    4. 确认后，通过 `useStore.setState()` 和 `useCoachStore.setState()` 直接覆盖内存状态（Zustand 的 persist 中间件会自动将其同步到 AsyncStorage）。
    5. 提示导入成功。

### 3.4 更新 UI 交互
- **修改文件**：`src/navigation/AppNavigator.tsx`
  - **内容**：
    1. 在现有的 `Dropdown Menu` 中，增加一条分隔线（Divider）。
    2. 添加“导出数据”和“导入数据”两个 `TouchableOpacity` 菜单项。
    3. 绑定点击事件，点击后关闭下拉菜单并分别调用 `exportData` 和 `importData`。
    4. **硬约束检查**：确保菜单内的条件渲染严格使用三元运算符或强制布尔转换（例如不使用 `&&` 直接渲染组件）。

## 4. 假设与决策 (Assumptions & Decisions)
- **直接状态覆盖**：使用 `setState()` 直接覆盖 Zustand 状态，避免了在 React Native 中难以实现的热重启（Reload）问题。
- **极简交互**：不增加额外的“设置”页面，将数据迁移功能直接放在高频的下拉菜单中，符合直接操作理念。
- **文件格式**：统一采用 `.json` 格式，保证跨端兼容与可读性。

## 5. 验证步骤 (Verification Steps)
1. 运行应用，点击右上角菜单，点击“导出数据”，验证是否成功拉起系统分享面板并导出包含正确内容的 JSON 文件。
2. 在应用中随意添加一些测试数据（如打卡记录、学员）。
3. 再次点击“导入数据”，选择刚才导出的 JSON 文件，同意覆盖。
4. 验证应用内的数据是否瞬间恢复至导出时的状态，且无任何渲染崩溃（特别是 RN 的 Text 渲染错误）。