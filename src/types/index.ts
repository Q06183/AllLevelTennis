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
  studentId: string;
  date: string;
  focusSkillIds: string[];
  selectedDrillIds: string[];
  coachNotes: string;
}
