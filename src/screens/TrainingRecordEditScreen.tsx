import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Save, CheckSquare, Square, Trash2, Minus, Plus, Calendar } from 'lucide-react-native';

import { useStore } from '../store';
import { skills } from '../data/mockData';
import { TrainingRecordStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<TrainingRecordStackParamList, 'TrainingRecordEdit'>;
type RouteProps = RouteProp<TrainingRecordStackParamList, 'TrainingRecordEdit'>;

export default function TrainingRecordEditScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const headerHeight = useHeaderHeight();
  
  const { recordId } = route.params || {};
  const { sessionRecords, addSessionRecord, updateSessionRecord, deleteSessionRecord } = useStore();
  
  // Find existing record if editing
  const existingRecord = recordId ? sessionRecords.find(r => r.id === recordId) : null;

  const TRAINING_TYPES = ['底线对拉', '多球训练', '发球机', '实战比赛', '发球专项', '体能训练'];

  // Form State
  const [date, setDate] = useState(existingRecord?.date || new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(existingRecord?.duration || 1.0);
  const [trainingTypes, setTrainingTypes] = useState<string[]>(existingRecord?.trainingTypes || []);
  const [focusSkillIds, setFocusSkillIds] = useState<string[]>(existingRecord?.focusSkillIds || []);
  const [notes, setNotes] = useState(existingRecord?.notes || '');

  const [showCustomDateInput, setShowCustomDateInput] = useState(false);

  // Generate recent 4 days (Today, Yesterday, and the two days before)
  const recentDates = Array.from({ length: 4 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const isoStr = d.toISOString().split('T')[0];
    let label = '';
    if (i === 0) label = '今天';
    else if (i === 1) label = '昨天';
    else label = `${d.getMonth() + 1}/${d.getDate()}`;
    return { value: isoStr, label };
  }).reverse();

  // Check if current date is in the predefined recent dates
  const isCustomDateSelected = !recentDates.some(item => item.value === date);

  const toggleTrainingType = (type: string) => {
    setTrainingTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleSkill = (id: string) => {
    setFocusSkillIds(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!date.trim()) {
      Alert.alert('提示', '请填写打卡日期');
      return;
    }
    
    if (duration <= 0) {
      Alert.alert('提示', '请填写有效的训练时长 (大于0的数字)');
      return;
    }

    const recordData = {
      date,
      duration,
      trainingTypes,
      focusSkillIds,
      notes
    };

    if (existingRecord) {
      updateSessionRecord(existingRecord.id, recordData);
    } else {
      addSessionRecord(recordData);
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existingRecord) return;
    
    Alert.alert('删除确认', '确定要删除这条打卡记录吗？', [
      { text: '取消', style: 'cancel' },
      { 
        text: '删除', 
        style: 'destructive', 
        onPress: () => {
          deleteSessionRecord(existingRecord.id);
          navigation.goBack();
        }
      }
    ]);
  };

  // Group skills by category for better selection UI
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {existingRecord ? '编辑打卡记录' : '新增打卡记录'}
        </Text>
        <View style={styles.headerRight}>
          {existingRecord && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Trash2 color="#E74C3C" size={22} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSave}>
            <Save color="#3498DB" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAwareScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? headerHeight + 20 : 20}
        keyboardShouldPersistTaps="handled"
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          {/* Basic Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>基本信息</Text>
          
          <Text style={styles.label}>训练日期</Text>
          <View style={styles.datesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll}>
              {recentDates.map(item => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.dateChip, date === item.value && !showCustomDateInput && styles.dateChipActive]}
                  onPress={() => {
                    setDate(item.value);
                    setShowCustomDateInput(false);
                  }}
                >
                  <Text style={[styles.dateChipText, date === item.value && !showCustomDateInput && styles.dateChipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={[
                  styles.dateChip, 
                  styles.customDateChip,
                  (isCustomDateSelected || showCustomDateInput) && styles.dateChipActive
                ]}
                onPress={() => setShowCustomDateInput(true)}
              >
                <Calendar 
                  color={(isCustomDateSelected || showCustomDateInput) ? "#FFFFFF" : "#7F8C8D"} 
                  size={16} 
                  style={{ marginRight: 4 }} 
                />
                <Text style={[
                  styles.dateChipText, 
                  (isCustomDateSelected || showCustomDateInput) && styles.dateChipTextActive
                ]}>
                  自定义
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {showCustomDateInput && (
            <View style={styles.customDateInputContainer}>
              <TextInput
                style={styles.customDateInput}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                keyboardType="numeric"
                maxLength={10}
              />
              <Text style={styles.customDateHelper}>请输入格式为 YYYY-MM-DD 的日期</Text>
            </View>
          )}

          <Text style={styles.label}>训练时长</Text>
          <View style={styles.stepperContainer}>
            <TouchableOpacity 
              style={styles.stepperBtn} 
              onPress={() => setDuration(Math.max(0.5, duration - 0.5))}
            >
              <Minus color="#3498DB" size={24} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{duration.toFixed(1)} 小时</Text>
            <TouchableOpacity 
              style={styles.stepperBtn} 
              onPress={() => setDuration(duration + 0.5)}
            >
              <Plus color="#3498DB" size={24} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.quickDurationContainer}>
            {[1.0, 1.5, 2.0].map(val => (
              <TouchableOpacity 
                key={val} 
                style={styles.quickDurationChip}
                onPress={() => setDuration(val)}
              >
                <Text style={styles.quickDurationText}>{val.toFixed(1)}h</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Training Type Selection Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>训练类型</Text>
          <Text style={styles.helperText}>选择本次训练的主要形式（可多选）</Text>
          <View style={styles.chipsContainer}>
            {TRAINING_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, trainingTypes.includes(type) && styles.chipActive]}
                onPress={() => toggleTrainingType(type)}
              >
                <Text style={[styles.chipText, trainingTypes.includes(type) && styles.chipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Focus Skills Selection Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>重点练习技能</Text>
          <Text style={styles.helperText}>勾选本次训练重点突破的技术动作（可多选或不选）</Text>
          
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <View key={category} style={styles.skillCategoryGroup}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {categorySkills.map(skill => {
                const isSelected = focusSkillIds.includes(skill.id);
                return (
                  <TouchableOpacity 
                    key={skill.id} 
                    style={styles.checkboxRow}
                    onPress={() => toggleSkill(skill.id)}
                  >
                    {isSelected ? (
                      <CheckSquare color="#3498DB" size={20} />
                    ) : (
                      <Square color="#95A5A6" size={20} />
                    )}
                    <Text style={[styles.checkboxText, isSelected && styles.checkboxTextActive]}>
                      {skill.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Notes Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>训练心得</Text>
          <Text style={styles.label}>自由备注</Text>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="记录今天的进步、发现的问题或教练的指导..."
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAwareScrollView>
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  datesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  datesScroll: {
    flexDirection: 'row',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  customDateChip: {
    backgroundColor: '#FFFFFF',
    borderStyle: 'dashed',
  },
  dateChipActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
    borderStyle: 'solid',
  },
  dateChipText: {
    color: '#7F8C8D',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateChipTextActive: {
    color: '#FFFFFF',
  },
  customDateInputContainer: {
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  customDateInput: {
    borderWidth: 1,
    borderColor: '#ECF0F1',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
  },
  customDateHelper: {
    fontSize: 12,
    color: '#95A5A6',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  stepperBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    paddingHorizontal: 20,
  },
  quickDurationContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  quickDurationChip: {
    backgroundColor: '#ECF0F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  quickDurationText: {
    color: '#34495E',
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  chipActive: {
    backgroundColor: '#E8F4F8', // Light blue tint
    borderColor: '#3498DB',
  },
  chipText: {
    color: '#7F8C8D',
    fontWeight: '600',
    fontSize: 14,
  },
  chipTextActive: {
    color: '#3498DB',
  },
  helperText: {
    fontSize: 13,
    color: '#95A5A6',
    marginBottom: 16,
  },
  skillCategoryGroup: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 10,
    backgroundColor: '#F8F9FA',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  checkboxText: {
    fontSize: 15,
    color: '#34495E',
    marginLeft: 12,
  },
  checkboxTextActive: {
    color: '#3498DB',
    fontWeight: 'bold',
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