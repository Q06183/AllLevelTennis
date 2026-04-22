import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CoachStackParamList } from './types';

import StudentListScreen from '../screens/StudentListScreen';
import StudentDetailScreen from '../screens/StudentDetailScreen';
import LessonPlanEditScreen from '../screens/LessonPlanEditScreen';
import SkillDetailScreen from '../screens/SkillDetailScreen';

const Stack = createNativeStackNavigator<CoachStackParamList>();

export default function CoachStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="StudentList" component={StudentListScreen} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
      <Stack.Screen name="LessonPlanEdit" component={LessonPlanEditScreen} />
      <Stack.Screen 
        name="SkillDetail" 
        component={SkillDetailScreen}
      />
    </Stack.Navigator>
  );
}
