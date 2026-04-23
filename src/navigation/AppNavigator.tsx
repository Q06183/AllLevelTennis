import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { BookOpen, CheckSquare, Target, Users, Calendar, Settings } from 'lucide-react-native';
import { TouchableOpacity, View, Text } from 'react-native';

import { useStore } from '../store';
import LevelStandardScreen from '../screens/LevelStandardScreen';
import SkillsScreen from '../screens/SkillsScreen';
import SkillDetailScreen from '../screens/SkillDetailScreen';
import TrainingRecordListScreen from '../screens/TrainingRecordListScreen';
import TrainingRecordEditScreen from '../screens/TrainingRecordEditScreen';
import ScheduleListScreen from '../screens/ScheduleListScreen';
import LessonPlanEditScreen from '../screens/LessonPlanEditScreen';
import StudentDetailScreen from '../screens/StudentDetailScreen';
import CoachStack from './CoachStack';
import { RootTabParamList, LevelStackParamList, SkillsStackParamList, TrainingRecordStackParamList, ScheduleStackParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const LevelStack = createNativeStackNavigator<LevelStackParamList>();
const SkillsStack = createNativeStackNavigator<SkillsStackParamList>();
const TrainingRecordStack = createNativeStackNavigator<TrainingRecordStackParamList>();
const ScheduleStack = createNativeStackNavigator<ScheduleStackParamList>();

function LevelStackNavigator() {
  return (
    <LevelStack.Navigator screenOptions={{ headerShown: false }}>
      <LevelStack.Screen name="LevelStandard" component={LevelStandardScreen} />
      <LevelStack.Screen name="SkillDetail" component={SkillDetailScreen} />
    </LevelStack.Navigator>
  );
}

function SkillsStackNavigator() {
  return (
    <SkillsStack.Navigator screenOptions={{ headerShown: false }}>
      <SkillsStack.Screen name="SkillsList" component={SkillsScreen} />
      <SkillsStack.Screen name="SkillDetail" component={SkillDetailScreen} />
    </SkillsStack.Navigator>
  );
}

function TrainingRecordStackNavigator() {
  return (
    <TrainingRecordStack.Navigator screenOptions={{ headerShown: false }}>
      <TrainingRecordStack.Screen name="TrainingRecordList" component={TrainingRecordListScreen} />
      <TrainingRecordStack.Screen name="TrainingRecordEdit" component={TrainingRecordEditScreen} />
      <TrainingRecordStack.Screen name="SkillDetail" component={SkillDetailScreen} />
    </TrainingRecordStack.Navigator>
  );
}

function ScheduleStackNavigator() {
  return (
    <ScheduleStack.Navigator screenOptions={{ headerShown: false }}>
      <ScheduleStack.Screen name="ScheduleList" component={ScheduleListScreen} />
      <ScheduleStack.Screen name="LessonPlanEdit" component={LessonPlanEditScreen} />
      <ScheduleStack.Screen name="StudentDetail" component={StudentDetailScreen} />
    </ScheduleStack.Navigator>
  );
}

export default function AppNavigator() {
  const { isCoachMode, toggleCoachMode } = useStore();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'LevelStandardTab') {
              return <Target color={color} size={size} />;
            } else if (route.name === 'SkillsTab') {
              return <CheckSquare color={color} size={size} />;
            } else if (route.name === 'TrainingRecordTab') {
              return <BookOpen color={color} size={size} />;
            } else if (route.name === 'ScheduleTab') {
              return <Calendar color={color} size={size} />;
            } else if (route.name === 'StudentsTab') {
              return <Users color={color} size={size} />;
            }
          },
          tabBarActiveTintColor: '#3498DB',
          tabBarInactiveTintColor: '#2C3E50',
          headerStyle: { backgroundColor: '#2C3E50' },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity 
              onPress={toggleCoachMode}
              style={{ marginRight: 16, flexDirection: 'row', alignItems: 'center' }}
            >
              <Settings color="#fff" size={20} style={{ marginRight: 4 }} />
              <Text style={{ color: '#fff', fontSize: 12 }}>
                {isCoachMode ? '切换学生' : '切换教练'}
              </Text>
            </TouchableOpacity>
          )
        })}
      >
        <Tab.Screen 
          name="LevelStandardTab" 
          component={LevelStackNavigator} 
          options={{ title: '水平标准' }} 
        />
        <Tab.Screen 
          name="SkillsTab" 
          component={SkillsStackNavigator} 
          options={{ title: '技能' }} 
        />
        
        {/* 根据角色动态渲染 Tab */}
        {!isCoachMode ? (
          <Tab.Screen 
            name="TrainingRecordTab" 
            component={TrainingRecordStackNavigator} 
            options={{ title: '打卡记录' }} 
          />
        ) : (
          <>
            <Tab.Screen 
              name="ScheduleTab" 
              component={ScheduleStackNavigator} 
              options={{ title: '日程表' }} 
            />
            <Tab.Screen 
              name="StudentsTab" 
              component={CoachStack} 
              options={{ title: '学员管理' }} 
            />
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
