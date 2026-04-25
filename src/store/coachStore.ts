import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudentProfile, LessonPlan, SkillAssessment, LongTermPlan } from '../types';

interface CoachState {
  students: StudentProfile[];
  lessonPlans: LessonPlan[];
  longTermPlans: LongTermPlan[];
  
  // Student Actions
  addStudent: (student: Omit<StudentProfile, 'id' | 'assessments'> & { id?: string }) => void;
  updateStudent: (id: string, updates: Partial<StudentProfile>) => void;
  deleteStudent: (id: string) => void; // 软删除，放入回收站
  restoreStudent: (id: string) => void; // 从回收站恢复
  permanentlyDeleteStudent: (id: string) => void; // 彻底删除
  cleanupRecycleBin: () => void; // 清理超过30天的回收站数据
  
  // Assessment Actions
  updateSkillAssessment: (studentId: string, skillId: string, assessment: Partial<SkillAssessment>) => void;
  
  // Lesson Plan Actions
  addLessonPlan: (plan: Omit<LessonPlan, 'id'>) => void;
  updateLessonPlan: (id: string, plan: Partial<LessonPlan>) => void;
  deleteLessonPlan: (id: string) => void;
  
  // Long Term Plan Actions
  addLongTermPlan: (plan: Omit<LongTermPlan, 'id' | 'createdAt'>) => void;
  updateLongTermPlan: (id: string, updates: Partial<LongTermPlan>) => void;
  deleteLongTermPlan: (id: string) => void;
}

export const useCoachStore = create<CoachState>()(
  persist(
    (set) => ({
      students: [],
      lessonPlans: [],
      longTermPlans: [],

      addStudent: (studentData) => set((state) => ({
        students: [
          ...state.students,
          {
            ...studentData,
            id: studentData.id || Date.now().toString(),
            assessments: {},
          }
        ]
      })),

      updateStudent: (id, updates) => set((state) => ({
        students: state.students.map(student => 
          student.id === id ? { ...student, ...updates } : student
        )
      })),

      deleteStudent: (id) => set((state) => ({
        students: state.students.map(student => 
          student.id === id ? { ...student, deletedAt: Date.now() } : student
        )
      })),

      restoreStudent: (id) => set((state) => ({
        students: state.students.map(student => {
          if (student.id === id) {
            const { deletedAt, ...rest } = student;
            return rest;
          }
          return student;
        })
      })),

      permanentlyDeleteStudent: (id) => set((state) => ({
        students: state.students.filter(student => student.id !== id),
        lessonPlans: state.lessonPlans.filter(plan => plan.studentId !== id),
        longTermPlans: state.longTermPlans.filter(plan => plan.studentId !== id)
      })),

      cleanupRecycleBin: () => set((state) => {
        const now = Date.now();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        
        // Find IDs to permanently delete (older than 30 days)
        const idsToDelete = state.students
          .filter(s => s.deletedAt && (now - s.deletedAt) > thirtyDaysMs)
          .map(s => s.id);
          
        if (idsToDelete.length === 0) return state;

        return {
          students: state.students.filter(s => !idsToDelete.includes(s.id)),
          lessonPlans: state.lessonPlans.filter(plan => !idsToDelete.includes(plan.studentId || '')),
          longTermPlans: state.longTermPlans.filter(plan => !idsToDelete.includes(plan.studentId))
        };
      }),

      updateSkillAssessment: (studentId, skillId, assessmentUpdates) => set((state) => {
        return {
          students: state.students.map(student => {
            if (student.id !== studentId) return student;
            
            const currentAssessment = student.assessments[skillId] || { skillId, completed: false, painPointIds: [] };
            
            return {
              ...student,
              assessments: {
                ...student.assessments,
                [skillId]: { ...currentAssessment, ...assessmentUpdates }
              }
            };
          })
        };
      }),

      addLessonPlan: (planData) => set((state) => {
        const newPlan = {
          ...planData,
          id: Date.now().toString()
        };
        
        // Also update the student's lastLessonDate
        const updatedStudents = state.students.map(student => 
          student.id === planData.studentId 
            ? { ...student, lastLessonDate: planData.date }
            : student
        );

        return {
          lessonPlans: [...state.lessonPlans, newPlan],
          students: updatedStudents
        };
      }),

      updateLessonPlan: (id, updates) => set((state) => ({
        lessonPlans: state.lessonPlans.map(plan => 
          plan.id === id ? { ...plan, ...updates } : plan
        )
      })),

      deleteLessonPlan: (id) => set((state) => ({
        lessonPlans: state.lessonPlans.filter(plan => plan.id !== id)
      })),

      addLongTermPlan: (planData) => set((state) => {
        const newPlan: LongTermPlan = {
          ...planData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        return {
          longTermPlans: [...state.longTermPlans, newPlan]
        };
      }),

      updateLongTermPlan: (id, updates) => set((state) => ({
        longTermPlans: state.longTermPlans.map(plan => 
          plan.id === id ? { ...plan, ...updates } : plan
        )
      })),

      deleteLongTermPlan: (id) => set((state) => ({
        longTermPlans: state.longTermPlans.filter(plan => plan.id !== id)
      })),
    }),
    {
      name: 'all-level-tennis-coach-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
