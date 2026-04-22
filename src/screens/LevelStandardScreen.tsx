import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CheckSquare, Square } from 'lucide-react-native';

import { levels, skills } from '../data/mockData';
import { useStore } from '../store';
import { RootTabParamList } from '../navigation/types';

type NavigationProp = BottomTabNavigationProp<RootTabParamList, 'LevelStandard'>;

export default function LevelStandardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { skillCompletion, toggleSkillCompletion } = useStore();

  const handleSkillPress = (skillId: string) => {
    navigation.navigate('SkillsTab', {
      screen: 'SkillDetail',
      params: { skillId },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>网球水平标准 (1.0 - 5.0)</Text>
      
      {levels.map((level) => {
        const totalSkills = level.skills.length;
        const completedSkills = level.skills.filter(id => skillCompletion[id]).length;
        const progress = totalSkills === 0 ? 0 : (completedSkills / totalSkills) * 100;

        return (
          <View key={level.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.levelTitle}>{level.id} - {level.name}</Text>
              <Text style={styles.progressText}>{completedSkills}/{totalSkills}</Text>
            </View>
            
            <Text style={styles.description}>{level.description}</Text>
            
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>

            <View style={styles.skillsList}>
              {level.skills.map((skillId) => {
                const skill = skills.find(s => s.id === skillId);
                const isCompleted = !!skillCompletion[skillId];

                if (!skill) return null;

                return (
                  <View key={skillId} style={styles.skillItem}>
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
                      <Text style={[
                        styles.skillName,
                        isCompleted && styles.skillNameCompleted
                      ]}>
                        {skill.name}
                      </Text>
                      <Text style={styles.skillCategory}>{skill.category}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
      <View style={{ height: 40 }} />
    </ScrollView>
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
  skillCategory: {
    fontSize: 12,
    color: '#FFFFFF',
    backgroundColor: '#95A5A6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  }
});
