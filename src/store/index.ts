import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionRecord, SkillCompletion } from '../types';

interface AppState {
  skillCompletion: SkillCompletion;
  sessionRecords: SessionRecord[];
  isCoachMode: boolean;
  
  // Actions
  toggleCoachMode: () => void;
  toggleSkillCompletion: (skillId: string) => void;
  isSkillCompleted: (skillId: string) => boolean;
  addSessionRecord: (recordData: Omit<SessionRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSessionRecord: (id: string, recordData: Partial<Omit<SessionRecord, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteSessionRecord: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      skillCompletion: {},
      sessionRecords: [],
      isCoachMode: false,

      toggleCoachMode: () => set((state) => ({ isCoachMode: !state.isCoachMode })),

      toggleSkillCompletion: (skillId) => set((state) => ({
        skillCompletion: {
          ...state.skillCompletion,
          [skillId]: !state.skillCompletion[skillId],
        },
      })),

      isSkillCompleted: (skillId) => {
        return !!get().skillCompletion[skillId];
      },

      addSessionRecord: (recordData) => {
        const now = new Date().toISOString();
        const newRecord: SessionRecord = {
          ...recordData,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          sessionRecords: [newRecord, ...state.sessionRecords],
        }));
      },

      updateSessionRecord: (id, recordData) => {
        const now = new Date().toISOString();
        set((state) => ({
          sessionRecords: state.sessionRecords.map((record) =>
            record.id === id ? { ...record, ...recordData, updatedAt: now } : record
          ),
        }));
      },

      deleteSessionRecord: (id) => set((state) => ({
        sessionRecords: state.sessionRecords.filter((record) => record.id !== id),
      })),
    }),
    {
      name: 'tennis-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
