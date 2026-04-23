# App 迭代升级计划 (Feedback V1)

## 1. 需求背景与总结 (Summary)
根据最新的用户反馈，本次迭代将重点强化**学生端的自我记录能力**与**教练端的教学管理效率**。
核心目标包括：
1. **学生端**：引入结构化的训练打卡功能（记录时间、时长、练习内容）。
2. **教练端**：新增独立的「日程表」视图，按天管理课程安排并关联学员。
3. **教练端**：新增「10节课长期规划」功能，支持生成学习蓝图，并导出为长图发送给学员。
4. **体验优化**：根据用户模式（学生/教练）动态分配底部 Tab 导航，提供更专注的角色体验。

## 2. 现状分析 (Current State Analysis)
- **导航结构**：目前为静态的 4 个 Tab（水平、技能、记录、教练），未能完全按角色分离，存在一定的认知干扰。
- **数据模型**：现有的 `Note`（备忘录）模型过于简单，缺乏针对网球训练的时长、重点技能等结构化字段。教练端的 `LessonPlan` 仅针对单节课，缺乏长期规划 (`LongTermPlan`) 实体。
- **技术栈**：当前缺乏长图截取与分享的基础设施（未安装 `react-native-view-shot` 等截图库）。

## 3. 详细修改方案 (Proposed Changes)

### 3.1 导航栏动态分发 (Role-Based Navigation)
- **改动说明**：根据 Zustand 状态中的 `isCoachMode` 动态渲染底部 Tab。
- **学生模式**：Tab 1: 水平 (Level) | Tab 2: 技能 (Skills) | Tab 3: 打卡记录 (Training Record)
- **教练模式**：Tab 1: 水平 (Level) | Tab 2: 技能 (Skills) | Tab 3: 日程表 (Schedule) | Tab 4: 学员管理 (Students)

### 3.2 学员端：结构化训练打卡 (Training Record)
- **PRD 更新**：原“记录”页面升级为“训练打卡”功能。支持选择日期、填写训练时长（如 1.5 小时）、关联本次练习的重点技能，并可填写自由备注。
- **Tech Arch 更新**：在数据模型中新增 `SessionRecord` 接口，替代或继承现有的 `Note` 模型，加入 `duration`、`focusSkillIds` 字段。

### 3.3 教练端：独立日程表 Tab (Coach Schedule)
- **PRD 更新**：为教练新增「日程」Tab。以日历或按天列表的形式展示当天的所有课程安排（即所有未来的 `LessonPlan` 数据或专门的 `Schedule` 记录），并直观显示上课的学员姓名与时间。
- **Tech Arch 更新**：增加 `ScheduleTab` 路由栈，利用现有的 `LessonPlan` 模型（扩充具体的上课时间字段 `startTime`, `endTime`）来聚合并渲染日程视图。

### 3.4 教练端：10节课长期规划与长图导出 (10-Lesson Blueprint & Image Export)
- **PRD 更新**：在“学员详情页”新增「生成十节课规划」功能。教练可以设定一个长期目标，并依次为第1至第10节课规划重点技能。规划完成后，可一键生成美观的排版并导出为长图分享给学员。
- **Tech Arch 更新**：
  - 数据模型：新增 `LongTermPlan` 实体（包含 `studentId`, `title`, `lessons: { lessonNumber, focusSkillIds, description }[]`）。
  - 第三方库：引入 `react-native-view-shot` 截取视图，结合 `expo-sharing` 调用系统原生分享面板将截图发给学员。
  - 路由视图：新增 `LongTermPlanScreen` 渲染用于截图的专属长图样式。

## 4. 文档更新任务清单 (Documentation Updates)
- [ ] 修改 `prd.md`：
  - 更新 **2.1 User Roles**，明确学生和教练分别看到的 Tab。
  - 更新 **2.2 Feature Module**，添加打卡、日程表、10节课规划的描述。
  - 更新 **2.3 Page Details** 映射表。
  - 补充 **长图导出** 相关的交互流程说明。
- [ ] 修改 `technical-architecture.md`：
  - 修正架构图，体现动态 Tab 路由逻辑。
  - 补充 `SessionRecord` 和 `LongTermPlan` 数据结构定义。
  - 增加 `react-native-view-shot` 和 `expo-sharing` 依赖说明。

## 5. 验证与后续执行 (Verification)
此计划仅涉及对 `prd.md` 和 `technical-architecture.md` 的文本与架构设计更新。待用户确认此计划后，将立即执行对上述两个文档的编辑操作，并确保 Markdown 格式正确、Mermaid 图表能正常渲染。