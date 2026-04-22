import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Save, Trash2, CheckSquare, Square } from 'lucide-react-native';

import { useCoachStore } from '../store/coachStore';
import { CoachStackParamList } from '../navigation/types';
import { skills, drills } from '../data/mockData';

type RouteProps = RouteProp<CoachStackParamList, 'LessonPlanEdit'>;
type NavigationProp = NativeStackNavigationProp<CoachStackParamList, 'LessonPlanEdit'>;

export default function LessonPlanEditScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { studentId, lessonPlanId } = route.params;

  const { students, lessonPlans, addLessonPlan, updateLessonPlan, deleteLessonPlan } = useCoachStore();
  const student = students.find(s => s.id === studentId);
  const existingPlan = lessonPlans.find(lp => lp.id === lessonPlanId);

  const [date, setDate] = useState(existingPlan?.date || new Date().toISOString().split('T')[0]);
  const [focusSkillIds, setFocusSkillIds] = useState<string[]>(existingPlan?.focusSkillIds || []);
  const [selectedDrillIds, setSelectedDrillIds] = useState<string[]>(existingPlan?.selectedDrillIds || []);
  const [coachNotes, setCoachNotes] = useState(existingPlan?.coachNotes || '');

  // Automatically suggest drills based on student's pain points in the selected skills
  useEffect(() => {
    if (!existingPlan && student) {
      let suggestedDrills: string[] = [];
      focusSkillIds.forEach(skillId => {
        const assessment = student.assessments[skillId];
        if (assessment && assessment.painPointIds) {
          const skill = skills.find(s => s.id === skillId);
          assessment.painPointIds.forEach(ppId => {
            const painPoint = skill?.painPoints?.find(p => p.id === ppId);
            if (painPoint && painPoint.recommendedDrillIds) {
              suggestedDrills = [...suggestedDrills, ...painPoint.recommendedDrillIds];
            }
          });
        }
      });
      // Merge unique
      setSelectedDrillIds(Array.from(new Set([...selectedDrillIds, ...suggestedDrills])));
    }
  }, [focusSkillIds]);

  if (!student) return null;

  const handleSave = () => {
    if (!date.trim()) {
      Alert.alert("错误", "请填写日期");
      return;
    }

    if (existingPlan) {
      updateLessonPlan(existingPlan.id, {
        date,
        focusSkillIds,
        selectedDrillIds,
        coachNotes
      });
    } else {
      addLessonPlan({
        studentId,
        date,
        focusSkillIds,
        selectedDrillIds,
        coachNotes
      });
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (existingPlan) {
      Alert.alert("删除教案", "确定要删除这节课的记录吗？", [
        { text: "取消", style: "cancel" },
        { text: "删除", style: "destructive", onPress: () => {
          deleteLessonPlan(existingPlan.id);
          navigation.goBack();
        }}
      ]);
    }
  };

  const toggleSkill = (id: string) => {
    setFocusSkillIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleDrill = (id: string) => {
    setSelectedDrillIds(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{existingPlan ? "编辑教案" : "新建教案"}</Text>
        <View style={styles.headerRight}>
          {existingPlan && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Trash2 color="#E74C3C" size={22} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSave}>
            <Save color="#3498DB" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.label}>日期 (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="2023-10-01"
          />
          <Text style={styles.studentName}>学员: {student.name}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>重点突破技能</Text>
          <Text style={styles.helperText}>选择本节课的重点（多选）</Text>
          
          {/* For simplicity, just list skills the student is working on (not completed) or all basic skills */}
          {skills.filter(s => s.difficulty <= 3).map(skill => (
            <TouchableOpacity 
              key={skill.id} 
              style={styles.checkboxRow}
              onPress={() => toggleSkill(skill.id)}
            >
              {focusSkillIds.includes(skill.id) ? (
                <CheckSquare color="#3498DB" size={22} />
              ) : (
                <Square color="#BDC3C7" size={22} />
              )}
              <Text style={[styles.checkboxText, focusSkillIds.includes(skill.id) && styles.checkboxTextActive]}>
                {skill.name} ({skill.category})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>练习处方 (Drills)</Text>
          <Text style={styles.helperText}>根据痛点自动推荐，也可手动调整</Text>
          
          {drills.map(drill => (
            <TouchableOpacity 
              key={drill.id} 
              style={styles.drillRow}
              onPress={() => toggleDrill(drill.id)}
            >
              <Switch 
                value={selectedDrillIds.includes(drill.id)}
                onValueChange={() => toggleDrill(drill.id)}
                trackColor={{ false: '#ECF0F1', true: '#3498DB' }}
              />
              <View style={styles.drillInfo}>
                <Text style={[styles.drillName, selectedDrillIds.includes(drill.id) && styles.drillNameActive]}>
                  {drill.name}
                </Text>
                <Text style={styles.drillDesc}>{drill.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>课后总结 (Coach Notes)</Text>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="记录学员表现、改进点及下次课建议..."
            value={coachNotes}
            onChangeText={setCoachNotes}
          />
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
  deleteButton: {
    marginRight: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ECF0F1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 12,
  },
  studentName: {
    fontSize: 16,
    color: '#3498DB',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  helperText: {
    fontSize: 13,
    color: '#95A5A6',
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxText: {
    fontSize: 16,
    color: '#34495E',
    marginLeft: 12,
  },
  checkboxTextActive: {
    color: '#3498DB',
    fontWeight: 'bold',
  },
  drillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FDF2E9',
  },
  drillInfo: {
    flex: 1,
    marginLeft: 12,
  },
  drillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 4,
  },
  drillNameActive: {
    color: '#2C3E50',
  },
  drillDesc: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ECF0F1',
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#2C3E50',
  }
});
