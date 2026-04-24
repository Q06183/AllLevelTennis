import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, User, CheckSquare, Square, AlertCircle, PlusCircle, Calendar, Map as MapIcon, ChevronRight, MapPin } from 'lucide-react-native';

import { useCoachStore } from '../store/coachStore';
import { CoachStackParamList } from '../navigation/types';
import { levels, skills } from '../data/mockData';

type DetailRouteProp = RouteProp<CoachStackParamList, 'StudentDetail'>;
type NavigationProp = NativeStackNavigationProp<CoachStackParamList, 'StudentDetail'>;

export default function StudentDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { studentId } = route.params;
  
  const { students, lessonPlans, longTermPlans, updateSkillAssessment, deleteStudent } = useCoachStore();
  const student = students.find(s => s.id === studentId);
  const studentLessons = lessonPlans.filter(lp => lp.studentId === studentId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const studentLongTermPlans = longTermPlans?.filter(lp => lp.studentId === studentId) || [];

  const [activeTab, setActiveTab] = useState<'assessment' | 'lessons' | 'blueprint'>('assessment');
  const [selectedLevelId, setSelectedLevelId] = useState(student?.currentLevelId || "1.0");

  // 获取最近使用过的一个地址
  const recentLocation = studentLessons.find(lp => lp.location && lp.location.trim().length > 0)?.location;

  if (!student) {
    return (
      <View style={styles.centerContainer}>
        <Text>学员未找到</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: '#3498DB', marginTop: 20 }}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      "删除学员",
      "确定要删除该学员及其所有记录吗？",
      [
        { text: "取消", style: "cancel" },
        { text: "删除", style: "destructive", onPress: () => {
          deleteStudent(studentId);
          navigation.goBack();
        }}
      ]
    );
  };

  const handleToggleSkill = (skillId: string) => {
    const current = student.assessments[skillId]?.completed || false;
    updateSkillAssessment(studentId, skillId, { completed: !current });
  };

  const handleAddPainPoint = (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill || !skill.painPoints || skill.painPoints.length === 0) {
      Alert.alert("提示", "该技能暂无预设痛点");
      return;
    }

    const currentPainPointIds = student.assessments[skillId]?.painPointIds || [];

    // Simple action sheet for selecting pain points (in a real app, maybe a modal)
    Alert.alert(
      "标记痛点",
      "请选择学员存在的痛点：\n(可在教案中根据痛点生成练习处方)",
      (skill.painPoints.map(pp => ({
        text: currentPainPointIds.includes(pp.id) ? `[已标记] ${pp.description}` : pp.description,
        onPress: () => {
          const newIds = currentPainPointIds.includes(pp.id)
            ? currentPainPointIds.filter(id => id !== pp.id)
            : [...currentPainPointIds, pp.id];
          updateSkillAssessment(studentId, skillId, { painPointIds: newIds });
        }
      })) as import('react-native').AlertButton[]).concat([{ text: "取消", onPress: () => {}, style: "cancel" }])
    );
  };

  const renderAssessment = () => {
    const levelSkills = levels.find(l => l.id === selectedLevelId)?.skills || [];

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.levelSelector}>
          {levels.map(l => (
            <TouchableOpacity 
              key={l.id} 
              style={[styles.levelTab, selectedLevelId === l.id && styles.levelTabActive]}
              onPress={() => setSelectedLevelId(l.id)}
            >
              <Text style={[styles.levelTabText, selectedLevelId === l.id && styles.levelTabTextActive]}>
                {l.id}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.skillsList}>
          {levelSkills.map(skillId => {
            const skill = skills.find(s => s.id === skillId);
            if (!skill) return null;
            
            const assessment = student.assessments[skillId];
            const isCompleted = assessment?.completed || false;
            const hasPainPoints = assessment?.painPointIds && assessment.painPointIds.length > 0;

            return (
              <View key={skillId} style={styles.skillCard}>
                <View style={styles.skillHeaderRow}>
                  <TouchableOpacity onPress={() => handleToggleSkill(skillId)} style={styles.checkbox}>
                    {isCompleted ? <CheckSquare color="#27AE60" size={24} /> : <Square color="#95A5A6" size={24} />}
                  </TouchableOpacity>
                  <View style={styles.skillTitleContainer}>
                    <Text style={[styles.skillName, isCompleted && styles.completedText]}>{skill.name}</Text>
                    <Text style={styles.skillCategory}>{skill.category}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.painPointButton}
                    onPress={() => handleAddPainPoint(skillId)}
                  >
                    <AlertCircle color={hasPainPoints ? "#E74C3C" : "#BDC3C7"} size={22} />
                  </TouchableOpacity>
                </View>
                
                {hasPainPoints && (
                  <View style={styles.painPointsList}>
                    {assessment.painPointIds.map(ppId => {
                      const ppDesc = skill.painPoints?.find(p => p.id === ppId)?.description;
                      return (
                        <Text key={ppId} style={styles.painPointItemText}>• 痛点: {ppDesc}</Text>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  const renderLessons = () => {
    return (
      <View style={styles.tabContent}>
        <TouchableOpacity 
          style={styles.createLessonButton}
          onPress={() => navigation.navigate('LessonPlanEdit', { studentId })}
        >
          <PlusCircle color="#FFFFFF" size={20} />
          <Text style={styles.createLessonText}>创建新教案</Text>
        </TouchableOpacity>

        {studentLessons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无教案记录</Text>
          </View>
        ) : (
          <FlatList
            data={studentLessons}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.lessonCard}
                onPress={() => navigation.navigate('LessonPlanEdit', { studentId, lessonPlanId: item.id })}
              >
                <View style={styles.lessonHeader}>
                  <View style={styles.lessonDateRow}>
                    <Calendar color="#3498DB" size={18} style={{ marginRight: 8 }} />
                    <Text style={styles.lessonDate}>{item.date}</Text>
                  </View>
                  {item.location && (
                    <View style={styles.lessonLocationRow}>
                      <MapPin color="#7F8C8D" size={12} style={{ marginRight: 4 }} />
                      <Text style={styles.lessonLocationText} numberOfLines={1}>{item.location}</Text>
                    </View>
                  )}
                </View>
                
                {item.focusSkillIds.length > 0 && (
                  <Text style={styles.lessonSkills}>
                    重点: {item.focusSkillIds.map(id => skills.find(s => s.id === id)?.name).filter(Boolean).join(', ')}
                  </Text>
                )}
                
                {item.coachNotes ? (
                  <Text style={styles.lessonNotes} numberOfLines={2}>{item.coachNotes}</Text>
                ) : null}
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    );
  };

  const renderBlueprints = () => {
    return (
      <View style={styles.tabContent}>
        <TouchableOpacity 
          style={styles.createLessonButton}
          onPress={() => navigation.navigate('LongTermPlanEdit', { studentId })}
        >
          <MapIcon color="#FFFFFF" size={20} />
          <Text style={styles.createLessonText}>创建10节课长期规划</Text>
        </TouchableOpacity>

        {studentLongTermPlans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无长期规划记录</Text>
          </View>
        ) : (
          <FlatList
            data={studentLongTermPlans}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.blueprintCard}
                onPress={() => navigation.navigate('LongTermPlanEdit', { studentId, planId: item.id })}
              >
                <View style={styles.blueprintHeader}>
                  <View style={styles.blueprintTitleRow}>
                    <MapIcon color="#2C3E50" size={18} style={{ marginRight: 8 }} />
                    <Text style={styles.blueprintTitle} numberOfLines={1}>{item.title}</Text>
                  </View>
                  <ChevronRight color="#95A5A6" size={18} />
                </View>
                
                <Text style={styles.blueprintDate}>
                  创建时间: {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                
                <Text style={styles.blueprintSummary}>
                  包含 {item.lessons?.length || 0} 节课的规划目标
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>学员档案</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteText}>删除</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileHeader}>
        <View style={styles.avatarPlaceholder}>
          <User color="#FFFFFF" size={32} />
        </View>
        <Text style={styles.studentNameBig}>{student.name}</Text>
        {recentLocation && (
          <View style={styles.recentLocationContainer}>
            <MapPin color="#BDC3C7" size={14} style={{ marginRight: 4 }} />
            <Text style={styles.recentLocationText}>{recentLocation}</Text>
          </View>
        )}
      </View>

      <View style={styles.segmentControl}>
        <TouchableOpacity 
          style={[styles.segmentTab, activeTab === 'assessment' && styles.segmentTabActive]}
          onPress={() => setActiveTab('assessment')}
        >
          <Text style={[styles.segmentText, activeTab === 'assessment' && styles.segmentTextActive]}>
            技能评估
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.segmentTab, activeTab === 'lessons' && styles.segmentTabActive]}
          onPress={() => setActiveTab('lessons')}
        >
          <Text style={[styles.segmentText, activeTab === 'lessons' && styles.segmentTextActive]}>
            历史教案
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.segmentTab, activeTab === 'blueprint' && styles.segmentTabActive]}
          onPress={() => setActiveTab('blueprint')}
        >
          <Text style={[styles.segmentText, activeTab === 'blueprint' && styles.segmentTextActive]}>
            长期规划
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'assessment' && renderAssessment()}
      {activeTab === 'lessons' && renderLessons()}
      {activeTab === 'blueprint' && renderBlueprints()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  deleteText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileHeader: {
    backgroundColor: '#2C3E50',
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentNameBig: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  recentLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recentLocationText: {
    color: '#BDC3C7',
    fontSize: 13,
  },
  segmentControl: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
    backgroundColor: '#ECF0F1',
    borderRadius: 8,
    padding: 4,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#7F8C8D',
  },
  segmentTextActive: {
    color: '#2C3E50',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  levelSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  levelTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ECF0F1',
    marginRight: 8,
  },
  levelTabActive: {
    backgroundColor: '#3498DB',
  },
  levelTabText: {
    color: '#7F8C8D',
    fontWeight: 'bold',
  },
  levelTabTextActive: {
    color: '#FFFFFF',
  },
  skillsList: {
    paddingBottom: 20,
  },
  skillCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  skillHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 12,
  },
  skillTitleContainer: {
    flex: 1,
  },
  skillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  completedText: {
    color: '#95A5A6',
    textDecorationLine: 'line-through',
  },
  skillCategory: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  painPointButton: {
    padding: 8,
  },
  painPointsList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FDF2E9',
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderRadius: 8,
  },
  painPointItemText: {
    color: '#E74C3C',
    fontSize: 14,
    marginBottom: 4,
  },
  createLessonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  createLessonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: '#95A5A6',
    fontSize: 16,
  },
  lessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  lessonDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  lessonLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    marginLeft: 12,
  },
  lessonLocationText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  lessonSkills: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 8,
  },
  lessonNotes: {
    fontSize: 13,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  blueprintCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  blueprintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  blueprintTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  blueprintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  blueprintDate: {
    fontSize: 13,
    color: '#95A5A6',
    marginBottom: 4,
  },
  blueprintSummary: {
    fontSize: 14,
    color: '#34495E',
  }
});
