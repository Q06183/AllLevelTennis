export interface Level {
  id: string;       // 水平ID，如"0", "1.0", "2.5"等
  name: string;     // 水平名称
  description: string; // 水平描述
  skills: string[]; // 该水平需要掌握的技能ID列表
  expectedTime?: string; // 预期练习投入时间
}

export interface PainPoint {
  id: string;
  description: string; // 痛点描述
  recommendedDrillIds: string[]; // 推荐的练习处方ID
}

export interface Drill {
  id: string;
  name: string;
  description: string;
  steps: string[];
  difficulty: number;
}

export interface Skill {
  id: string;       // 技能ID
  name: string;     // 技能名称
  category: string; // 技能分类（正手、反手、发球等）
  description: string; // 技能描述
  tips: string[];   // 技能技巧
  difficulty: number; // 技能难度（1-5）
  imageSource?: any; // 技能相关动作的本地配图 (e.g. require('../assets/image.png'))
  painPoints?: PainPoint[]; // 常见痛点分析与推荐练习
}

export interface Note {
  id: string;       // 笔记ID
  skillId: string;  // 关联的技能ID（为空时表示通用笔记）
  content: string;  // 笔记内容
  createdAt: string; // 创建时间（包含日期和时间）
  updatedAt: string; // 更新时间（包含日期和时间）
}

export interface SessionRecord {
  id: string;
  date: string;      // 打卡日期
  duration: number;  // 训练时长（例如 1.5 小时）
  trainingTypes?: string[]; // 训练类型多选 (例如 ["底线对拉", "多球训练"])
  focusSkillIds: string[]; // 本次练习的重点技能
  notes: string;     // 自由备注/心得
  createdAt: string;
  updatedAt: string;
}

export interface SkillCompletion {
  [skillId: string]: boolean;
}

export interface SkillAssessment {
  skillId: string;
  completed: boolean;
  painPointIds: string[]; // 学员在该技能上存在的痛点
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar?: string;
  currentLevelId: string;
  assessments: Record<string, SkillAssessment>; // key 为 skillId
  lastLessonDate?: string;
}

export interface LessonPlan {
  id: string;
  studentId?: string; // 改为可选，因为允许不建立档案
  studentName?: string; // 当没有关联学员档案时，直接显示的名字
  date: string;
  startTime?: string; // 用于日程表视图 (如 "14:00")
  endTime?: string;   // 用于日程表视图 (如 "15:30")
  location?: string;  // 学员打球地址
  focusSkillIds: string[];
  selectedDrillIds: string[];
  coachNotes: string;
}

export interface LongTermPlanLesson {
  lessonNumber: number; // 课时序号 (1-10)
  focusSkillIds: string[]; // 本节课重点技能
  description: string;  // 本节课阶段目标
}

export interface LongTermPlan {
  id: string;
  studentId: string;
  title: string; // 例如 "正手底线相持进阶 10节课规划"
  lessons: LongTermPlanLesson[];
  createdAt: string;
}
