import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserPlus, ChevronRight, Search } from 'lucide-react-native';

import { useCoachStore } from '../store/coachStore';
import { CoachStackParamList } from '../navigation/types';
import { levels } from '../data/mockData';

type NavigationProp = NativeStackNavigationProp<CoachStackParamList, 'StudentList'>;

export default function StudentListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { students, addStudent } = useCoachStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // 新增学员弹窗状态
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStudent = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        "新增学员",
        "请输入学员姓名",
        [
          {
            text: "取消",
            style: "cancel"
          },
          {
            text: "确定",
            onPress: (name?: string) => {
              if (name && name.trim()) {
                addStudent({
                  name: name.trim(),
                  currentLevelId: "1.0", // default level
                });
              }
            }
          }
        ],
        "plain-text"
      );
    } else {
      // 安卓使用自定义弹窗
      setNewStudentName('');
      setIsAddModalVisible(true);
    }
  };

  const submitNewStudent = () => {
    if (newStudentName.trim()) {
      addStudent({
        name: newStudentName.trim(),
        currentLevelId: "1.0",
      });
      setIsAddModalVisible(false);
      setNewStudentName('');
    }
  };

  const renderStudent = ({ item }: { item: typeof students[0] }) => {
    const levelName = levels.find(l => l.id === item.currentLevelId)?.name || '';

    return (
      <TouchableOpacity 
        style={styles.studentCard}
        onPress={() => navigation.navigate('StudentDetail', { studentId: item.id })}
      >
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentLevel}>水平: {item.currentLevelId} ({levelName})</Text>
          {item.lastLessonDate ? (
              <Text style={styles.lastLesson}>上次上课: {item.lastLessonDate}</Text>
            ) : null}
        </View>
        <ChevronRight color="#BDC3C7" size={24} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>教练工作台</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddStudent}>
          <UserPlus color="#FFFFFF" size={20} />
          <Text style={styles.addButtonText}>添加</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search color="#95A5A6" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索学员..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredStudents}
        keyExtractor={item => item.id}
        renderItem={renderStudent}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? "没有找到匹配的学员" : "暂无学员，点击右上角添加"}
            </Text>
          </View>
        }
      />

      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>新增学员</Text>
            <Text style={styles.modalMessage}>请输入学员姓名</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="例如: 张三"
              value={newStudentName}
              onChangeText={setNewStudentName}
              autoFocus
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]} 
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSubmitButton, !newStudentName.trim() && styles.modalSubmitButtonDisabled]} 
                onPress={submitNewStudent}
                disabled={!newStudentName.trim()}
              >
                <Text style={styles.modalSubmitText}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingTop: 60, // Adjust for safe area
    backgroundColor: '#2C3E50',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498DB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: '#2C3E50',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
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
    marginBottom: 2,
  },
  lastLesson: {
    fontSize: 12,
    color: '#95A5A6',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#95A5A6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  modalCancelButton: {
    backgroundColor: 'transparent',
  },
  modalCancelText: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '500',
  },
  modalSubmitButton: {
    backgroundColor: '#3498DB',
  },
  modalSubmitButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
