import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { BookOpen, CheckSquare, Target, Users } from 'lucide-react-native';

import LevelStandardScreen from '../screens/LevelStandardScreen';
import SkillsScreen from '../screens/SkillsScreen';
import SkillDetailScreen from '../screens/SkillDetailScreen';
import NotesScreen from '../screens/NotesScreen';
import CoachStack from './CoachStack';
import { RootTabParamList, LevelStackParamList, SkillsStackParamList, NotesStackParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const LevelStack = createNativeStackNavigator<LevelStackParamList>();
const SkillsStack = createNativeStackNavigator<SkillsStackParamList>();
const NotesStack = createNativeStackNavigator<NotesStackParamList>();

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

function NotesStackNavigator() {
  return (
    <NotesStack.Navigator screenOptions={{ headerShown: false }}>
      <NotesStack.Screen name="NotesList" component={NotesScreen} />
      <NotesStack.Screen name="SkillDetail" component={SkillDetailScreen} />
    </NotesStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'LevelStandardTab') {
              return <Target color={color} size={size} />;
            } else if (route.name === 'SkillsTab') {
              return <CheckSquare color={color} size={size} />;
            } else if (route.name === 'NotesTab') {
              return <BookOpen color={color} size={size} />;
            } else if (route.name === 'CoachTab') {
              return <Users color={color} size={size} />;
            }
          },
          tabBarActiveTintColor: '#3498DB',
          tabBarInactiveTintColor: '#2C3E50',
          headerStyle: { backgroundColor: '#2C3E50' },
          headerTintColor: '#fff',
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
        <Tab.Screen 
          name="NotesTab" 
          component={NotesStackNavigator} 
          options={{ title: '记录' }} 
        />
        <Tab.Screen 
          name="CoachTab" 
          component={CoachStack} 
          options={{ title: '教练' }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
