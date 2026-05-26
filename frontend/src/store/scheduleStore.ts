import { create } from 'zustand';
import api from '../utils/api';
import { Schedule, Lesson, DayOfWeek } from '../types';

type ViewMode = 'week' | 'day' | 'month';

interface ScheduleState {
  schedules: Schedule[];
  currentSchedule: Schedule | null;
  lessons: Lesson[];
  viewMode: ViewMode;
  selectedDay: DayOfWeek | null;
  isLoading: boolean;
  fetchSchedules: (params?: Record<string, string>) => Promise<void>;
  fetchScheduleById: (id: string) => Promise<void>;
  createSchedule: (data: Partial<Schedule>) => Promise<void>;
  updateSchedule: (id: string, data: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  fetchLessons: (params?: Record<string, string>) => Promise<void>;
  createLesson: (data: Partial<Lesson>) => Promise<Lesson>;
  updateLesson: (id: string, data: Partial<Lesson>) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  setSelectedDay: (day: DayOfWeek | null) => void;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: [],
  currentSchedule: null,
  lessons: [],
  viewMode: 'week',
  selectedDay: null,
  isLoading: false,

  fetchSchedules: async (params) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/schedules', { params });
      set({ schedules: data.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchScheduleById: async (id: string) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/schedules/${id}`);
      set({ currentSchedule: data.data, lessons: data.data.lessons || [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createSchedule: async (scheduleData) => {
    const { data } = await api.post('/schedules', scheduleData);
    set((state) => ({ schedules: [data.data, ...state.schedules] }));
  },

  updateSchedule: async (id, scheduleData) => {
    const { data } = await api.patch(`/schedules/${id}`, scheduleData);
    set((state) => ({
      schedules: state.schedules.map((s) => (s.id === id ? data.data : s)),
      currentSchedule: state.currentSchedule?.id === id ? data.data : state.currentSchedule,
    }));
  },

  deleteSchedule: async (id) => {
    await api.delete(`/schedules/${id}`);
    set((state) => ({
      schedules: state.schedules.filter((s) => s.id !== id),
      currentSchedule: state.currentSchedule?.id === id ? null : state.currentSchedule,
    }));
  },

  fetchLessons: async (params) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/lessons', { params });
      set({ lessons: data.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createLesson: async (lessonData) => {
    const { data } = await api.post('/lessons', lessonData);
    set((state) => ({ lessons: [...state.lessons, data.data] }));
    return data.data;
  },

  updateLesson: async (id, lessonData) => {
    const { data } = await api.patch(`/lessons/${id}`, lessonData);
    set((state) => ({
      lessons: state.lessons.map((l) => (l.id === id ? data.data : l)),
    }));
  },

  deleteLesson: async (id) => {
    await api.delete(`/lessons/${id}`);
    set((state) => ({
      lessons: state.lessons.filter((l) => l.id !== id),
    }));
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedDay: (day) => set({ selectedDay: day }),
}));
