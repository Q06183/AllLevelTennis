import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, Clock, ChevronRight, User } from 'lucide-react-native';

import { useCoachStore } from '../store/coachStore';
import { ScheduleStackParamList } from '../navigation/types';
import { LessonPlan } from '../types';

type NavigationProp = NativeStackNavigationProp<ScheduleStackParamList, 'ScheduleList'>;

interface ScheduleSection {
  title: string;
  data: LessonPlan[];
}

export default function ScheduleListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { lessonPlans, students } = useCoachStore();

  // 按照日期分组并按时间排序
  const sections = useMemo(() => {
    if (!lessonPlans || lessonPlans.length === 0) return [];

    // 1. Group by date
    const grouped = lessonPlans.reduce((acc, plan) => {
      const date = plan.date || '未知日期';
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(plan);
      return acc;
    }, {} as Record<string, LessonPlan[]>);

    // 2. Sort dates (newest to oldest, or oldest to newest depending on preference)
    // Here we sort from oldest to newest (upcoming first)
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    // 3. Format into SectionList data structure and sort times within each day
    return sortedDates.map(date => {
      const plansForDate = grouped[date];
      
      // Sort by start time if available
      plansForDate.sort((a, b) => {
        const timeA = a.startTime || '00:00';
        const timeB = b.startTime || '00:00';
        return timeA.localeCompare(timeB);
      });

      return {
        title: date,
        data: plansForDate
      };
    });
  }, [lessonPlans]);

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : '未知学员';
  };

  const renderItem = ({ item }: { item: LessonPlan }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('LessonPlanEdit', { 
        studentId: item.studentId, 
        lessonPlanId: item.id 
      })}
    >
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{item.startTime || '--:--'}</Text>
        <Text style={styles.timeMuted}>至</Text>
        <Text style={styles.timeText}>{item.endTime || '--:--'}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.infoColumn}>
        <View style={styles.studentRow}>
          <User color="#3498DB" size={16} />
          <Text style={styles.studentName}>{getStudentName(item.studentId)}</Text>
        </View>
        
        <View style={styles.detailsRow}>
          <Text style={styles.detailsText} numberOfLines={1}>
            重点: {item.focusSkillIds.length}项技能, {item.selectedDrillIds.length}个练习
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.profileLink}
          onPress={() => navigation.navigate('StudentDetail', { studentId: item.studentId })}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.profileLinkText}>查看档案</Text>
          <ChevronRight color="#95A5A6" size={14} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }: { section: ScheduleSection }) => {
    // 简单格式化日期，例如 "2024-05-20" -> "5月20日"
    const dateParts = title.split('-');
    const displayTitle = dateParts.length === 3 
      ? `${parseInt(dateParts[1])}月${parseInt(dateParts[2])}日` 
      : title;

    return (
      <View style={styles.sectionHeader}>
        <Calendar color="#2C3E50" size={18} style={styles.sectionIcon} />
        <Text style={styles.sectionHeaderText}>{displayTitle}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>教学日程表</Text>
      
      {sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Calendar color="#BDC3C7" size={48} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyStateText}>暂无排课安排</Text>
          <Text style={styles.emptyStateSubText}>请前往「学员管理」为学员添加教案</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={true}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeColumn: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  timeMuted: {
    fontSize: 12,
    color: '#BDC3C7',
    marginVertical: 4,
  },
  divider: {
    width: 1,
    backgroundColor: '#ECF0F1',
    marginHorizontal: 16,
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 6,
  },
  detailsRow: {
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  profileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  profileLinkText: {
    fontSize: 12,
    color: '#95A5A6',
    fontWeight: '600',
    marginRight: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
  }
});