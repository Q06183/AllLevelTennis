import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { BookOpen, CheckSquare, Target } from 'lucide-react-native';

import LevelStandardScreen from '../screens/LevelStandardScreen';
import SkillsScreen from '../screens/SkillsScreen';
import SkillDetailScreen from '../screens/SkillDetailScreen';
import NotesScreen from '../screens/NotesScreen';
import { RootTabParamList, SkillsStackParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const SkillsStack = createNativeStackNavigator<SkillsStackParamList>();

function SkillsStackNavigator() {
  return (
    <SkillsStack.Navigator screenOptions={{ headerShown: false }}>
      <SkillsStack.Screen name="SkillsList" component={SkillsScreen} />
      <SkillsStack.Screen name="SkillDetail" component={SkillDetailScreen} />
    </SkillsStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'LevelStandard') {
              return <Target color={color} size={size} />;
            } else if (route.name === 'SkillsTab') {
              return <CheckSquare color={color} size={size} />;
            } else if (route.name === 'Notes') {
              return <BookOpen color={color} size={size} />;
            }
          },
          tabBarActiveTintColor: '#3498DB',
          tabBarInactiveTintColor: '#2C3E50',
          headerStyle: { backgroundColor: '#2C3E50' },
          headerTintColor: '#fff',
        })}
      >
        <Tab.Screen 
          name="LevelStandard" 
          component={LevelStandardScreen} 
          options={{ title: '水平标准' }} 
        />
        <Tab.Screen 
          name="SkillsTab" 
          component={SkillsStackNavigator} 
          options={{ title: '技能' }} 
        />
        <Tab.Screen 
          name="Notes" 
          component={NotesScreen} 
          options={{ title: '记录' }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
