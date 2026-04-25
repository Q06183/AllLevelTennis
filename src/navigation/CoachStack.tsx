import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CoachStackParamList } from './types';

import StudentListScreen from '../screens/StudentListScreen';
import StudentDetailScreen from '../screens/StudentDetailScreen';
import LessonPlanEditScreen from '../screens/LessonPlanEditScreen';
import LongTermPlanEditScreen from '../screens/LongTermPlanEditScreen';
import SkillDetailScreen from '../screens/SkillDetailScreen';
import RecycleBinScreen from '../screens/RecycleBinScreen';

const Stack = createNativeStackNavigator<CoachStackParamList>();

export default function CoachStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentList" component={StudentListScreen} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
      <Stack.Screen name="LessonPlanEdit" component={LessonPlanEditScreen} />
      <Stack.Screen name="LongTermPlanEdit" component={LongTermPlanEditScreen} />
      <Stack.Screen name="SkillDetail" component={SkillDetailScreen} />
      <Stack.Screen name="RecycleBin" component={RecycleBinScreen} />
    </Stack.Navigator>
  );
}
