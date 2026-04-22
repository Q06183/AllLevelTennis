import { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  LevelStandardTab: NavigatorScreenParams<LevelStackParamList>;
  SkillsTab: NavigatorScreenParams<SkillsStackParamList>;
  NotesTab: NavigatorScreenParams<NotesStackParamList>;
  CoachTab: NavigatorScreenParams<CoachStackParamList>;
};

export type LevelStackParamList = {
  LevelStandard: undefined;
  SkillDetail: { skillId: string };
};

export type SkillsStackParamList = {
  SkillsList: undefined;
  SkillDetail: { skillId: string };
};

export type NotesStackParamList = {
  NotesList: undefined;
  SkillDetail: { skillId: string };
};

export type CoachStackParamList = {
  StudentList: undefined;
  StudentDetail: { studentId: string };
  LessonPlanEdit: { studentId: string; lessonPlanId?: string };
  SkillDetail: { skillId: string };
};
