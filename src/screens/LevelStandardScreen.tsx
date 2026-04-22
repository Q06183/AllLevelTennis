import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckSquare, Square, ChevronDown, ChevronRight } from 'lucide-react-native';

import { levels, skills } from '../data/mockData';
import { useStore } from '../store';
import { LevelStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<LevelStackParamList, 'LevelStandard'>;

// Component to handle individual level rendering with local expanded state
const LevelCard = ({ 
  level, 
  index, 
  skillCompletion, 
  toggleSkillCompletion, 
  handleSkillPress 
}: { 
  level: typeof levels[0]; 
  index: number;
  skillCompletion: Record<string, boolean>;
  toggleSkillCompletion: (id: string) => void;
  handleSkillPress: (id: string) => void;
}) => {
  const [isMasteredExpanded, setIsMasteredExpanded] = useState(false);

  const totalSkills = level.skills.length;
  const completedSkills = level.skills.filter(id => skillCompletion[id]).length;
  const progress = totalSkills === 0 ? 0 : (completedSkills / totalSkills) * 100;
  
  // Calculate new skills introduced in this level compared to the previous level
  const previousLevelSkills = index > 0 ? levels[index - 1].skills : [];
  const newSkillsInThisLevel = level.skills.filter(skillId => !previousLevelSkills.includes(skillId));

  const renderSkillItem = (skillId: string, isMasteredItem: boolean = false) => {
    const skill = skills.find(s => s.id === skillId);
    const isCompleted = !!skillCompletion[skillId];

    if (!skill) return null;

    return (
      <View key={skillId} style={[styles.skillItem, isMasteredItem && styles.masteredSkillItem]}>
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={() => toggleSkillCompletion(skillId)}
        >
          {isCompleted ? (
            <CheckSquare color="#27AE60" size={20} />
          ) : (
            <Square color="#95A5A6" size={20} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.skillNameContainer}
          onPress={() => handleSkillPress(skillId)}
        >
          <View style={styles.skillNameWrapper}>
            <Text style={[
              styles.skillName,
              isCompleted && styles.skillNameCompleted
            ]}>
              {skill.name}
            </Text>
          </View>
          <Text style={styles.skillCategory}>{skill.category}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.levelTitle}>{level.id} - {level.name}</Text>
        <Text style={styles.progressText}>{completedSkills}/{totalSkills}</Text>
      </View>
      
      <Text style={styles.description}>{level.description}</Text>
      
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <View style={styles.skillsList}>
        {/* Render mastered/previous skills collapsible section if there are any */}
        {previousLevelSkills.length > 0 && (
          <View style={styles.masteredSection}>
            <TouchableOpacity 
              style={styles.masteredHeader}
              onPress={() => setIsMasteredExpanded(!isMasteredExpanded)}
            >
              <Text style={styles.masteredTitle}>
                已掌握的技能 ({previousLevelSkills.length})
              </Text>
              {isMasteredExpanded ? (
                <ChevronDown color="#7F8C8D" size={20} />
              ) : (
                <ChevronRight color="#7F8C8D" size={20} />
              )}
            </TouchableOpacity>
            
            {isMasteredExpanded && (
              <View style={styles.masteredList}>
                {previousLevelSkills.map(skillId => renderSkillItem(skillId, true))}
              </View>
            )}
          </View>
        )}

        {/* Render new skills for this level */}
        {newSkillsInThisLevel.length > 0 && (
          <View style={styles.newSkillsSection}>
            <Text style={styles.newSkillsSectionTitle}>进阶需要掌握的新技能：</Text>
            {newSkillsInThisLevel.map(skillId => renderSkillItem(skillId))}
          </View>
        )}
      </View>
    </View>
  );
};

export default function LevelStandardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { skillCompletion, toggleSkillCompletion } = useStore();
  const flatListRef = useRef<FlatList>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  const handleSkillPress = (skillId: string) => {
    navigation.navigate('SkillDetail', { skillId });
  };

  // Find the first level that is not fully completed
  const activeLevelIndex = levels.findIndex(level => {
    const completed = level.skills.filter(id => skillCompletion[id]).length;
    return completed < level.skills.length;
  });

  const handleLayout = () => {
    if (!hasScrolled && activeLevelIndex > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ 
          index: activeLevelIndex, 
          animated: true, 
          viewPosition: 0.5 
        });
        setHasScrolled(true);
      }, 500); // Small delay to ensure rendering is complete
    }
  };

  const renderLevel = ({ item: level, index }: { item: typeof levels[0], index: number }) => {
    return (
      <LevelCard 
        level={level} 
        index={index} 
        skillCompletion={skillCompletion}
        toggleSkillCompletion={toggleSkillCompletion}
        handleSkillPress={handleSkillPress}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={levels}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.header}>网球水平标准 (1.0 - 5.0)</Text>}
        ListFooterComponent={<View style={{ height: 40 }} />}
        renderItem={renderLevel}
        onLayout={handleLayout}
        initialNumToRender={10}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.5 });
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 12,
    lineHeight: 20,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3498DB',
  },
  skillsList: {
    marginTop: 8,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  checkbox: {
    marginRight: 12,
    padding: 4,
  },
  skillNameContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillName: {
    fontSize: 16,
    color: '#2C3E50',
  },
  skillNameCompleted: {
    color: '#7F8C8D',
    textDecorationLine: 'line-through',
  },
  skillNameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  newBadge: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  skillCategory: {
    fontSize: 12,
    color: '#FFFFFF',
    backgroundColor: '#95A5A6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  masteredSection: {
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: '#F8F9F9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  masteredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  masteredTitle: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  masteredList: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  masteredSkillItem: {
    opacity: 0.8,
    borderBottomWidth: 0,
    paddingVertical: 6,
  },
  newSkillsSection: {
    marginTop: 4,
  },
  newSkillsSectionTitle: {
    fontSize: 14,
    color: '#34495E',
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 4,
  }
});
