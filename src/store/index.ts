import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note, SkillCompletion } from '../types';

interface AppState {
  skillCompletion: SkillCompletion;
  notes: Note[];
  
  // Actions
  toggleSkillCompletion: (skillId: string) => void;
  isSkillCompleted: (skillId: string) => boolean;
  addNote: (noteData: { skillId: string; content: string }) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      skillCompletion: {},
      notes: [],

      toggleSkillCompletion: (skillId) => set((state) => ({
        skillCompletion: {
          ...state.skillCompletion,
          [skillId]: !state.skillCompletion[skillId],
        },
      })),

      isSkillCompleted: (skillId) => {
        return !!get().skillCompletion[skillId];
      },

      addNote: ({ skillId, content }) => {
        const now = new Date().toISOString();
        const newNote: Note = {
          id: Math.random().toString(36).substring(2, 9),
          skillId,
          content,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          notes: [newNote, ...state.notes],
        }));
      },

      updateNote: (id, content) => {
        const now = new Date().toISOString();
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, content, updatedAt: now } : note
          ),
        }));
      },

      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
      })),
    }),
    {
      name: 'tennis-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
