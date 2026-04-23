import { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  LevelStandardTab: NavigatorScreenParams<LevelStackParamList>;
  SkillsTab: NavigatorScreenParams<SkillsStackParamList>;
  TrainingRecordTab: NavigatorScreenParams<TrainingRecordStackParamList>;
  ScheduleTab: NavigatorScreenParams<ScheduleStackParamList>;
  StudentsTab: NavigatorScreenParams<CoachStackParamList>;
};

export type LevelStackParamList = {
  LevelStandard: undefined;
  SkillDetail: { skillId: string };
};

export type SkillsStackParamList = {
  SkillsList: undefined;
  SkillDetail: { skillId: string };
};

export type TrainingRecordStackParamList = {
  TrainingRecordList: undefined;
  TrainingRecordEdit: { recordId?: string };
  SkillDetail: { skillId: string };
};

export type ScheduleStackParamList = {
  ScheduleList: undefined;
  LessonPlanEdit: { studentId: string; lessonPlanId?: string };
  StudentDetail: { studentId: string };
};

export type CoachStackParamList = {
  StudentList: undefined;
  StudentDetail: { studentId: string };
  LessonPlanEdit: { studentId: string; lessonPlanId?: string };
  LongTermPlanEdit: { studentId: string; planId?: string };
  SkillDetail: { skillId: string };
};
