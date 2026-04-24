import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableHighlight, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserPlus, ChevronRight, Search, Trash2, Filter, X } from 'lucide-react-native';

import { useCoachStore } from '../store/coachStore';
import { CoachStackParamList } from '../navigation/types';
import { levels } from '../data/mockData';

type NavigationProp = NativeStackNavigationProp<CoachStackParamList, 'StudentList'>;

export default function StudentListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { students, addStudent, deleteStudent } = useCoachStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // 新增学员弹窗状态
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  // 筛选状态
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filterLevelId, setFilterLevelId] = useState<string | null>(null);
  const [filterTimeType, setFilterTimeType] = useState<'none' | 'dateRange' | 'daysSince'>('none');
  const [filterDaysSince, setFilterDaysSince] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const filteredStudents = students.filter(s => {
    // 1. 搜索词筛选
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // 2. 水平筛选
    if (filterLevelId && s.currentLevelId !== filterLevelId) {
      return false;
    }
    
    // 3. 上课时间筛选
    if (filterTimeType === 'daysSince' && filterDaysSince.trim() !== '') {
      const daysThreshold = parseInt(filterDaysSince);
      if (!isNaN(daysThreshold)) {
        if (!s.lastLessonDate) return true; // 如果从没上过课，算作很久没上课
        const lastDate = new Date(s.lastLessonDate).getTime();
        const today = new Date().getTime();
        const diffDays = (today - lastDate) / (1000 * 3600 * 24);
        if (diffDays < daysThreshold) return false;
      }
    } else if (filterTimeType === 'dateRange' && (filterStartDate.trim() !== '' || filterEndDate.trim() !== '')) {
      if (!s.lastLessonDate) return false; // 如果有输入具体的日期范围要求，没上过课的直接排除
      if (filterStartDate.trim() !== '' && s.lastLessonDate < filterStartDate) return false;
      if (filterEndDate.trim() !== '' && s.lastLessonDate > filterEndDate) return false;
    }
    
    return true;
  });

  // 判断时间筛选是否真正输入了有效条件
  const isTimeFilterActive = 
    (filterTimeType === 'daysSince' && filterDaysSince.trim() !== '' && !isNaN(parseInt(filterDaysSince))) ||
    (filterTimeType === 'dateRange' && (filterStartDate.trim() !== '' || filterEndDate.trim() !== ''));

  // 记录激活的筛选条件数量
  const activeFiltersCount = (filterLevelId ? 1 : 0) + (isTimeFilterActive ? 1 : 0);

  // 记录筛选出来的学生条数
  const filteredStudentsCount = filteredStudents.length;

  const resetFilters = () => {
    setFilterLevelId(null);
    setFilterTimeType('none');
    setFilterDaysSince('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

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
      <View style={styles.studentCardContainer}>
        <TouchableHighlight 
          style={styles.studentCard}
          underlayColor="#F7F9F9"
          onPress={() => navigation.navigate('StudentDetail', { studentId: item.id })}
        >
          <View style={styles.studentCardInner}>
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
          </View>
        </TouchableHighlight>
      </View>
    );
  };

  const renderHiddenItem = ({ item }: { item: typeof students[0] }) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => deleteStudent(item.id)}
      >
        <Trash2 color="#FFFFFF" size={24} />
        <Text style={styles.backTextWhite}>删除</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>教练工作台</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddStudent}>
          <UserPlus color="#FFFFFF" size={20} />
          <Text style={styles.addButtonText}>添加</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search color="#95A5A6" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索学员..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]} 
          onPress={() => setIsFilterModalVisible(true)}
          activeOpacity={0.7}
        >
          <Filter color={activeFiltersCount > 0 ? "#3498DB" : "#7F8C8D"} size={20} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filteredStudentsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <SwipeListView
        data={filteredStudents}
        keyExtractor={item => item.id}
        renderItem={renderStudent}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-75}
        disableRightSwipe
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? "没有找到匹配的学员" : "暂无学员，点击右上角添加"}
            </Text>
          </View>
        }
      />

      {/* 筛选弹窗 */}
      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            style={styles.keyboardAvoidingContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>筛选学员</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <X color="#7F8C8D" size={24} />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterSectionTitle}>按水平筛选</Text>
            <View style={styles.filterChipContainer}>
              <TouchableOpacity 
                style={[styles.filterChip, filterLevelId === null && styles.filterChipActive]}
                onPress={() => setFilterLevelId(null)}
              >
                <Text style={[styles.filterChipText, filterLevelId === null && styles.filterChipTextActive]}>不限</Text>
              </TouchableOpacity>
              {levels.map(level => (
                <TouchableOpacity 
                  key={level.id}
                  style={[styles.filterChip, filterLevelId === level.id && styles.filterChipActive]}
                  onPress={() => setFilterLevelId(level.id)}
                >
                  <Text style={[styles.filterChipText, filterLevelId === level.id && styles.filterChipTextActive]}>{level.id}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>按上课时间筛选</Text>
            <View style={styles.filterTimeTabs}>
              <TouchableOpacity 
                style={[styles.filterTimeTab, filterTimeType === 'none' && styles.filterTimeTabActive]}
                onPress={() => setFilterTimeType('none')}
              >
                <Text style={[styles.filterTimeTabText, filterTimeType === 'none' && styles.filterTimeTabTextActive]}>不限</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterTimeTab, filterTimeType === 'dateRange' && styles.filterTimeTabActive]}
                onPress={() => setFilterTimeType('dateRange')}
              >
                <Text style={[styles.filterTimeTabText, filterTimeType === 'dateRange' && styles.filterTimeTabTextActive]}>日期范围</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterTimeTab, filterTimeType === 'daysSince' && styles.filterTimeTabActive]}
                onPress={() => setFilterTimeType('daysSince')}
              >
                <Text style={[styles.filterTimeTabText, filterTimeType === 'daysSince' && styles.filterTimeTabTextActive]}>未上课天数</Text>
              </TouchableOpacity>
            </View>

            {filterTimeType === 'dateRange' && (
              <View style={styles.filterDateInputs}>
                <TextInput
                  style={styles.filterInput}
                  placeholder="开始日期 (YYYY-MM-DD)"
                  value={filterStartDate}
                  onChangeText={setFilterStartDate}
                />
                <Text style={styles.filterDateSeparator}>至</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="结束日期 (YYYY-MM-DD)"
                  value={filterEndDate}
                  onChangeText={setFilterEndDate}
                />
              </View>
            )}

            {filterTimeType === 'daysSince' && (
              <View style={styles.filterDaysInputContainer}>
                <TextInput
                  style={styles.filterInput}
                  placeholder="输入天数 (如 30)"
                  value={filterDaysSince}
                  onChangeText={setFilterDaysSince}
                  keyboardType="numeric"
                />
                <Text style={styles.filterDaysSuffix}>天以上未上课</Text>
              </View>
            )}
            
            <View style={[styles.modalActions, { marginTop: 24 }]}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]} 
                onPress={resetFilters}
              >
                <Text style={styles.modalCancelText}>重置</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  styles.modalSubmitButton,
                  activeFiltersCount === 0 && styles.modalSubmitButtonDisabled
                ]} 
                onPress={() => setIsFilterModalVisible(false)}
                disabled={activeFiltersCount === 0}
              >
                <Text style={styles.modalSubmitText}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* 新增学员的弹窗 */}
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            style={styles.keyboardAvoidingContainer}
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
        </View>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterButton: {
    marginLeft: 12,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ECF0F1',
    zIndex: 10,
  },
  filterButtonActive: {
    backgroundColor: '#EBF5FB',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E74C3C',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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
  studentCardContainer: {
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  studentCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  studentCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
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
  keyboardAvoidingContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
    marginBottom: 12,
  },
  filterChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F7F9F9',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  filterChipActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  filterChipText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  filterTimeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F7F9F9',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  filterTimeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  filterTimeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterTimeTabText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  filterTimeTabTextActive: {
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  filterDateInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterDateSeparator: {
    fontSize: 14,
    color: '#7F8C8D',
    marginHorizontal: 8,
  },
  filterDaysInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterDaysSuffix: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 8,
  },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2C3E50',
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
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnRight: {
    backgroundColor: '#E74C3C',
    right: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  backTextWhite: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  }
});
