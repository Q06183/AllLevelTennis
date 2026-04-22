export interface Level {
  id: string;       // 水平ID，如"0", "1.0", "2.5"等
  name: string;     // 水平名称
  description: string; // 水平描述
  skills: string[]; // 该水平需要掌握的技能ID列表
}

export interface Skill {
  id: string;       // 技能ID
  name: string;     // 技能名称
  category: string; // 技能分类（正手、反手、发球等）
  description: string; // 技能描述
  tips: string[];   // 技能技巧
  difficulty: number; // 技能难度（1-5）
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
