import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, PanResponder, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { User, Clock, ChevronRight } from 'lucide-react-native';

import { useCoachStore } from '../store/coachStore';
import { ScheduleStackParamList } from '../navigation/types';
import { LessonPlan } from '../types';

type NavigationProp = NativeStackNavigationProp<ScheduleStackParamList, 'ScheduleList'>;

const { width, height: screenHeight } = Dimensions.get('window');
const START_HOUR = 6;  // 日程表从早上 6 点开始
const END_HOUR = 24;   // 日程表到晚上 24 点结束
const CORE_START_HOUR = 8;
const CORE_END_HOUR = 22;
const COLLAPSED_HEIGHT = 40; // 折叠按钮的高度

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
  
  // 手动折叠状态
  const [manualMorningExpanded, setManualMorningExpanded] = useState(false);
  const [manualEveningExpanded, setManualEveningExpanded] = useState(false);

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

  // 筛选出选中日期的所有课程
  const dailyLessons = useMemo(() => {
    return lessonPlans.filter(plan => plan.date === selectedDate && plan.startTime && plan.endTime);
  }, [lessonPlans, selectedDate]);

  // 当切换日期时，重置手动展开状态
  useEffect(() => {
    setManualMorningExpanded(false);
    setManualEveningExpanded(false);
  }, [selectedDate]);

  // 动态计算是否需要展开
  const isMorningExpanded = useMemo(() => {
    const hasEarlyLessons = dailyLessons.some(l => parseTime(l.startTime)! < CORE_START_HOUR);
    return hasEarlyLessons || manualMorningExpanded;
  }, [dailyLessons, manualMorningExpanded]);

  const isEveningExpanded = useMemo(() => {
    const hasLateLessons = dailyLessons.some(l => parseTime(l.endTime)! > CORE_END_HOUR);
    return hasLateLessons || manualEveningExpanded;
  }, [dailyLessons, manualEveningExpanded]);

  // 非线性时间映射函数：将时间转换为 Y 坐标
  const getTimeY = (time: number) => {
    let y = 0;
    
    // 1. 处理早间时段
    if (isMorningExpanded) {
      if (time <= CORE_START_HOUR) return (time - START_HOUR) * HOUR_HEIGHT;
      y += (CORE_START_HOUR - START_HOUR) * HOUR_HEIGHT;
    } else {
      if (time < CORE_START_HOUR) return 0; // 在折叠按钮内部
      if (time === CORE_START_HOUR) return COLLAPSED_HEIGHT;
      y += COLLAPSED_HEIGHT;
    }

    // 2. 处理核心时段
    if (time <= CORE_END_HOUR) {
      return y + (time - CORE_START_HOUR) * HOUR_HEIGHT;
    }
    y += (CORE_END_HOUR - CORE_START_HOUR) * HOUR_HEIGHT;

    // 3. 处理晚间时段
    if (isEveningExpanded) {
      return y + (time - CORE_END_HOUR) * HOUR_HEIGHT;
    } else {
      return y; // 在晚间折叠按钮上方
    }
  };

  // 逆向映射函数：将 Y 坐标转换为时间
  const getYTime = (y: number) => {
    let currentY = 0;
    
    // 1. 早间时段
    if (isMorningExpanded) {
      const morningHeight = (CORE_START_HOUR - START_HOUR) * HOUR_HEIGHT;
      if (y <= morningHeight) return START_HOUR + y / HOUR_HEIGHT;
      currentY += morningHeight;
    } else {
      if (y <= COLLAPSED_HEIGHT) return CORE_START_HOUR; // 如果拖到折叠按钮上，吸附到 8:00
      currentY += COLLAPSED_HEIGHT;
    }

    // 2. 核心时段
    const coreHeight = (CORE_END_HOUR - CORE_START_HOUR) * HOUR_HEIGHT;
    if (y <= currentY + coreHeight) {
      return CORE_START_HOUR + (y - currentY) / HOUR_HEIGHT;
    }
    currentY += coreHeight;

    // 3. 晚间时段
    if (isEveningExpanded) {
      return CORE_END_HOUR + (y - currentY) / HOUR_HEIGHT;
    } else {
      return CORE_END_HOUR; // 如果拖到折叠区，吸附到 22:00
    }
  };

  // 自动滚动到当前时间附近（居中显示）
  // 确保每天只自动滚动一次，避免用户展开折叠区域时发生突兀的页面跳动
  const hasAutoScrolledRef = useRef<string | null>(null);

  useEffect(() => {
    // 只有选中的是今天，且今天还没执行过自动滚动时，才执行
    if (selectedDate === todayStr && currentTime >= START_HOUR && currentTime <= END_HOUR && hasAutoScrolledRef.current !== selectedDate) {
      hasAutoScrolledRef.current = selectedDate; // 标记今天已滚动

      // 计算当前时间在网格中的绝对 Y 坐标
      const currentY = getTimeY(currentTime);
      
      // 预估顶部 Header 和 Tab 栏的高度（这里假设头部高度约为 140 像素）
      const headerHeight = 140;
      // 可视区域高度
      const visibleHeight = screenHeight - headerHeight;
      
      // 目标滚动位置：使当前时间线正好在屏幕垂直居中
      const yOffset = currentY - (visibleHeight / 2);
      
      // 使用 requestAnimationFrame 确保在布局计算完成后滚动
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ 
            y: Math.max(0, yOffset), 
            animated: true 
          });
        }, 300); // 留出 300ms 给组件渲染和折叠状态计算
      });
    } else if (selectedDate !== todayStr) {
      // 切换到其他日期时重置标记，这样切回来时能重新居中
      hasAutoScrolledRef.current = null;
    }
  }, [selectedDate, currentTime]);

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : '未知学员';
  };

  const weekDays = useMemo(() => getWeekDays(), []);

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
                isSelected && styles.tabDayNameSelected,
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

    // 早间折叠按钮
    if (!isMorningExpanded) {
      lines.push(
        <TouchableOpacity 
          key="morning-btn" 
          style={[styles.collapsedBtn, { top: 0, height: COLLAPSED_HEIGHT }]} 
          onPress={() => setManualMorningExpanded(true)}
        >
          <Clock size={14} color="#7F8C8D" style={{marginRight: 6}} />
          <Text style={styles.collapsedBtnText}>点击展开早间时段 (06:00 - 08:00)</Text>
        </TouchableOpacity>
      );
    }

    const startRender = isMorningExpanded ? START_HOUR : CORE_START_HOUR;
    const endRender = isEveningExpanded ? END_HOUR : CORE_END_HOUR;

    for (let hour = startRender; hour <= endRender; hour++) {
      const top = getTimeY(hour);
      
      // 渲染整点线
      lines.push(
        <View key={`line-${hour}`} style={[styles.gridRow, { top }]} pointerEvents="none">
          <View style={styles.timeLabelContainer}>
            <Text style={styles.timeLabel}>{`${hour === 24 ? '00' : hour.toString().padStart(2, '0')}:00`}</Text>
          </View>
          <View style={styles.gridLine} />
        </View>
      );
      
      // 渲染半点虚线
      if (hour < endRender || (isEveningExpanded && hour < END_HOUR)) {
        lines.push(
          <View key={`half-${hour}`} style={[styles.gridRow, { top: getTimeY(hour + 0.5) }]} pointerEvents="none">
            <View style={styles.timeLabelContainer} />
            <View style={[styles.gridLine, styles.gridLineDashed]} />
          </View>
        );
      }

      if (hour < endRender || (isEveningExpanded && hour < END_HOUR)) {
        // 点击整点时段
        lines.push(
          <TouchableOpacity 
            key={`slot-${hour}-00`} 
            style={[styles.timeSlot, { top, height: HOUR_HEIGHT / 2 }]} 
            onPress={() => handleTimeSlotPress(hour, false)}
          >
            <View style={styles.timeSlotHint}>
              <Text style={styles.timeSlotHintText}>{`${hour.toString().padStart(2, '0')}:00 - ${hour.toString().padStart(2, '0')}:30 点击排课`}</Text>
            </View>
          </TouchableOpacity>
        );
        
        // 点击半点时段
        lines.push(
          <TouchableOpacity 
            key={`slot-${hour}-30`} 
            style={[styles.timeSlot, { top: getTimeY(hour + 0.5), height: HOUR_HEIGHT / 2 }]} 
            onPress={() => handleTimeSlotPress(hour, true)}
          >
            <View style={styles.timeSlotHint}>
              <Text style={styles.timeSlotHintText}>{`${hour.toString().padStart(2, '0')}:30 - ${(hour + 1 === 24 ? '00' : hour + 1).toString().padStart(2, '0')}:00 点击排课`}</Text>
            </View>
          </TouchableOpacity>
        );
      }
    }

    // 晚间折叠按钮
    if (!isEveningExpanded) {
      lines.push(
        <TouchableOpacity 
          key="evening-btn" 
          style={[styles.collapsedBtn, { top: getTimeY(CORE_END_HOUR), height: COLLAPSED_HEIGHT }]} 
          onPress={() => setManualEveningExpanded(true)}
        >
          <Clock size={14} color="#7F8C8D" style={{marginRight: 6}} />
          <Text style={styles.collapsedBtnText}>点击展开晚间时段 (22:00 - 24:00)</Text>
        </TouchableOpacity>
      );
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
    const endTimeStr = `${endH === 24 ? '00' : endH.toString().padStart(2, '0')}:${endM}`;
    
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
  totalColumns,
  getTimeY,
  getYTime
}: any) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [isDraggingState, setIsDraggingState] = useState(false);
  const isDraggingRef = useRef(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const hasMovedRef = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      // 只有在长按触发了拖拽模式后，才接管移动事件，否则交还给 ScrollView 滚动
      onMoveShouldSetPanResponder: () => isDraggingRef.current,
      onMoveShouldSetPanResponderCapture: () => isDraggingRef.current,
      onPanResponderGrant: (evt, gestureState) => {
        hasMovedRef.current = false;
        pan.setOffset({ x: 0, y: 0 });
        pan.setValue({ x: 0, y: 0 });

        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        longPressTimer.current = setTimeout(() => {
          if (!hasMovedRef.current) {
            isDraggingRef.current = true;
            setIsDraggingState(true);
            scrollViewRef.current?.setNativeProps({ scrollEnabled: false });
          }
        }, 300); // 300ms 长按触发拖拽
      },
      onPanResponderMove: (evt, gestureState) => {
        if (Math.abs(gestureState.dy) > 5 || Math.abs(gestureState.dx) > 5) {
          hasMovedRef.current = true;
        }
        if (isDraggingRef.current) {
          pan.setValue({ x: 0, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        
        const totalDy = gestureState.dy;

        // 如果没有进入拖拽状态，且移动距离很小，且确实没有触发过大幅度移动 -> 认为是点击
        if (!isDraggingRef.current && Math.abs(totalDy) <= 5 && !hasMovedRef.current) {
          navigation.navigate('LessonPlanEdit', { 
            studentId: lesson.studentId, 
            lessonPlanId: lesson.id 
          });
        } 
        // 否则如果是从拖拽状态释放
        else if (isDraggingRef.current) {
          const newTop = top + totalDy;
          const newStartHourRaw = getYTime(newTop);
          const snappedStartHour = Math.round(newStartHourRaw * 4) / 4;
          
          const duration = lesson.end - lesson.start;
          const finalStartHour = Math.max(START_HOUR, Math.min(END_HOUR - duration, snappedStartHour));
          const finalEndHour = finalStartHour + duration;
          
          const newStartTime = formatTime(finalStartHour);
          const newEndTime = formatTime(finalEndHour);
          
          if (lesson.startTime !== newStartTime || lesson.endTime !== newEndTime) {
            updateLessonPlan(lesson.id, {
              startTime: newStartTime,
              endTime: newEndTime
            });
          }
        }
        
        isDraggingRef.current = false;
        setIsDraggingState(false);
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
        isDraggingRef.current = false;
        setIsDraggingState(false);
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

  const displayName = lesson.studentName || (lesson.studentId ? getStudentName(lesson.studentId) : '未知学员');

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: top,
        left: leftOffset,
        width: cardWidth - 2,
        height,
        zIndex: isDraggingState ? 1000 : 10,
        transform: [{ translateY: pan.y }]
      }}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.lessonCard,
          { top: 0, left: 0, width: '100%', height: '100%' },
          isOngoing && styles.lessonCardOngoing,
          isDraggingState && styles.lessonCardDragging
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
      // Calculate position and height using non-linear mapping
      const startRenderTime = Math.max(lesson.start, START_HOUR);
      const endRenderTime = Math.min(lesson.end, END_HOUR);
      const top = getTimeY(startRenderTime);
      const height = Math.max(0, Math.max(getTimeY(endRenderTime) - top, 0));
      
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
          getTimeY={getTimeY}
          getYTime={getYTime}
        />
      );
    });
  };

  // 渲染当前时间线
  const renderCurrentTimeLine = () => {
    if (selectedDate !== todayStr) return null;
    if (currentTime < START_HOUR || currentTime > END_HOUR) return null;

    // 不在折叠区渲染时间线
    if (!isMorningExpanded && currentTime < CORE_START_HOUR) return null;
    if (!isEveningExpanded && currentTime > CORE_END_HOUR) return null;

    const top = getTimeY(currentTime);

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
        contentContainerStyle={{ height: getTimeY(isEveningExpanded ? END_HOUR : CORE_END_HOUR) + (isEveningExpanded ? 0 : COLLAPSED_HEIGHT) + 40 }}
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
  tabDayNameSelected: {
    color: '#3498DB',
    fontWeight: 'bold',
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
  },
  collapsedBtn: {
    position: 'absolute',
    left: TIME_COLUMN_WIDTH,
    right: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E8EB',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  collapsedBtnText: {
    color: '#7F8C8D',
    fontSize: 13,
    fontWeight: '500',
  }
});