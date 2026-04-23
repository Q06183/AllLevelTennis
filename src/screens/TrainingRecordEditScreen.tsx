import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Save, CheckSquare, Square, Trash2 } from 'lucide-react-native';

import { useStore } from '../store';
import { skills } from '../data/mockData';
import { TrainingRecordStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<TrainingRecordStackParamList, 'TrainingRecordEdit'>;
type RouteProps = RouteProp<TrainingRecordStackParamList, 'TrainingRecordEdit'>;

export default function TrainingRecordEditScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  
  const { recordId } = route.params || {};
  const { sessionRecords, addSessionRecord, updateSessionRecord, deleteSessionRecord } = useStore();
  
  // Find existing record if editing
  const existingRecord = recordId ? sessionRecords.find(r => r.id === recordId) : null;

  // Form State
  const [date, setDate] = useState(existingRecord?.date || new Date().toISOString().split('T')[0]);
  const [durationStr, setDurationStr] = useState(existingRecord?.duration?.toString() || '1.0');
  const [focusSkillIds, setFocusSkillIds] = useState<string[]>(existingRecord?.focusSkillIds || []);
  const [notes, setNotes] = useState(existingRecord?.notes || '');

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
    
    const duration = parseFloat(durationStr);
    if (isNaN(duration) || duration <= 0) {
      Alert.alert('提示', '请填写有效的训练时长 (大于0的数字)');
      return;
    }

    const recordData = {
      date,
      duration,
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Basic Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>基本信息</Text>
          
          <Text style={styles.label}>训练日期 (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="例如: 2024-05-20"
          />

          <Text style={styles.label}>训练时长 (小时)</Text>
          <TextInput
            style={styles.input}
            value={durationStr}
            onChangeText={setDurationStr}
            keyboardType="numeric"
            placeholder="例如: 1.5"
          />
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