import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Trash2, RotateCcw } from 'lucide-react-native';

import { useCoachStore } from '../store/coachStore';
import { CoachStackParamList } from '../navigation/types';
import { levels } from '../data/mockData';

type NavigationProp = NativeStackNavigationProp<CoachStackParamList, 'RecycleBin'>;

export default function RecycleBinScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { students, restoreStudent, permanentlyDeleteStudent } = useCoachStore();

  // 过滤出在回收站里的学员
  const deletedStudents = students.filter(s => s.deletedAt);

  const confirmPermanentDelete = (id: string, name: string) => {
    Alert.alert(
      "彻底删除",
      `确定要彻底删除学员 "${name}" 吗？此操作不可恢复，且将删除该学员的所有档案与教案记录。`,
      [
        { text: "取消", style: "cancel" },
        { text: "彻底删除", style: "destructive", onPress: () => permanentlyDeleteStudent(id) }
      ]
    );
  };

  const confirmRestore = (id: string, name: string) => {
    Alert.alert(
      "恢复学员",
      `确定要恢复学员 "${name}" 吗？`,
      [
        { text: "取消", style: "cancel" },
        { text: "恢复", style: "default", onPress: () => restoreStudent(id) }
      ]
    );
  };

  const getDaysRemaining = (deletedAt: number) => {
    const now = Date.now();
    const passedDays = Math.floor((now - deletedAt) / (1000 * 3600 * 24));
    return Math.max(0, 30 - passedDays);
  };

  const renderStudent = ({ item }: { item: typeof students[0] }) => {
    const levelName = levels.find(l => l.id === item.currentLevelId)?.name || '';
    const daysRemaining = item.deletedAt ? getDaysRemaining(item.deletedAt) : 0;

    return (
      <View style={styles.studentCard}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentLevel}>水平: {item.currentLevelId} ({levelName})</Text>
          <Text style={styles.deleteInfo}>
            将于 {daysRemaining} 天后永久删除
          </Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.restoreButton]}
            onPress={() => confirmRestore(item.id, item.name)}
          >
            <RotateCcw color="#27AE60" size={20} />
            <Text style={styles.restoreText}>恢复</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => confirmPermanentDelete(item.id, item.name)}
          >
            <Trash2 color="#E74C3C" size={20} />
            <Text style={styles.deleteText}>彻底删除</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>回收站</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={deletedStudents}
        keyExtractor={item => item.id}
        renderItem={renderStudent}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>回收站为空</Text>
            <Text style={styles.emptySubText}>删除的学员将在此保留 30 天</Text>
          </View>
        }
      />
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
    marginRight: 12,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  studentLevel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  deleteInfo: {
    fontSize: 12,
    color: '#E74C3C',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  restoreButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  restoreText: {
    fontSize: 12,
    color: '#27AE60',
    marginTop: 4,
  },
  deleteText: {
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#95A5A6',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#BDC3C7',
  },
});