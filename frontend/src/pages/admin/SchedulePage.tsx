import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, Eye, Plus, Filter, ChevronDown } from 'lucide-react';
import api from '../../utils/api';
import { Schedule, Lesson, Group, DAYS, TIME_SLOTS, LESSON_COLORS, LessonType, DayOfWeek } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('MONDAY');
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedulesRes, groupsRes] = await Promise.all([
          api.get('/schedules'),
          api.get('/groups'),
        ]);
        setSchedules(schedulesRes.data.data);
        setGroups(groupsRes.data.data);

        if (schedulesRes.data.data.length > 0) {
          const firstSchedule = schedulesRes.data.data[0];
          setSelectedSchedule(firstSchedule);
          loadScheduleLessons(firstSchedule.id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const loadScheduleLessons = async (scheduleId: string, groupId?: string) => {
    try {
      const params: Record<string, string> = { scheduleId };
      if (groupId) params.groupId = groupId;

      if (user?.role === 'STUDENT' && user.student?.groupId) {
        params.groupId = user.student.groupId;
      }

      if (user?.role === 'TEACHER' && user.teacher?.id) {
        params.teacherId = user.teacher.id;
      }

      const { data } = await api.get('/lessons', { params });
      setLessons(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleScheduleChange = (scheduleId: string) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (schedule) {
      setSelectedSchedule(schedule);
      loadScheduleLessons(scheduleId, selectedGroup || undefined);
    }
  };

  const handleGroupFilter = (groupId: string) => {
    setSelectedGroup(groupId);
    if (selectedSchedule) {
      loadScheduleLessons(selectedSchedule.id, groupId || undefined);
    }
  };

  const getLessonForSlot = (day: DayOfWeek, slotNum: number): Lesson | undefined => {
    return lessons.find((l) => l.dayOfWeek === day && l.lessonNumber === slotNum);
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="h-96" />;
  }

  if (schedules.length === 0) {
    return (
      <div className="page-transition">
        <EmptyState
          icon={<Calendar className="h-10 w-10 text-gray-400" />}
          title={t('common.noData')}
          description="No schedules available yet"
          action={
            user?.role === 'ADMIN' ? (
              <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4" />
                {t('schedule.createSchedule')}
              </button>
            ) : undefined
          }
        />
      </div>
    );
  }

  const displayDays = viewMode === 'day' ? [selectedDay] : DAYS;

  return (
    <div className="page-transition space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('schedule.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {selectedSchedule?.name}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View mode toggle */}
          <div className="flex rounded-xl bg-gray-100 dark:bg-slate-800 p-1">
            {(['week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  viewMode === mode
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-slate-400'
                )}
              >
                {t(`schedule.${mode}View`)}
              </button>
            ))}
          </div>

          {viewMode === 'day' && (
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
              className="input-field w-auto text-sm"
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>{t(`days.${day}`)}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={selectedSchedule?.id || ''}
          onChange={(e) => handleScheduleChange(e.target.value)}
          className="input-field w-auto text-sm"
        >
          {schedules.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {user?.role === 'ADMIN' && (
          <select
            value={selectedGroup}
            onChange={(e) => handleGroupFilter(e.target.value)}
            className="input-field w-auto text-sm"
          >
            <option value="">{t('common.all')} {t('common.groups').toLowerCase()}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Timetable grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase w-24">
                  {t('schedule.timeSlot')}
                </th>
                {displayDays.map((day) => (
                  <th key={day} className="py-3 px-2 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                    <span className="hidden md:inline">{t(`days.${day}`)}</span>
                    <span className="md:hidden">{t(`daysShort.${day}`)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot) => (
                <tr key={slot.num} className="border-b border-gray-100 dark:border-slate-800 last:border-0">
                  <td className="py-2 px-4 align-top">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{slot.num}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">{slot.start}–{slot.end}</div>
                  </td>
                  {displayDays.map((day) => {
                    const lesson = getLessonForSlot(day, slot.num);
                    return (
                      <td key={`${day}-${slot.num}`} className="py-1.5 px-1.5 align-top">
                        {lesson ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(
                              'p-2.5 rounded-xl border text-xs cursor-pointer hover:shadow-md transition-all',
                              LESSON_COLORS[lesson.type as LessonType],
                              lesson.subject.color && `border-l-4`
                            )}
                            style={lesson.subject.color ? { borderLeftColor: lesson.subject.color } : undefined}
                          >
                            <p className="font-semibold truncate">{lesson.subject.name}</p>
                            <p className="text-[11px] opacity-80 mt-0.5">
                              {lesson.teacher.user.lastName} {lesson.teacher.user.firstName[0]}.
                            </p>
                            <div className="flex items-center justify-between mt-1 opacity-70">
                              <span>📍 {lesson.classroom.name}</span>
                              <span>{lesson.group.name}</span>
                            </div>
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/5 dark:bg-white/10">
                              {t(`lessonTypes.${lesson.type}`)}
                            </span>
                          </motion.div>
                        ) : (
                          <div className="h-20 rounded-xl border border-dashed border-gray-200 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800/30" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-2">
        {Object.entries(LESSON_COLORS).map(([type, classes]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs">
            <div className={cn('w-3 h-3 rounded', classes.split(' ')[0])} />
            <span className="text-gray-600 dark:text-slate-400">{t(`lessonTypes.${type}`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
