import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, PanResponder, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { User, Clock, ChevronRight } from 'lucide-react-native';

import { useCoachStore } from '../store/coachStore';
import { ScheduleStackParamList } from '../navigation/types';
import { LessonPlan } from '../types';

type NavigationProp = NativeStackNavigationProp<ScheduleStackParamList, 'ScheduleList'>;

const { width } = Dimensions.get('window');
const START_HOUR = 6;  // 日程表从早上 6 点开始
const END_HOUR = 23;   // 日程表到晚上 23 点结束
const HOUR_HEIGHT = 80; // 每小时对应 80 像素高度
const TIME_COLUMN_WIDTH = 60; // 左侧时间列宽度

// 解析 "HH:mm" 格式时间为带小数的小时（例如 "14:30" -> 14.5）
const parseTime = (timeStr?: string): number | null => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h + m / 60;
};

// 格式化小数小时为 "HH:mm"
const formatTime = (timeNum: number): string => {
  const h = Math.floor(timeNum);
  const m = Math.round((timeNum - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// 获取本周所有日期
const getWeekDays = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday);
  
  const week = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    week.push(date);
  }
  return week;
};

const WEEK_DAY_NAMES = ['一', '二', '三', '四', '五', '六', '日'];

export default function ScheduleListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { lessonPlans, students, updateLessonPlan } = useCoachStore();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [currentTime, setCurrentTime] = useState<number>(0);
  
  const scrollViewRef = useRef<ScrollView>(null);

  // 定时更新当前时间
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.getHours() + now.getMinutes() / 60);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // 每分钟更新一次
    return () => clearInterval(interval);
  }, []);

  // 自动滚动到当前时间附近
  useEffect(() => {
    if (currentTime >= START_HOUR && currentTime <= END_HOUR) {
      const yOffset = (currentTime - START_HOUR) * HOUR_HEIGHT - 100;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: Math.max(0, yOffset), animated: true });
      }, 500);
    }
  }, []);

  const weekDays = useMemo(() => getWeekDays(), []);

  // 筛选出选中日期的所有课程
  const dailyLessons = useMemo(() => {
    return lessonPlans.filter(plan => plan.date === selectedDate && plan.startTime && plan.endTime);
  }, [lessonPlans, selectedDate]);

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : '未知学员';
  };

  // 渲染顶部周视图 Tab
  const renderWeekTabs = () => {
    return (
      <View style={styles.weekTabsContainer}>
        {weekDays.map((date, index) => {
          const dateStr = date.toISOString().split('T')[0];
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;

          return (
            <TouchableOpacity 
              key={dateStr} 
              style={[
                styles.tabItem, 
                isSelected && styles.tabItemSelected
              ]}
              onPress={() => setSelectedDate(dateStr)}
            >
              <Text style={[
                styles.tabDayName, 
                isSelected && styles.tabTextSelected,
                isToday && !isSelected && styles.tabTextToday
              ]}>
                周{WEEK_DAY_NAMES[index]}
              </Text>
              <View style={[
                styles.tabDateCircle,
                isSelected && styles.tabDateCircleSelected
              ]}>
                <Text style={[
                  styles.tabDateText,
                  isSelected && styles.tabTextSelected,
                  isToday && !isSelected && styles.tabTextToday
                ]}>
                  {date.getDate()}
                </Text>
              </View>
              {isToday && <View style={styles.todayDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // 渲染网格线与可点击时段
  const renderGridLines = () => {
    const lines = [];
    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
      const top = (hour - START_HOUR) * HOUR_HEIGHT;
      
      // 点击整点时段
      lines.push(
        <TouchableOpacity 
          key={`slot-${hour}-00`} 
          style={[styles.timeSlot, { top, height: HOUR_HEIGHT / 2 }]} 
          onPress={() => handleTimeSlotPress(hour, false)}
        >
          <View style={styles.timeSlotHint}>
            <Text style={styles.timeSlotHintText}>{`${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00 点击排课`}</Text>
          </View>
        </TouchableOpacity>
      );
      
      // 点击半点时段
      if (hour < END_HOUR) {
        lines.push(
          <TouchableOpacity 
            key={`slot-${hour}-30`} 
            style={[styles.timeSlot, { top: top + HOUR_HEIGHT / 2, height: HOUR_HEIGHT / 2 }]} 
            onPress={() => handleTimeSlotPress(hour, true)}
          >
            <View style={styles.timeSlotHint}>
              <Text style={styles.timeSlotHintText}>{`${hour.toString().padStart(2, '0')}:30 - ${(hour + 1).toString().padStart(2, '0')}:30 点击排课`}</Text>
            </View>
          </TouchableOpacity>
        );
      }

      // 渲染整点线
      lines.push(
        <View key={`line-${hour}`} style={[styles.gridRow, { top }]} pointerEvents="none">
          <View style={styles.timeLabelContainer}>
            <Text style={styles.timeLabel}>{`${hour.toString().padStart(2, '0')}:00`}</Text>
          </View>
          <View style={styles.gridLine} />
        </View>
      );
      
      // 渲染半点虚线
      if (hour < END_HOUR) {
        lines.push(
          <View key={`half-${hour}`} style={[styles.gridRow, { top: top + HOUR_HEIGHT / 2 }]} pointerEvents="none">
            <View style={styles.timeLabelContainer} />
            <View style={[styles.gridLine, styles.gridLineDashed]} />
          </View>
        );
      }
    }
    return lines;
  };

  // 处理空白时段的点击
  const handleTimeSlotPress = (hour: number, isHalf: boolean) => {
    const startM = isHalf ? '30' : '00';
    // 默认课程时长 1 小时
    const endH = isHalf ? hour + 1 : hour + 1;
    const endM = startM;
    
    const startTimeStr = `${hour.toString().padStart(2, '0')}:${startM}`;
    const endTimeStr = `${endH.toString().padStart(2, '0')}:${endM}`;
    
    navigation.navigate('LessonPlanEdit', {
      initialDate: selectedDate,
      initialStartTime: startTimeStr,
      initialEndTime: endTimeStr
    });
  };

// DraggableLessonCard component handles individual lesson dragging logic
const DraggableLessonCard = ({ 
  lesson, 
  top, 
  leftOffset, 
  cardWidth, 
  height, 
  isOngoing, 
  navigation, 
  getStudentName, 
  updateLessonPlan,
  scrollViewRef,
  totalColumns
}: any) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const displayName = lesson.studentName || (lesson.studentId ? getStudentName(lesson.studentId) : '未知学员');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 10 || Math.abs(gestureState.dx) > 10 || isDragging;
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 10 || Math.abs(gestureState.dx) > 10 || isDragging;
      },
      onPanResponderGrant: (evt, gestureState) => {
        dragStartY.current = gestureState.y0;
        pan.setOffset({ x: 0, y: 0 });
        pan.setValue({ x: 0, y: 0 });

        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        longPressTimer.current = setTimeout(() => {
          setIsDragging(true);
          scrollViewRef.current?.setNativeProps({ scrollEnabled: false });
        }, 300);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!isDragging && (Math.abs(gestureState.dy) > 10 || Math.abs(gestureState.dx) > 10)) {
          if (longPressTimer.current) clearTimeout(longPressTimer.current);
          setIsDragging(true);
          scrollViewRef.current?.setNativeProps({ scrollEnabled: false });
        }
        
        if (isDragging || Math.abs(gestureState.dy) > 10) {
          // Use animated value for smooth dragging instead of setState
          Animated.event([null, { dy: pan.y }], { useNativeDriver: false })(evt, gestureState);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        
        const totalDy = gestureState.dy;

        if (!isDragging && Math.abs(totalDy) <= 10) {
          // It's a click
          navigation.navigate('LessonPlanEdit', { 
            studentId: lesson.studentId, 
            lessonPlanId: lesson.id 
          });
        } else {
          // It's a drag release
          const newTop = top + totalDy;
          const newStartHourRaw = START_HOUR + newTop / HOUR_HEIGHT;
          const snappedStartHour = Math.round(newStartHourRaw * 4) / 4;
          
          const finalStartHour = Math.max(START_HOUR, Math.min(END_HOUR - (height / HOUR_HEIGHT), snappedStartHour));
          const finalEndHour = finalStartHour + (height / HOUR_HEIGHT);
          
          const newStartTime = formatTime(finalStartHour);
          const newEndTime = formatTime(finalEndHour);
          
          if (lesson.startTime !== newStartTime || lesson.endTime !== newEndTime) {
            updateLessonPlan(lesson.id, {
              startTime: newStartTime,
              endTime: newEndTime
            });
          }
        }
        
        // Reset state
        setIsDragging(false);
        pan.flattenOffset();
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          bounciness: 0,
        }).start();
        scrollViewRef.current?.setNativeProps({ scrollEnabled: true });
      },
      onPanResponderTerminate: () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        setIsDragging(false);
        pan.flattenOffset();
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          bounciness: 0,
        }).start();
        scrollViewRef.current?.setNativeProps({ scrollEnabled: true });
      }
    })
  ).current;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: top,
        left: leftOffset,
        width: cardWidth - 2,
        height,
        zIndex: isDragging ? 1000 : 10,
        transform: [{ translateY: pan.y }]
      }}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.lessonCard,
          { top: 0, left: 0, width: '100%', height: '100%' },
          isOngoing && styles.lessonCardOngoing,
          isDragging && styles.lessonCardDragging
        ]}
      >
        <View style={[styles.lessonCardBorder, isOngoing && styles.lessonCardBorderOngoing]} />
        <View style={styles.lessonContent}>
          <View style={styles.lessonHeaderRow}>
            <Text style={[styles.lessonTime, isOngoing && styles.textOngoing]} numberOfLines={1}>
              {lesson.startTime}-{lesson.endTime}
            </Text>
          </View>
          
          <View style={styles.lessonStudentRow}>
            <User size={12} color={isOngoing ? '#FFFFFF' : '#2C3E50'} />
            <Text style={[styles.lessonStudentName, isOngoing && styles.textOngoing]} numberOfLines={1}>
              {displayName}
            </Text>
          </View>
          
          {height >= 60 && totalColumns <= 2 && (
            <Text style={[styles.lessonDetails, isOngoing && styles.textOngoingMuted]} numberOfLines={1}>
              重点: {lesson.focusSkillIds.length} 项
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

  // 渲染课程卡片
  const renderLessons = () => {
    // 1. Parse times and filter invalid/out-of-bounds lessons
    const validLessons = dailyLessons.map(lesson => {
      const start = parseTime(lesson.startTime);
      const end = parseTime(lesson.endTime);
      return { ...lesson, start, end };
    }).filter(lesson => {
      return lesson.start !== null && lesson.end !== null && 
             lesson.start < END_HOUR && lesson.end > START_HOUR;
    }) as (LessonPlan & { start: number, end: number })[];

    // 2. Sort lessons by start time
    validLessons.sort((a, b) => a.start - b.start);

    // 3. Calculate overlap to determine columns
    // We group overlapping lessons into "clusters"
    const columns: { lesson: any, column: number, totalColumns: number }[] = [];
    
    let currentCluster: any[] = [];
    let clusterEnd = 0;

    const processCluster = (cluster: any[]) => {
      if (cluster.length === 0) return;
      
      // A simple greedy coloring algorithm to assign columns
      const cols: any[][] = [];
      cluster.forEach(lesson => {
        let placed = false;
        for (let i = 0; i < cols.length; i++) {
          const col = cols[i];
          const lastInCol = col[col.length - 1];
          if (lastInCol.end <= lesson.start) {
            col.push(lesson);
            columns.push({ lesson, column: i, totalColumns: 0 }); // totalColumns placeholder
            placed = true;
            break;
          }
        }
        if (!placed) {
          cols.push([lesson]);
          columns.push({ lesson, column: cols.length - 1, totalColumns: 0 });
        }
      });
      
      // Update totalColumns for all lessons in this cluster
      const totalCols = cols.length;
      cluster.forEach(lesson => {
        const item = columns.find(c => c.lesson.id === lesson.id);
        if (item) {
          item.totalColumns = totalCols;
        }
      });
    };

    validLessons.forEach(lesson => {
      if (currentCluster.length === 0) {
        currentCluster.push(lesson);
        clusterEnd = lesson.end;
      } else if (lesson.start < clusterEnd) {
        // Overlaps with current cluster
        currentCluster.push(lesson);
        clusterEnd = Math.max(clusterEnd, lesson.end);
      } else {
        // No overlap, process previous cluster and start a new one
        processCluster(currentCluster);
        currentCluster = [lesson];
        clusterEnd = lesson.end;
      }
    });
    // Process the last cluster
    processCluster(currentCluster);

    // 4. Render
    return columns.map(({ lesson, column, totalColumns }) => {
      // Calculate position and height
      const top = (Math.max(lesson.start, START_HOUR) - START_HOUR) * HOUR_HEIGHT;
      const height = (Math.min(lesson.end, END_HOUR) - Math.max(lesson.start, START_HOUR)) * HOUR_HEIGHT;
      
      // Calculate width and left offset for overlapping
      const availableWidth = width - TIME_COLUMN_WIDTH - 32; // 32 is left+right padding/margins
      const cardWidth = totalColumns > 1 ? availableWidth / totalColumns : availableWidth;
      const leftOffset = column * cardWidth;
      
      // 判断是否正在进行中
      const isOngoing = selectedDate === todayStr && currentTime >= lesson.start && currentTime < lesson.end;

      return (
        <DraggableLessonCard
          key={lesson.id}
          lesson={lesson}
          top={top}
          leftOffset={leftOffset}
          cardWidth={cardWidth}
          height={height}
          isOngoing={isOngoing}
          navigation={navigation}
          getStudentName={getStudentName}
          updateLessonPlan={updateLessonPlan}
          scrollViewRef={scrollViewRef}
          totalColumns={totalColumns}
        />
      );
    });
  };

  // 渲染当前时间线
  const renderCurrentTimeLine = () => {
    if (selectedDate !== todayStr) return null;
    if (currentTime < START_HOUR || currentTime > END_HOUR) return null;

    const top = (currentTime - START_HOUR) * HOUR_HEIGHT;

    return (
      <View style={[styles.currentTimeLineContainer, { top }]}>
        <View style={styles.currentTimeDot} />
        <View style={styles.currentTimeLine} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>排课日程</Text>
      
      {renderWeekTabs()}

      <ScrollView 
        ref={scrollViewRef}
        style={styles.timelineContainer}
        contentContainerStyle={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {renderGridLines()}
        <View style={styles.lessonsContainer}>
          {renderLessons()}
          {renderCurrentTimeLine()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  weekTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width / 7.5,
  },
  tabItemSelected: {
    // 选中态可以加额外背景色，目前只通过文字和圆圈体现
  },
  tabDayName: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 6,
  },
  tabDateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabDateCircleSelected: {
    backgroundColor: '#3498DB',
  },
  tabDateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  tabTextSelected: {
    color: '#FFFFFF',
  },
  tabTextToday: {
    color: '#3498DB',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3498DB',
    position: 'absolute',
    bottom: -6,
  },
  timelineContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gridRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    height: 1, // 主要是为了定位线条
  },
  timeLabelContainer: {
    width: TIME_COLUMN_WIDTH,
    alignItems: 'center',
    transform: [{ translateY: -8 }], // 让文字垂直居中于网格线
  },
  timeLabel: {
    fontSize: 12,
    color: '#95A5A6',
    fontWeight: '500',
  },
  timeSlot: {
    position: 'absolute',
    left: TIME_COLUMN_WIDTH,
    right: 0,
    backgroundColor: 'transparent',
    // 去掉 zIndex: 1 避免挡住卡片，卡片会自动在它之上
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeSlotHint: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(236, 240, 241, 0.4)',
  },
  timeSlotHintText: {
    fontSize: 12,
    color: '#BDC3C7',
    fontWeight: '500',
  },
  gridLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ECF0F1',
  },
  gridLineDashed: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#F4F6F7',
    backgroundColor: 'transparent',
  },
  lessonsContainer: {
    position: 'absolute',
    top: 0,
    left: TIME_COLUMN_WIDTH,
    right: 16,
    bottom: 0,
  },
  lessonCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#E8F4F8',
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    marginVertical: 1, // 留出上下微小间距
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  lessonCardOngoing: {
    backgroundColor: '#3498DB',
    shadowColor: '#3498DB',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    transform: [{ scale: 1.02 }],
    zIndex: 100,
  },
  lessonCardDragging: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    transform: [{ scale: 1.05 }],
    opacity: 0.9,
  },
  lessonCardBorder: {
    width: 4,
    backgroundColor: '#3498DB',
  },
  lessonCardBorderOngoing: {
    backgroundColor: '#2980B9',
  },
  lessonContent: {
    flex: 1,
    padding: 8,
  },
  lessonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lessonTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34495E',
  },
  lessonStudentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonStudentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 4,
  },
  lessonDetails: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  textOngoing: {
    color: '#FFFFFF',
  },
  textOngoingMuted: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  ongoingBadge: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ongoingBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  currentTimeLineContainer: {
    position: 'absolute',
    left: -TIME_COLUMN_WIDTH,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 200,
    transform: [{ translateY: -4 }],
  },
  currentTimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
    marginLeft: TIME_COLUMN_WIDTH - 4,
  },
  currentTimeLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E74C3C',
  }
});