import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Star, BookOpen } from 'lucide-react-native';

import { skills } from '../data/mockData';
import { useStore } from '../store';
import { SkillsStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<SkillsStackParamList, 'SkillsList'>;

export default function SkillsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const { notes } = useStore();

  const categories = useMemo(() => {
    const cats = Array.from(new Set(skills.map(s => s.category)));
    return ['全部', ...cats];
  }, []);

  const groupedSkills = useMemo(() => {
    const filtered = selectedCategory === '全部' 
      ? skills 
      : skills.filter(s => s.category === selectedCategory);
      
    return filtered.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, typeof skills>);
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.notesManageButton} 
            onPress={() => navigation.navigate('NotesList')}
          >
            <BookOpen color="#3498DB" size={20} />
            <Text style={styles.notesManageText}>全部备忘</Text>
          </TouchableOpacity>
          <Text style={styles.header}>网球技能库</Text>
          <View style={{ width: 80 }} />
        </View>
        
        <View style={styles.filterWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {categories.map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[
                  styles.filterPill, 
                  selectedCategory === cat && styles.filterPillActive
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[
                  styles.filterText, 
                  selectedCategory === cat && styles.filterTextActive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            
            <View style={styles.skillsGrid}>
              {categorySkills.map((skill) => {
                const skillNotesCount = (notes || []).filter(n => n.skillId === skill.id).length;
                
                return (
                  <TouchableOpacity 
                    key={skill.id} 
                    style={styles.skillCard}
                    onPress={() => navigation.navigate('SkillDetail', { skillId: skill.id })}
                  >
                    <View style={styles.skillCardHeader}>
                      <Text style={styles.skillName}>{skill.name}</Text>
                      {skillNotesCount > 0 ? (
                        <View style={styles.noteBadge}>
                          <BookOpen color="#3498DB" size={12} />
                          <Text style={styles.noteBadgeText}>{skillNotesCount}</Text>
                        </View>
                      ) : null}
                    </View>
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
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerContainer: {
    paddingTop: 50, // for SafeArea manually if not handled
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  notesManageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECF0F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  notesManageText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#3498DB',
    fontWeight: 'bold',
  },
  filterWrapper: {
    marginBottom: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ECF0F1',
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
  filterPillActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  filterText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: 16,
    paddingBottom: 40,
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  skillCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  skillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  noteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECF0F1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  noteBadgeText: {
    fontSize: 10,
    color: '#3498DB',
    marginLeft: 2,
    fontWeight: 'bold',
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
