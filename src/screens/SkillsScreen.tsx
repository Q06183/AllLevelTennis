import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Star } from 'lucide-react-native';

import { skills } from '../data/mockData';
import { SkillsStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<SkillsStackParamList, 'SkillsList'>;

export default function SkillsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const groupedSkills = useMemo(() => {
    return skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, typeof skills>);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>网球技能库</Text>
      
      {Object.entries(groupedSkills).map(([category, categorySkills]) => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>
          
          <View style={styles.skillsGrid}>
            {categorySkills.map((skill) => (
              <TouchableOpacity 
                key={skill.id} 
                style={styles.skillCard}
                onPress={() => navigation.navigate('SkillDetail', { skillId: skill.id })}
              >
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillDesc} numberOfLines={2}>{skill.description}</Text>
                
                <View style={styles.difficultyContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      color={i < skill.difficulty ? '#F1C40F' : '#ECF0F1'} 
                      fill={i < skill.difficulty ? '#F1C40F' : 'transparent'} 
                    />
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
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
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
    paddingLeft: 8,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skillCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  skillDesc: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 8,
    lineHeight: 16,
  },
  difficultyContainer: {
    flexDirection: 'row',
    marginTop: 'auto',
  }
});
