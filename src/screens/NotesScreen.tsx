import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Trash2 } from 'lucide-react-native';

import { useStore } from '../store';
import { skills } from '../data/mockData';

export default function NotesScreen() {
  const { notes, addNote, deleteNote } = useStore();
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNote({ skillId: 'general', content: newNote.trim() });
      setNewNote('');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('删除确认', '确定要删除这条备忘录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => deleteNote(id) }
    ]);
  };

  const getSkillName = (skillId: string) => {
    if (skillId === 'general') return '通用备忘录';
    const skill = skills.find(s => s.id === skillId);
    return skill ? `技能: ${skill.name}` : '未知技能';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>我的备忘录</Text>

      <View style={styles.addNoteCard}>
        <Text style={styles.sectionTitle}>添加通用备忘录</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="记录今天训练的心得和技巧..."
          value={newNote}
          onChangeText={setNewNote}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddNote}>
          <Text style={styles.addButtonText}>保存备忘录</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.notesList}>
        <Text style={styles.sectionTitle}>所有记录 ({notes.length})</Text>
        
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>暂无记录，开始添加你的第一条备忘录吧！</Text>
          </View>
        ) : (
          notes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <View style={styles.badgeContainer}>
                  <Text style={styles.skillBadge}>{getSkillName(note.skillId)}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(note.id)} style={styles.deleteButton}>
                  <Trash2 color="#E74C3C" size={18} />
                </TouchableOpacity>
              </View>
              <Text style={styles.noteContent}>{note.content}</Text>
              <Text style={styles.noteDate}>
                {new Date(note.createdAt).toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </View>
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
  addNoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
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
    backgroundColor: '#3498DB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notesList: {
    marginBottom: 16,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyStateText: {
    color: '#7F8C8D',
    fontSize: 15,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeContainer: {
    backgroundColor: '#ECF0F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillBadge: {
    fontSize: 12,
    color: '#34495E',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  noteContent: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 22,
    marginBottom: 12,
  },
  noteDate: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'right',
  }
});
