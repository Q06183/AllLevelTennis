import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudentProfile, LessonPlan, SkillAssessment } from '../types';

interface CoachState {
  students: StudentProfile[];
  lessonPlans: LessonPlan[];
  
  // Student Actions
  addStudent: (student: Omit<StudentProfile, 'id' | 'assessments'>) => void;
  updateStudent: (id: string, updates: Partial<StudentProfile>) => void;
  deleteStudent: (id: string) => void;
  
  // Assessment Actions
  updateSkillAssessment: (studentId: string, skillId: string, assessment: Partial<SkillAssessment>) => void;
  
  // Lesson Plan Actions
  addLessonPlan: (plan: Omit<LessonPlan, 'id'>) => void;
  updateLessonPlan: (id: string, updates: Partial<LessonPlan>) => void;
  deleteLessonPlan: (id: string) => void;
}

export const useCoachStore = create<CoachState>()(
  persist(
    (set) => ({
      students: [],
      lessonPlans: [],

      addStudent: (studentData) => set((state) => ({
        students: [
          ...state.students,
          {
            ...studentData,
            id: Date.now().toString(),
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
        students: state.students.filter(student => student.id !== id),
        lessonPlans: state.lessonPlans.filter(plan => plan.studentId !== id)
      })),

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
    }),
    {
      name: 'all-level-tennis-coach-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
