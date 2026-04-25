import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal, ActivityIndicator, Platform } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Save, Trash2, Map as MapIcon, Share2, CheckSquare, Square, X } from 'lucide-react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { useCoachStore } from '../store/coachStore';
import { CoachStackParamList } from '../navigation/types';
import { skills } from '../data/mockData';
import { LongTermPlanLesson } from '../types';

type RouteProps = RouteProp<CoachStackParamList, 'LongTermPlanEdit'>;
type NavigationProp = NativeStackNavigationProp<CoachStackParamList, 'LongTermPlanEdit'>;

export default function LongTermPlanEditScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const { studentId, planId } = route.params;

  const { students, longTermPlans, addLongTermPlan, updateLongTermPlan, deleteLongTermPlan } = useCoachStore();
  const student = students.find(s => s.id === studentId);
  const existingPlan = planId ? longTermPlans.find(p => p.id === planId) : null;

  const viewShotRef = useRef<ViewShot>(null);
  
  const [title, setTitle] = useState(existingPlan?.title || `${student?.name || ''}的 10节课网球进阶规划`);
  const [isSharing, setIsSharing] = useState(false);
  const [showSkillSelector, setShowSkillSelector] = useState(false);
  const [editingLessonIndex, setEditingLessonIndex] = useState<number | null>(null);

  // Initialize 10 empty lessons if creating new
  const initialLessons: LongTermPlanLesson[] = Array.from({ length: 10 }).map((_, index) => ({
    lessonNumber: index + 1,
    focusSkillIds: [],
    description: ''
  }));

  const [lessons, setLessons] = useState<LongTermPlanLesson[]>(existingPlan?.lessons || initialLessons);

  if (!student) return null;

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("错误", "请填写规划标题");
      return;
    }

    if (existingPlan) {
      updateLongTermPlan(existingPlan.id, {
        title,
        lessons
      });
    } else {
      addLongTermPlan({
        studentId,
        title,
        lessons
      });
    }
    
    Alert.alert("成功", "长期规划已保存", [
      { text: "确定", onPress: () => navigation.goBack() }
    ]);
  };

  const handleDelete = () => {
    if (existingPlan) {
      Alert.alert("删除规划", "确定要删除这份长期规划吗？", [
        { text: "取消", style: "cancel" },
        { text: "删除", style: "destructive", onPress: () => {
          deleteLongTermPlan(existingPlan.id);
          navigation.goBack();
        }}
      ]);
    }
  };

  const updateLessonDescription = (index: number, text: string) => {
    const newLessons = [...lessons];
    newLessons[index].description = text;
    setLessons(newLessons);
  };

  const openSkillSelector = (index: number) => {
    setEditingLessonIndex(index);
    setShowSkillSelector(true);
  };

  const toggleSkillForLesson = (skillId: string) => {
    if (editingLessonIndex === null) return;
    
    const newLessons = [...lessons];
    const currentSkills = newLessons[editingLessonIndex].focusSkillIds;
    
    if (currentSkills.includes(skillId)) {
      newLessons[editingLessonIndex].focusSkillIds = currentSkills.filter(id => id !== skillId);
    } else {
      newLessons[editingLessonIndex].focusSkillIds = [...currentSkills, skillId];
    }
    
    setLessons(newLessons);
  };

  const getSkillNames = (skillIds: string[]) => {
    if (!skillIds || skillIds.length === 0) return '未指定重点技能';
    return skillIds.map(id => skills.find(s => s.id === id)?.name).filter(Boolean).join(', ');
  };

  const handleShare = async () => {
    if (!viewShotRef.current || !viewShotRef.current.capture) {
      Alert.alert('错误', '截图组件未准备好');
      return;
    }

    try {
      setIsSharing(true);
      
      // Capture the view
      const uri = await viewShotRef.current.capture();
      
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/jpeg',
          dialogTitle: '分享网球学习规划'
        });
      } else {
        Alert.alert('提示', '当前设备不支持分享功能，图片已生成: ' + uri);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('错误', '生成长图或分享失败');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{existingPlan ? "编辑规划" : "新建规划"}</Text>
        <View style={styles.headerRight}>
          {existingPlan && (
            <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
              <Trash2 color="#E74C3C" size={22} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSave} style={styles.iconButton}>
            <Save color="#3498DB" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Share Button */}
      <TouchableOpacity 
        style={styles.floatingShareBtn} 
        onPress={handleShare}
        disabled={isSharing}
      >
        {isSharing ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Share2 color="#FFFFFF" size={20} />
            <Text style={styles.shareBtnText}>生成长图</Text>
          </>
        )}
      </TouchableOpacity>

      <KeyboardAwareScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? headerHeight + 20 : 20}
        keyboardShouldPersistTaps="handled"
      >
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          {/* This ViewShot wraps the content we want to export as an image */}
        <ViewShot 
          ref={viewShotRef} 
          options={{ format: 'jpg', quality: 0.9 }}
          style={styles.blueprintContainer}
        >
          {/* Blueprint Header */}
          <View style={styles.blueprintHeader}>
            <View style={styles.brandBadge}>
              <MapIcon color="#FFFFFF" size={24} />
            </View>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="例如: 正手进阶 10节课规划"
              placeholderTextColor="#95A5A6"
              multiline
            />
            <Text style={styles.blueprintSubtitle}>为 {student.name} 量身定制的学习蓝图</Text>
          </View>

          {/* 10 Lessons List */}
          <View style={styles.lessonsContainer}>
            {lessons.map((lesson, index) => (
              <View key={`lesson-${index}`} style={styles.lessonRow}>
                {/* Timeline Column */}
                <View style={styles.timelineColumn}>
                  <View style={styles.lessonNumberBadge}>
                    <Text style={styles.lessonNumberText}>{lesson.lessonNumber}</Text>
                  </View>
                  {index < lessons.length - 1 && <View style={styles.timelineLine} />}
                </View>
                
                {/* Content Column */}
                <View style={styles.lessonContent}>
                  <TouchableOpacity 
                    style={styles.skillSelectorBtn}
                    onPress={() => openSkillSelector(index)}
                  >
                    <Text style={styles.skillSelectorText} numberOfLines={2}>
                      🎯 {getSkillNames(lesson.focusSkillIds)}
                    </Text>
                  </TouchableOpacity>
                  
                  <TextInput
                    style={styles.descInput}
                    value={lesson.description}
                    onChangeText={(text) => updateLessonDescription(index, text)}
                    placeholder="本节课目标/内容描述..."
                    placeholderTextColor="#BDC3C7"
                    multiline
                  />
                </View>
              </View>
            ))}
          </View>
          
          {/* Blueprint Footer */}
          <View style={styles.blueprintFooter}>
            <Text style={styles.footerText}>Powered by AllLevelTennis Coach</Text>
          </View>
        </ViewShot>
        <View style={{ height: 100 }} />
      </ScrollView>
      </KeyboardAwareScrollView>

      {/* Skill Selector Modal */}
      <Modal
        visible={showSkillSelector}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSkillSelector(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              选择第 {editingLessonIndex !== null ? editingLessonIndex + 1 : ''} 节课重点
            </Text>
            <TouchableOpacity onPress={() => setShowSkillSelector(false)} style={styles.closeBtn}>
              <X color="#2C3E50" size={24} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {skills.map(skill => {
              const isSelected = editingLessonIndex !== null && 
                lessons[editingLessonIndex].focusSkillIds.includes(skill.id);
                
              return (
                <TouchableOpacity 
                  key={skill.id} 
                  style={styles.skillOptionRow}
                  onPress={() => toggleSkillForLesson(skill.id)}
                >
                  {isSelected ? (
                    <CheckSquare color="#3498DB" size={24} />
                  ) : (
                    <Square color="#BDC3C7" size={24} />
                  )}
                  <View style={styles.skillOptionInfo}>
                    <Text style={[styles.skillOptionName, isSelected && styles.skillOptionNameActive]}>
                      {skill.name}
                    </Text>
                    <Text style={styles.skillOptionCategory}>{skill.category}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50', // Match header for a seamless look above the scroll
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 60,
    backgroundColor: '#2C3E50',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#E8EAED', // Lighter gray background for contrast with the white blueprint
  },
  scrollContent: {
    padding: 16,
  },
  floatingShareBtn: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#27AE60',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  
  // --- Blueprint Export Area Styles ---
  blueprintContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    // Shadow for UI, won't affect export
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  blueprintHeader: {
    backgroundColor: '#2C3E50',
    padding: 24,
    alignItems: 'center',
  },
  brandBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    minHeight: 30,
  },
  blueprintSubtitle: {
    fontSize: 14,
    color: '#DFFF00', // Brand Accent
    fontWeight: '500',
  },
  lessonsContainer: {
    padding: 20,
    paddingRight: 16,
  },
  lessonRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineColumn: {
    width: 40,
    alignItems: 'center',
  },
  lessonNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F39C12',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  lessonNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#ECF0F1',
    marginTop: -4,
    marginBottom: -4,
    zIndex: 1,
  },
  lessonContent: {
    flex: 1,
    paddingBottom: 24,
    paddingLeft: 12,
  },
  skillSelectorBtn: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  skillSelectorText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  descInput: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
    minHeight: 40,
  },
  blueprintFooter: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    backgroundColor: '#F8F9FA',
  },
  footerText: {
    fontSize: 12,
    color: '#BDC3C7',
    fontWeight: '600',
    letterSpacing: 1,
  },
  
  // --- Modal Styles ---
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeBtn: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  skillOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  skillOptionInfo: {
    marginLeft: 12,
  },
  skillOptionName: {
    fontSize: 16,
    color: '#34495E',
    fontWeight: '500',
  },
  skillOptionNameActive: {
    color: '#3498DB',
    fontWeight: 'bold',
  },
  skillOptionCategory: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 4,
  }
});