import { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  LevelStandardTab: NavigatorScreenParams<LevelStackParamList>;
  SkillsTab: NavigatorScreenParams<SkillsStackParamList>;
  NotesTab: NavigatorScreenParams<NotesStackParamList>;
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
