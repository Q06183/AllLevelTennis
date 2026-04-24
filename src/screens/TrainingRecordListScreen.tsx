import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Trash2, Plus, Calendar as CalendarIcon, List, Check } from 'lucide-react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

import { useStore } from '../store';
import { skills } from '../data/mockData';
import { TrainingRecordStackParamList } from '../navigation/types';

// 配置日历中文语言
LocaleConfig.locales['zh'] = {
  monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
  today: '今天'
};
LocaleConfig.defaultLocale = 'zh';

type NavigationProp = NativeStackNavigationProp<TrainingRecordStackParamList, 'TrainingRecordList'>;

export default function TrainingRecordListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { sessionRecords, deleteSessionRecord } = useStore();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  // 获取标记的日期
  const markedDates = useMemo(() => {
    const dates: Record<string, any> = {};
    sessionRecords.forEach(record => {
      const dateStr = new Date(record.date).toISOString().split('T')[0];
      dates[dateStr] = { marked: true };
    });
    
    if (selectedDate) {
      dates[selectedDate] = { 
        ...dates[selectedDate], 
        selected: true,
        selectedColor: '#3498DB'
      };
    }
    
    return dates;
  }, [sessionRecords, selectedDate]);

  // 获取选中日期的记录
  const selectedDateRecords = useMemo(() => {
    if (!selectedDate) return [];
    return sessionRecords.filter(record => {
      const recordDateStr = new Date(record.date).toISOString().split('T')[0];
      return recordDateStr === selectedDate;
    });
  }, [sessionRecords, selectedDate]);

  // 渲染单个记录卡片
  const renderRecordCard = (record: any) => (
    <View key={record.id} style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.dateAndTypeRow}>
          <Text style={styles.recordDate}>
            {new Date(record.date).toLocaleDateString()}
          </Text>
          {record.trainingTypes && record.trainingTypes.length > 0 ? (
            <View style={styles.typeTagsContainer}>
              {record.trainingTypes.map((type: string, index: number) => (
                <View key={index} style={styles.typeTag}>
                  <Text style={styles.typeTagText}>{type}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
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
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>训练打卡</Text>
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <List color={viewMode === 'list' ? '#FFFFFF' : '#7F8C8D'} size={18} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleButtonActive]}
            onPress={() => setViewMode('calendar')}
          >
            <CalendarIcon color={viewMode === 'calendar' ? '#FFFFFF' : '#7F8C8D'} size={18} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.addRecordButton}
        onPress={() => navigation.navigate('TrainingRecordEdit', {})}
      >
        <Plus color="#FFFFFF" size={24} />
        <Text style={styles.addRecordButtonText}>新增打卡</Text>
      </TouchableOpacity>

      {viewMode === 'list' ? (
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
            sessionRecords.map(renderRecordCard)
          )}
        </ScrollView>
      ) : (
        <ScrollView 
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.calendarContainer}>
            <Calendar
              markedDates={markedDates}
              onDayPress={(day: any) => setSelectedDate(day.dateString)}
              theme={{
                todayTextColor: '#3498DB',
                selectedDayBackgroundColor: '#3498DB',
                arrowColor: '#3498DB',
              }}
              dayComponent={({date, state}: any) => {
                const dateStr = date.dateString;
                const isSelected = selectedDate === dateStr;
                const isMarked = markedDates[dateStr]?.marked;
                
                return (
                  <TouchableOpacity 
                    onPress={() => setSelectedDate(dateStr)}
                    style={[
                      styles.dayContainer,
                      isSelected && styles.daySelected
                    ]}
                  >
                    <Text style={[
                      styles.dayText,
                      state === 'disabled' && styles.dayTextDisabled,
                      isSelected && styles.dayTextSelected
                    ]}>
                      {date.day}
                    </Text>
                    {isMarked && (
                      <View style={styles.tennisMark}>
                        <Check size={10} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {selectedDate ? (
            <View style={styles.selectedDateContainer}>
              <Text style={styles.sectionTitle}>
                {selectedDate} 的训练 ({selectedDateRecords.length})
              </Text>
              {selectedDateRecords.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>这一天没有训练记录哦~</Text>
                </View>
              ) : (
                selectedDateRecords.map(renderRecordCard)
              )}
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 60, // 为顶部状态栏留出空间
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#ECF0F1',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#3498DB',
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
  dateAndTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginRight: 10,
    marginBottom: 4,
  },
  typeTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  typeTag: {
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3498DB',
    marginRight: 6,
    marginBottom: 4,
  },
  typeTagText: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: 'bold',
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
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingBottom: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  dayContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  daySelected: {
    backgroundColor: '#3498DB',
  },
  dayText: {
    fontSize: 16,
    color: '#2D4150',
  },
  dayTextDisabled: {
    color: '#D9E1E8',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tennisMark: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#8CC63F', // 经典网球绿
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  selectedDateContainer: {
    marginTop: 10,
  }
});