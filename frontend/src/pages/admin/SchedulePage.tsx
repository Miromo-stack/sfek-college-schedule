import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import { Schedule, Lesson, Group, Subject, Classroom, DAYS, TIME_SLOTS, LESSON_COLORS, LessonType, DayOfWeek } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

function translateScheduleName(name: string, t: (key: string) => string): string {
  const match = name.match(/^(.+?)\s*-\s*(\S+)\s+(\d{4})$/);
  if (!match) return name;
  const season = match[2].toLowerCase();
  const year = match[3];
  const seasonKey = season === 'весна' || season === 'spring' ? 'spring' : 'fall';
  return `${t('schedule.mainSchedule')} - ${t(`schedule.${seasonKey}`)} ${year}`;
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('MONDAY');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const canEdit = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  // Form state for edit/create
  const [formData, setFormData] = useState({
    subjectId: '',
    classroomId: '',
    groupId: '',
    dayOfWeek: 'MONDAY' as DayOfWeek,
    lessonNumber: 1,
    type: 'PRACTICE' as LessonType,
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = [api.get('/schedules'), api.get('/groups')];
        if (canEdit) {
          requests.push(api.get('/subjects'), api.get('/classrooms'));
        }
        const results = await Promise.all(requests);
        setSchedules(results[0].data.data);
        setGroups(results[1].data.data);
        if (canEdit) {
          setSubjects(results[2].data.data);
          setClassrooms(results[3].data.data);
        }

        if (results[0].data.data.length > 0) {
          const firstSchedule = results[0].data.data[0];
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

  const getLessonsForSlot = (day: DayOfWeek, slotNum: number): Lesson[] => {
    return lessons.filter((l) => l.dayOfWeek === day && l.lessonNumber === slotNum);
  };

  const getTimeForSlot = (slotNum: number) => {
    const slot = TIME_SLOTS.find((s) => s.num === slotNum);
    return slot ? { start: slot.start, end: slot.end } : { start: '', end: '' };
  };

  const handleEditLesson = (lesson: Lesson) => {
    if (!canEdit) return;
    if (user?.role === 'TEACHER' && user.teacher?.id !== lesson.teacherId) return;

    setEditingLesson(lesson);
    setFormData({
      subjectId: lesson.subjectId,
      classroomId: lesson.classroomId,
      groupId: lesson.groupId,
      dayOfWeek: lesson.dayOfWeek,
      lessonNumber: lesson.lessonNumber,
      type: lesson.type,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
    });
    setShowEditModal(true);
  };

  const handleAddLesson = () => {
    const time = getTimeForSlot(1);
    setFormData({
      subjectId: subjects[0]?.id || '',
      classroomId: classrooms[0]?.id || '',
      groupId: groups[0]?.id || '',
      dayOfWeek: 'MONDAY',
      lessonNumber: 1,
      type: 'PRACTICE',
      startTime: time.start,
      endTime: time.end,
    });
    setShowCreateModal(true);
  };

  const handleSlotChange = (slotNum: number) => {
    const time = getTimeForSlot(slotNum);
    setFormData((prev) => ({
      ...prev,
      lessonNumber: slotNum,
      startTime: time.start,
      endTime: time.end,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingLesson) return;
    setSaving(true);
    try {
      await api.patch(`/lessons/${editingLesson.id}`, {
        classroomId: formData.classroomId,
        dayOfWeek: formData.dayOfWeek,
        lessonNumber: formData.lessonNumber,
        type: formData.type,
        startTime: formData.startTime,
        endTime: formData.endTime,
        subjectId: formData.subjectId,
        groupId: formData.groupId,
      });
      toast.success(t('common.success'));
      setShowEditModal(false);
      setEditingLesson(null);
      if (selectedSchedule) {
        loadScheduleLessons(selectedSchedule.id, selectedGroup || undefined);
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { conflicts?: Array<{ message: string }> } } };
      if (err.response?.status === 409) {
        toast.error(t('schedule.conflictDetected') + ': ' + (err.response.data?.conflicts?.[0]?.message || ''));
      } else {
        toast.error(t('common.error'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLesson = async () => {
    if (!selectedSchedule) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        scheduleId: selectedSchedule.id,
        subjectId: formData.subjectId,
        classroomId: formData.classroomId,
        groupId: formData.groupId,
        dayOfWeek: formData.dayOfWeek,
        lessonNumber: formData.lessonNumber,
        type: formData.type,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };
      // Admin must specify teacherId; for teacher role, backend auto-assigns
      if (user?.role === 'ADMIN' && user.teacher?.id) {
        payload.teacherId = user.teacher.id;
      } else if (user?.role === 'TEACHER' && user.teacher?.id) {
        payload.teacherId = user.teacher.id;
      }
      await api.post('/lessons', payload);
      toast.success(t('common.success'));
      setShowCreateModal(false);
      if (selectedSchedule) {
        loadScheduleLessons(selectedSchedule.id, selectedGroup || undefined);
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { conflicts?: Array<{ message: string }> } } };
      if (err.response?.status === 409) {
        toast.error(t('schedule.conflictDetected') + ': ' + (err.response.data?.conflicts?.[0]?.message || ''));
      } else {
        toast.error(t('common.error'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!editingLesson) return;
    if (!confirm(t('schedule.deleteLesson') + '?')) return;
    try {
      await api.delete(`/lessons/${editingLesson.id}`);
      toast.success(t('common.success'));
      setShowEditModal(false);
      setEditingLesson(null);
      if (selectedSchedule) {
        loadScheduleLessons(selectedSchedule.id, selectedGroup || undefined);
      }
    } catch {
      toast.error(t('common.error'));
    }
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
              <button className="btn-primary flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
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

  const renderLessonForm = () => (
    <div className="space-y-4">
      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          {t('common.subjects')}
        </label>
        <select
          value={formData.subjectId}
          onChange={(e) => setFormData((prev) => ({ ...prev, subjectId: e.target.value }))}
          className="input-field w-full"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Group */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          {t('common.groups')}
        </label>
        <select
          value={formData.groupId}
          onChange={(e) => setFormData((prev) => ({ ...prev, groupId: e.target.value }))}
          className="input-field w-full"
        >
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* Classroom */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          {t('common.classrooms')}
        </label>
        <select
          value={formData.classroomId}
          onChange={(e) => setFormData((prev) => ({ ...prev, classroomId: e.target.value }))}
          className="input-field w-full"
        >
          {classrooms.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.building}, эт. {c.floor})</option>
          ))}
        </select>
      </div>

      {/* Day of week */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          {t('schedule.dayOfWeek') || 'День недели'}
        </label>
        <select
          value={formData.dayOfWeek}
          onChange={(e) => setFormData((prev) => ({ ...prev, dayOfWeek: e.target.value as DayOfWeek }))}
          className="input-field w-full"
        >
          {DAYS.map((day) => (
            <option key={day} value={day}>{t(`days.${day}`)}</option>
          ))}
        </select>
      </div>

      {/* Time slot */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          {t('schedule.timeSlot')}
        </label>
        <select
          value={formData.lessonNumber}
          onChange={(e) => handleSlotChange(Number(e.target.value))}
          className="input-field w-full"
        >
          {TIME_SLOTS.map((slot) => (
            <option key={slot.num} value={slot.num}>
              {slot.num} пара ({slot.start}–{slot.end})
            </option>
          ))}
        </select>
      </div>

      {/* Lesson type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          {t('schedule.lessonType') || 'Тип занятия'}
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as LessonType }))}
          className="input-field w-full"
        >
          {(['LECTURE', 'PRACTICE', 'LAB', 'SEMINAR', 'EXAM'] as const).map((type) => (
            <option key={type} value={type}>{t(`lessonTypes.${type}`)}</option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="page-transition space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('schedule.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {selectedSchedule ? translateScheduleName(selectedSchedule.name, t) : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Add lesson button for teachers and admins */}
          {canEdit && (
            <button
              onClick={handleAddLesson}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('schedule.addLesson')}
            </button>
          )}

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
            <option key={s.id} value={s.id}>{translateScheduleName(s.name, t)}</option>
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
                <tr key={slot.num} className={cn(
                  'border-b border-gray-100 dark:border-slate-800 last:border-0',
                  slot.num === 5 && 'border-t-2 border-t-blue-300 dark:border-t-blue-700'
                )}>
                  <td className="py-2 px-4 align-top">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{slot.num}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">{slot.start}–{slot.end}</div>
                    {slot.num >= 5 && (
                      <div className="text-[10px] text-blue-500 dark:text-blue-400 mt-0.5">2 смена</div>
                    )}
                  </td>
                  {displayDays.map((day) => {
                    const slotLessons = getLessonsForSlot(day, slot.num);
                    return (
                      <td key={`${day}-${slot.num}`} className="py-1.5 px-1.5 align-top">
                        {slotLessons.length > 0 ? (
                          <div className="space-y-1">
                            {slotLessons.map((lesson) => {
                              const isOwnLesson = user?.role === 'TEACHER' && user.teacher?.id === lesson.teacherId;
                              const isClickable = user?.role === 'ADMIN' || isOwnLesson;
                              return (
                                <motion.div
                                  key={lesson.id}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  onClick={() => isClickable && handleEditLesson(lesson)}
                                  className={cn(
                                    'p-2.5 rounded-xl border text-xs transition-all relative group',
                                    LESSON_COLORS[lesson.type as LessonType],
                                    lesson.subject.color && 'border-l-4',
                                    isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
                                  )}
                                  style={lesson.subject.color ? { borderLeftColor: lesson.subject.color } : undefined}
                                >
                                  {isClickable && (
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Pencil className="h-3 w-3" />
                                    </div>
                                  )}
                                  <p className="font-semibold truncate pr-4">{lesson.subject.name}</p>
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
                              );
                            })}
                          </div>
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

      {/* Edit Lesson Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingLesson(null); }} title={t('schedule.editLesson')} size="md">
        {renderLessonForm()}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={handleDeleteLesson}
            className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {t('common.delete')}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowEditModal(false); setEditingLesson(null); }}
              className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Lesson Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('schedule.addLesson')} size="md">
        {renderLessonForm()}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleCreateLesson}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
          >
            {saving ? t('common.loading') : t('common.create')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
