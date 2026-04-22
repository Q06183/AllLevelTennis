import { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  LevelStandard: undefined;
  SkillsTab: NavigatorScreenParams<SkillsStackParamList>;
  Notes: undefined;
};

export type SkillsStackParamList = {
  SkillsList: undefined;
  SkillDetail: { skillId: string };
};
