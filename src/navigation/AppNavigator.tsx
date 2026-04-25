import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { BookOpen, CheckSquare, Target, Users, Calendar, ChevronDown, Settings } from 'lucide-react-native';
import { TouchableOpacity, View, Text, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';

import { useStore } from '../store';
import LevelStandardScreen from '../screens/LevelStandardScreen';
import SkillsScreen from '../screens/SkillsScreen';
import SkillDetailScreen from '../screens/SkillDetailScreen';
import NotesScreen from '../screens/NotesScreen';
import TrainingRecordListScreen from '../screens/TrainingRecordListScreen';
import TrainingRecordEditScreen from '../screens/TrainingRecordEditScreen';
import ScheduleListScreen from '../screens/ScheduleListScreen';
import LessonPlanEditScreen from '../screens/LessonPlanEditScreen';
import StudentDetailScreen from '../screens/StudentDetailScreen';
import CoachStack from './CoachStack';
import { RootTabParamList, LevelStackParamList, SkillsStackParamList, TrainingRecordStackParamList, ScheduleStackParamList } from './types';
import { exportData, importData } from '../utils/dataMigration';

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
      <SkillsStack.Screen name="NotesList" component={NotesScreen} />
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
  const [menuVisible, setMenuVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const handleSwitchMode = () => {
    toggleCoachMode();
    setMenuVisible(false);
  };

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
            <View style={styles.headerRightContainer}>
              {/* 模式切换下拉菜单 */}
              <TouchableOpacity 
                onPress={() => setMenuVisible(true)}
                style={styles.headerRightBtn}
              >
                <Text style={styles.headerRightText}>
                  {isCoachMode ? '教练模式' : '学生模式'}
                </Text>
                <ChevronDown color="#fff" size={16} />
              </TouchableOpacity>

              <Modal
                transparent={true}
                visible={menuVisible}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
              >
                <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                  <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                      <View style={[styles.dropdownMenu, styles.modeDropdownMenu]}>
                        <TouchableOpacity 
                          style={[styles.menuItem, !isCoachMode && styles.menuItemActive]}
                          onPress={() => !isCoachMode ? setMenuVisible(false) : handleSwitchMode()}
                        >
                          <Text style={[styles.menuItemText, !isCoachMode && styles.menuItemTextActive]}>学生模式</Text>
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity 
                          style={[styles.menuItem, isCoachMode && styles.menuItemActive]}
                          onPress={() => isCoachMode ? setMenuVisible(false) : handleSwitchMode()}
                        >
                          <Text style={[styles.menuItemText, isCoachMode && styles.menuItemTextActive]}>教练模式</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>

              {/* 设置下拉菜单 */}
              <TouchableOpacity 
                onPress={() => setSettingsVisible(true)}
                style={styles.settingsBtn}
              >
                <Settings color="#fff" size={20} />
              </TouchableOpacity>

              <Modal
                transparent={true}
                visible={settingsVisible}
                animationType="fade"
                onRequestClose={() => setSettingsVisible(false)}
              >
                <TouchableWithoutFeedback onPress={() => setSettingsVisible(false)}>
                  <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                      <View style={[styles.dropdownMenu, styles.settingsDropdownMenu]}>
                        <TouchableOpacity 
                          style={styles.menuItem}
                          onPress={() => {
                            setSettingsVisible(false);
                            setTimeout(() => {
                              exportData();
                            }, 500);
                          }}
                        >
                          <Text style={styles.menuItemText}>导出备份</Text>
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity 
                          style={styles.menuItem}
                          onPress={() => {
                            setSettingsVisible(false);
                            setTimeout(() => {
                              importData();
                            }, 500);
                          }}
                        >
                          <Text style={styles.menuItemText}>恢复备份</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            </View>
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

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  headerRightBtn: {
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  settingsBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerRightText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 90, // safe area approx + header height
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    width: 140,
    overflow: 'hidden',
  },
  modeDropdownMenu: {
    right: 56, // 定位到模式切换按钮下方
  },
  settingsDropdownMenu: {
    right: 16, // 定位到齿轮按钮下方
    width: 120,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemActive: {
    backgroundColor: '#F5F7FA',
  },
  menuItemText: {
    fontSize: 15,
    color: '#34495E',
    textAlign: 'center',
  },
  menuItemTextActive: {
    color: '#3498DB',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ECF0F1',
  }
});
