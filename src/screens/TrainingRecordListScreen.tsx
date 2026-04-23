import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Trash2, Plus } from 'lucide-react-native';

import { useStore } from '../store';
import { skills } from '../data/mockData';
import { TrainingRecordStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<TrainingRecordStackParamList, 'TrainingRecordList'>;

export default function TrainingRecordListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { sessionRecords, deleteSessionRecord } = useStore();

  const handleDelete = (id: string) => {
    Alert.alert('删除确认', '确定要删除这条打卡记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => deleteSessionRecord(id) }
    ]);
  };

  const getSkillNames = (skillIds: string[]) => {
    if (!skillIds || skillIds.length === 0) return '自由练习';
    const names = skillIds.map(id => {
      const skill = skills.find(s => s.id === id);
      return skill ? skill.name : '';
    }).filter(Boolean);
    
    return names.join(', ');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>训练打卡记录</Text>

      <TouchableOpacity 
        style={styles.addRecordButton}
        onPress={() => navigation.navigate('TrainingRecordEdit', {})}
      >
        <Plus color="#FFFFFF" size={24} />
        <Text style={styles.addRecordButtonText}>新增打卡</Text>
      </TouchableOpacity>

      <ScrollView 
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>历史记录 ({sessionRecords.length})</Text>
        
        {sessionRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>暂无打卡记录，开始你的第一次训练吧！</Text>
          </View>
        ) : (
          sessionRecords.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordDate}>
                  {new Date(record.date).toLocaleDateString()}
                </Text>
                <TouchableOpacity onPress={() => handleDelete(record.id)} style={styles.deleteButton}>
                  <Trash2 color="#E74C3C" size={18} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.recordInfo}>
                <Text style={styles.infoLabel}>时长:</Text>
                <Text style={styles.infoValue}>{record.duration} 小时</Text>
              </View>
              
              <View style={styles.recordInfo}>
                <Text style={styles.infoLabel}>重点:</Text>
                <Text style={styles.infoValue}>{getSkillNames(record.focusSkillIds)}</Text>
              </View>
              
              {record.notes ? (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesText}>{record.notes}</Text>
                </View>
              ) : null}
              
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => navigation.navigate('TrainingRecordEdit', { recordId: record.id })}
              >
                <Text style={styles.editButtonText}>编辑</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 60, // 为顶部状态栏留出空间
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  addRecordButton: {
    backgroundColor: '#3498DB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addRecordButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 10,
  },
  emptyStateText: {
    color: '#7F8C8D',
    fontSize: 15,
    textAlign: 'center',
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#3498DB',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F4',
  },
  recordDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  deleteButton: {
    padding: 4,
  },
  recordInfo: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    width: 40,
    fontWeight: '600',
  },
  infoValue: {
    flex: 1,
    fontSize: 15,
    color: '#34495E',
  },
  notesContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  editButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ECF0F1',
    borderRadius: 6,
    marginTop: 4,
  },
  editButtonText: {
    color: '#34495E',
    fontSize: 13,
    fontWeight: '600',
  }
});