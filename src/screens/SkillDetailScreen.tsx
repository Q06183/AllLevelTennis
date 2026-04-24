import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Button, KeyboardAvoidingView, Platform, Image, Modal } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { CheckSquare, Square, ArrowLeft, Star, ChevronDown, ChevronRight, AlertCircle, Dumbbell, X } from 'lucide-react-native';

import { skills, drills } from '../data/mockData';
import { useStore } from '../store';
import { SkillsStackParamList } from '../navigation/types';

type DetailRouteProp = RouteProp<SkillsStackParamList, 'SkillDetail'>;

import { useHeaderHeight } from '@react-navigation/elements';

// Component to handle individual pain point rendering with local expanded state
const PainPointCard = ({ painPoint }: { painPoint: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const recommendedDrills = painPoint.recommendedDrillIds.map((id: string) => drills.find(d => d.id === id)).filter(Boolean);

  return (
    <View style={styles.painPointCard}>
      <TouchableOpacity 
        style={styles.painPointHeader}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.painPointTitleContainer}>
          <AlertCircle color="#E74C3C" size={18} style={styles.painPointIcon} />
          <Text style={styles.painPointTitle}>{painPoint.description}</Text>
        </View>
        {isExpanded ? (
          <ChevronDown color="#7F8C8D" size={20} />
        ) : (
          <ChevronRight color="#7F8C8D" size={20} />
        )}
      </TouchableOpacity>
      
      {isExpanded && recommendedDrills.length > 0 ? (
        <View style={styles.drillsContainer}>
          <Text style={styles.drillsHeader}>推荐练习处方 (Drills)：</Text>
          {recommendedDrills.map((drill: any) => (
            <View key={drill.id} style={styles.drillItem}>
              <View style={styles.drillHeader}>
                <Dumbbell color="#3498DB" size={16} style={styles.drillIcon} />
                <Text style={styles.drillName}>{drill.name}</Text>
              </View>
              <Text style={styles.drillDescription}>{drill.description}</Text>
              {drill.steps.map((step: string, index: number) => (
                <View key={index} style={styles.drillStep}>
                  <Text style={styles.drillStepNumber}>{index + 1}.</Text>
                  <Text style={styles.drillStepText}>{step}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default function SkillDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation();
  const { skillId } = route.params;
  const headerHeight = useHeaderHeight();
  
  const skill = skills.find(s => s.id === skillId);
  const { skillCompletion, toggleSkillCompletion, sessionRecords, notes, addNote } = useStore();
  const isCompleted = !!skillCompletion[skillId];
  
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [viewerKey, setViewerKey] = useState(0);
  const [newNote, setNewNote] = useState('');

  const openImageViewer = () => {
    setViewerKey(prev => prev + 1);
    setIsImageViewVisible(true);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNote({ skillId, content: newNote.trim() });
      setNewNote('');
    }
  };

  if (!skill) {
    return (
      <View style={styles.centerContainer}>
        <Text>Skill not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const skillRecords = sessionRecords.filter(r => r.focusSkillIds.includes(skillId));

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'position' : undefined}
      contentContainerStyle={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#2C3E50" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>技能详情</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.skillName}>{skill.name}</Text>
              <Text style={styles.skillCategory}>{skill.category}</Text>
            </View>
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => toggleSkillCompletion(skillId)}
            >
              {isCompleted ? (
                <CheckSquare color="#27AE60" size={28} />
              ) : (
                <Square color="#95A5A6" size={28} />
              )}
            </TouchableOpacity>
          </View>

          {skill.imageSource && (
            <>
              <TouchableOpacity activeOpacity={0.9} onPress={openImageViewer}>
                <Image 
                  source={skill.imageSource} 
                  style={styles.skillImage} 
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <Modal visible={isImageViewVisible} transparent={true} onRequestClose={() => setIsImageViewVisible(false)}>
                <ImageViewer
                  key={viewerKey}
                  imageUrls={[{ url: '', props: { source: skill.imageSource } }]}
                  index={0}
                  enableSwipeDown={false}
                  backgroundColor="#FFFFFF"
                  renderIndicator={() => <View />} // 隐藏页码
                />
                <View style={styles.viewerCustomCloseContainer}>
                  <TouchableOpacity 
                    style={styles.viewerCustomCloseButton}
                    onPress={() => setIsImageViewVisible(false)}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    {/* 模拟网球的两条白色曲线缝线 */}
                    <View style={styles.tennisLineLeft} />
                    <View style={styles.tennisLineRight} />
                    {/* 关闭图标 */}
                    <X color="#2C3E50" size={24} style={{ zIndex: 10 }} />
                  </TouchableOpacity>
                </View>
              </Modal>
            </>
          )}

          <Text style={styles.description}>{skill.description}</Text>

          <View style={styles.difficultyContainer}>
            <Text style={styles.sectionTitle}>难度：</Text>
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={18} 
                color={i < skill.difficulty ? '#F1C40F' : '#ECF0F1'} 
                fill={i < skill.difficulty ? '#F1C40F' : 'transparent'} 
              />
            ))}
          </View>

          <Text style={styles.sectionTitle}>技术要点：</Text>
          {skill.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
          
          {skill.painPoints && skill.painPoints.length > 0 ? (
            <View style={styles.painPointsSection}>
              <Text style={styles.sectionTitle}>常见痛点与练习：</Text>
              {skill.painPoints.map((pp, index) => (
                <PainPointCard key={pp.id || index} painPoint={pp} />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>添加技能备忘录</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="记录你的学习心得和技巧..."
            value={newNote}
            onChangeText={setNewNote}
          />
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddNote}
          >
            <Text style={styles.addButtonText}>保存备忘录</Text>
          </TouchableOpacity>
        </View>

        {(notes || []).filter(n => n.skillId === skillId).length > 0 && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>历史备忘录 ({(notes || []).filter(n => n.skillId === skillId).length})</Text>
            {(notes || []).filter(n => n.skillId === skillId).map(note => (
              <View key={note.id} style={styles.noteCard}>
                <Text style={styles.noteDate}>
                  {new Date(note.createdAt).toLocaleString()}
                </Text>
                <Text style={styles.noteContent}>{note.content}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 训练打卡记录 */}
        {skillRecords.length > 0 && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>相关打卡记录 ({skillRecords.length})</Text>
            {skillRecords.map(record => (
              <View key={record.id} style={styles.noteCard}>
                <Text style={styles.noteDate}>
                  {new Date(record.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.noteContent}>时长: {record.duration}小时</Text>
                {record.notes ? (
                  <Text style={styles.noteContent}>{record.notes}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    paddingTop: 50, // for SafeArea manually if not handled
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  content: {
    padding: 16,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  skillName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  skillCategory: {
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: '#3498DB',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  skillImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#ECF0F1',
  },
  checkbox: {
    padding: 4,
  },
  description: {
    fontSize: 16,
    color: '#34495E',
    marginBottom: 16,
    lineHeight: 24,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3498DB',
    marginTop: 8,
    marginRight: 8,
  },
  tipText: {
    fontSize: 15,
    color: '#34495E',
    flex: 1,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ECF0F1',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
    fontSize: 15,
    color: '#2C3E50',
  },
  addButton: {
    backgroundColor: '#27AE60',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notesSection: {
    marginBottom: 16,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  noteDate: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 15,
    color: '#34495E',
    lineHeight: 22,
  },
  painPointsSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingTop: 16,
  },
  painPointCard: {
    backgroundColor: '#FDF2E9',
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
    overflow: 'hidden',
  },
  painPointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  painPointTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  painPointIcon: {
    marginRight: 8,
  },
  painPointTitle: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: 'bold',
    flex: 1,
  },
  drillsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#FDF2E9',
  },
  drillsHeader: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  drillItem: {
    backgroundColor: '#F5F7FA',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  drillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  drillIcon: {
    marginRight: 6,
  },
  drillName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3498DB',
  },
  drillDescription: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  drillStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  drillStepNumber: {
    fontSize: 13,
    color: '#34495E',
    fontWeight: 'bold',
    width: 16,
  },
  drillStepText: {
    fontSize: 13,
    color: '#34495E',
    flex: 1,
  },
  viewerCustomCloseContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
  },
  viewerCustomCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DFFF00', // 网球荧光黄
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E6E6E6', // 淡淡的边缘光泽
    overflow: 'hidden', // 限制白线不要超出圆形
  },
  tennisLineLeft: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    left: -15,
    top: 7,
  },
  tennisLineRight: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    right: -15,
    top: 7,
  }
});
