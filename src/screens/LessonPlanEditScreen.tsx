import React, { useState, useEffect, useMemo } from 'react';
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
  const { studentId, lessonPlanId, initialDate, initialStartTime, initialEndTime } = route.params;

  const { students, lessonPlans, addLessonPlan, updateLessonPlan, deleteLessonPlan, addStudent } = useCoachStore();
  const existingPlan = lessonPlans.find(lp => lp.id === lessonPlanId);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(studentId || existingPlan?.studentId || '');
  const [customStudentName, setCustomStudentName] = useState<string>(existingPlan?.studentName || '');
  const [date, setDate] = useState(existingPlan?.date || initialDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(existingPlan?.startTime || initialStartTime || '14:00');
  const [endTime, setEndTime] = useState(existingPlan?.endTime || initialEndTime || '15:30');
  const [location, setLocation] = useState(existingPlan?.location || '');
  const [focusSkillIds, setFocusSkillIds] = useState<string[]>(existingPlan?.focusSkillIds || []);
  const [selectedDrillIds, setSelectedDrillIds] = useState<string[]>(existingPlan?.selectedDrillIds || []);
  const [coachNotes, setCoachNotes] = useState(existingPlan?.coachNotes || '');

  const student = students.find(s => s.id === selectedStudentId);

  // 提取该学员过去打过球的历史地址
  const historicalLocations = useMemo(() => {
    if (!selectedStudentId) return [];
    const locations = lessonPlans
      .filter(lp => lp.studentId === selectedStudentId && lp.location && lp.location.trim().length > 0)
      .map(lp => lp.location as string);
    // 去重并取最近的几个
    return Array.from(new Set(locations));
  }, [selectedStudentId, lessonPlans]);

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
  }, [focusSkillIds, student]);

  const handleSave = () => {
    if (!selectedStudentId && !customStudentName.trim()) {
      Alert.alert("错误", "请选择学员或输入学员名字");
      return;
    }
    if (!date.trim()) {
      Alert.alert("错误", "请填写日期");
      return;
    }

    const savePlan = (finalStudentId?: string, finalStudentName?: string) => {
      if (existingPlan) {
        updateLessonPlan(existingPlan.id, {
          studentId: finalStudentId,
          studentName: finalStudentName,
          date,
          startTime,
          endTime,
          location,
          focusSkillIds,
          selectedDrillIds,
          coachNotes
        });
      } else {
        addLessonPlan({
          studentId: finalStudentId,
          studentName: finalStudentName,
          date,
          startTime,
          endTime,
          location,
          focusSkillIds,
          selectedDrillIds,
          coachNotes
        });
      }
      navigation.goBack();
    };

    // 如果用户输入了自定义名字且没有选择现有学员
    if (!selectedStudentId && customStudentName.trim()) {
      const name = customStudentName.trim();
      Alert.alert(
        "建立档案",
        `是否要为 "${name}" 建立学员档案？`,
        [
          { 
            text: "暂不建立", 
            style: "cancel",
            onPress: () => savePlan(undefined, name) 
          },
          { 
            text: "建立档案", 
            onPress: () => {
              // Create new student
              const newStudentId = Math.random().toString(36).substr(2, 9);
              addStudent({
                id: newStudentId,
                name: name,
                currentLevelId: '1.0',
                joinDate: new Date().toISOString().split('T')[0],
                avatar: 'https://images.unsplash.com/photo-1554068865-24cecd4e34f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
                assessments: {}
              });
              // 传递新创建的 studentId 和 studentName，确保在任何情况下都能正确显示名称
              savePlan(newStudentId, name);
            }
          }
        ]
      );
    } else {
      // 现有学员排课，可以安全地不传 studentName（由 studentId 去关联）
      // 也可以为了统一都传一个，这里为了兼容现有逻辑不作改动
      const existingStudent = students.find(s => s.id === selectedStudentId);
      savePlan(selectedStudentId, existingStudent?.name);
    }
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
          <Text style={styles.sectionTitle}>课程基本信息</Text>
          
          <Text style={styles.label}>选择学员</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.studentScroll}>
            {students.map(s => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.studentChip,
                  selectedStudentId === s.id && styles.studentChipActive
                ]}
                onPress={() => {
                  setSelectedStudentId(s.id);
                  setCustomStudentName(''); // 清空自定义输入
                }}
              >
                <Text style={[
                  styles.studentChipText,
                  selectedStudentId === s.id && styles.studentChipTextActive
                ]}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {!selectedStudentId && (
            <TextInput
              style={[styles.input, { marginBottom: 16 }]}
              value={customStudentName}
              onChangeText={setCustomStudentName}
              placeholder="输入未建档学员姓名..."
            />
          )}
          
          <Text style={styles.label}>日期 (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="2023-10-01"
          />

          <View style={styles.timeRow}>
            <View style={styles.timeColumn}>
              <Text style={styles.label}>开始时间</Text>
              <TextInput
                style={styles.input}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="14:00"
              />
            </View>
            <View style={styles.timeSpacer} />
            <View style={styles.timeColumn}>
              <Text style={styles.label}>结束时间</Text>
              <TextInput
                style={styles.input}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="15:30"
              />
            </View>
          </View>

          <Text style={[styles.label, { marginTop: 8 }]}>训练场地</Text>
          {historicalLocations.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScroll}>
              {historicalLocations.map(loc => (
                <TouchableOpacity
                  key={loc}
                  style={[
                    styles.locationChip,
                    location === loc && styles.locationChipActive
                  ]}
                  onPress={() => setLocation(loc)}
                >
                  <Text style={[
                    styles.locationChipText,
                    location === loc && styles.locationChipTextActive
                  ]}>
                    {loc}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="输入打球地址（如：朝阳公园网球场）"
          />
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
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeColumn: {
    flex: 1,
  },
  timeSpacer: {
    width: 16,
  },
  studentScroll: {
    marginBottom: 16,
  },
  studentChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ECF0F1',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  studentChipActive: {
    backgroundColor: '#E8F4F8',
    borderColor: '#3498DB',
  },
  studentChipText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  studentChipTextActive: {
    color: '#3498DB',
  },
  locationScroll: {
    marginBottom: 12,
  },
  locationChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F7FA',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  locationChipActive: {
    backgroundColor: '#E8F4F8',
    borderColor: '#3498DB',
  },
  locationChipText: {
    fontSize: 13,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  locationChipTextActive: {
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
