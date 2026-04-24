# PRD & Technical Plan: 增加上旋类技能及相关水平标准

## Summary (概要)
当前系统中的技能分类（如正手、反手）缺少现代网球核心的“上旋 (Topspin)”相关技术。本计划将在数据模型中补充正手上旋、反手上旋的基础、进阶及特殊应用（如挑高球）的详细技能，添加相应的痛点与练习处方，并将其整合到 Level 3.0 ~ 5.0 的水平标准中。同时，输出并更新 PRD 和 Technical Architecture 文档。

## Current State Analysis (现状分析)
- `src/data/mockData.ts` 中的 `skills` 包含了平击、控制、深度、力量等维度，但没有专门针对上旋的技能定义。
- 缺少上旋相关的常见痛点（如：击球太平无摩擦、摩擦过多导致球浅、拍头掉不下去）及纠正练习（Drill）。
- `levels` 数据中，从 3.0 到 5.0 阶段，并没有要求学员掌握上旋球的明确指标。

## Proposed Changes (具体修改方案)

### 1. 更新数据层 (`src/data/mockData.ts`)
#### 1.1 新增练习处方 (Drills)
向 `drills` 数组中添加以下 3 个练习处方：
- **雨刷器挥拍练习 (`drill-topspin-wiper`)**: 纠正击球太平、缺乏摩擦的问题。在铁丝网前做由下往上的雨刷器动作，体会摩擦感。
- **上旋推挡结合练习 (`drill-topspin-drive`)**: 纠正摩擦过多、向前推送不够导致球太浅的问题。要求在平击深度的基础上逐渐增加向上摩擦。
- **反手拍头掉落练习 (`drill-bh-drop`)**: 纠正反手拍头掉不下去导致无法产生上旋的问题。

#### 1.2 新增技能与痛点 (Skills)
向 `skills` 数组中添加以下 6 个详细技能，归类在“正手”和“反手”下，难度分布在 3 到 5：
- **正手 (Forehand)**
  - `forehand-topspin-basic` (正手基础上旋): 掌握现代网球基本的正手上旋击球，增加过网高度。关联痛点：击球太平 (`pp-fh-topspin-flat` -> `drill-topspin-wiper`)。
  - `forehand-topspin-heavy` (正手强烈上旋): 打出红土式强烈上旋，高弹跳压制。关联痛点：球太浅 (`pp-fh-topspin-short` -> `drill-topspin-drive`)。
  - `forehand-topspin-lob` (正手上旋挑高球): 被动防守或穿越网前对手的利器。
- **反手 (Backhand)**
  - `backhand-topspin-basic` (反手基础上旋): 掌握反手拍头掉落与向上摩擦。关联痛点：拍头掉不下去 (`pp-bh-topspin-net` -> `drill-bh-drop`)。
  - `backhand-topspin-heavy` (反手强烈上旋): 制造大角度与高弹跳。
  - `backhand-topspin-lob` (反手上旋挑高球): 反手位的过顶穿越球。

*(注：由于没有对应的新图片素材，新技能的 `imageSource` 将留空，以避免打包崩溃。)*

#### 1.3 更新水平标准 (Levels)
修改 `levels` 数组，将上述新技能 ID 分配到对应水平：
- **Level 3.0 & 3.5**: 加入 `forehand-topspin-basic`, `backhand-topspin-basic`
- **Level 4.0**: 加入上述两项，并新增 `forehand-topspin-heavy`, `backhand-topspin-heavy`
- **Level 4.5 & 5.0**: 加入上述四项，并新增 `forehand-topspin-lob`, `backhand-topspin-lob`

### 2. 更新文档层 (PRD & Tech Doc)
#### 2.1 更新 PRD (`.trae/documents/prd.md`)
- 在 **2.4 水平标准细则** 中，调整 3.0 ~ 5.0 的技能要求描述，显式加入“上旋 (Topspin)”的字眼（如：3.0 掌握基础上旋，4.0 掌握强烈上旋等）。
- 在 **2.5 痛点与练习处方机制** 中，增加关于上旋痛点的举例说明（例如“击球太平没有摩擦”对应“雨刷器挥拍练习”）。

#### 2.2 更新 Technical Architecture (`.trae/documents/technical-architecture.md`)
- 在 **6.3 初始数据示例** 中，补充上旋相关的 `Drill` 和 `Skill` 示例，展示其数据结构和痛点关联逻辑，为后续研发提供直接参考。

## Assumptions & Decisions (假设与决策)
- **技能分类归属**：上旋技能继续归属在“正手”和“反手”的 category 下，不单独创建“上旋”大类，这更符合用户的筛选直觉。
- **无配图处理**：由于当前本地 assets 中没有上旋专属图片，新加的技能将省略可选的 `imageSource` 字段，前端已有默认占位图逻辑，不会影响页面渲染。

## Verification Steps (验证步骤)
1. 检查 TypeScript 类型是否正确，确保新增的 Drill 和 Skill 结构符合 `src/types/index.ts` 定义。
2. 确保 `levels` 中的 `skills` 引用 ID 与新增的 `skills.id` 完全一致。
3. 检查 PRD 和技术架构文档是否已正确包含上旋相关的产品定义和技术示例。