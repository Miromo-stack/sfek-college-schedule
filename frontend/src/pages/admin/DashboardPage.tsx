import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Users, GraduationCap, BookOpen, Building2, Calendar,
  Layers, FolderOpen, TrendingUp, Plus, FileSpreadsheet,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { DashboardStats } from '../../types';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { useAuthStore } from '../../store/authStore';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      api.get('/stats/dashboard')
        .then(({ data }) => setStats(data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const dayLabels: Record<string, string> = {
    MONDAY: t('daysShort.MONDAY'),
    TUESDAY: t('daysShort.TUESDAY'),
    WEDNESDAY: t('daysShort.WEDNESDAY'),
    THURSDAY: t('daysShort.THURSDAY'),
    FRIDAY: t('daysShort.FRIDAY'),
    SATURDAY: t('daysShort.SATURDAY'),
  };

  if (loading) {
    return (
      <div className="page-transition space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  // Teacher or Student dashboard
  if (user?.role !== 'ADMIN') {
    return (
      <div className="page-transition space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t('common.welcome')}, {user?.firstName}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/schedule')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user?.role === 'TEACHER' ? t('teacher.mySchedule') : t('student.groupSchedule')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{t('dashboard.scheduleOverview')}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/notifications')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent-100 dark:bg-accent-900/30">
                <TrendingUp className="h-6 w-6 text-accent-600 dark:text-accent-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('common.notifications')}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{t('notifications.title')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: GraduationCap, label: t('dashboard.totalStudents'), value: stats?.overview.totalStudents || 0, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/25' },
    { icon: Users, label: t('dashboard.totalTeachers'), value: stats?.overview.totalTeachers || 0, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/25' },
    { icon: Layers, label: t('dashboard.totalGroups'), value: stats?.overview.totalGroups || 0, color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/25' },
    { icon: BookOpen, label: t('dashboard.totalSubjects'), value: stats?.overview.totalSubjects || 0, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/25' },
    { icon: Building2, label: t('dashboard.totalClassrooms'), value: stats?.overview.totalClassrooms || 0, color: 'from-cyan-500 to-cyan-600', shadow: 'shadow-cyan-500/25' },
    { icon: Calendar, label: t('dashboard.totalLessons'), value: stats?.overview.totalLessons || 0, color: 'from-rose-500 to-rose-600', shadow: 'shadow-rose-500/25' },
    { icon: FolderOpen, label: t('dashboard.totalDepartments'), value: stats?.overview.totalDepartments || 0, color: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/25' },
  ];

  return (
    <div className="page-transition space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
          {stats?.activeSemester && (
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              {t('dashboard.currentSemester')}: {stats.activeSemester.name}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/schedule')} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('schedule.createSchedule')}</span>
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg ${card.shadow} mb-3`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lessons per day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.lessonsPerDay')}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats?.charts.lessonsPerDay.map((d) => ({ ...d, day: dayLabels[d.day] || d.day }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-bg, #fff)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                }}
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Lessons by type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.lessonsPerType')}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats?.charts.lessonsPerType.map((d) => ({
                  ...d,
                  type: t(`lessonTypes.${d.type}` as const),
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                nameKey="type"
              >
                {stats?.charts.lessonsPerType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {stats?.charts.lessonsPerType.map((item, i) => (
              <div key={item.type} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-gray-600 dark:text-slate-400">
                  {t(`lessonTypes.${item.type}` as const)} ({item.count})
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('dashboard.quickActions')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Calendar, label: t('schedule.createSchedule'), path: '/schedule', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
            { icon: Users, label: t('common.add') + ' ' + t('common.teachers').toLowerCase(), path: '/teachers', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
            { icon: GraduationCap, label: t('common.add') + ' ' + t('common.students').toLowerCase(), path: '/students', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
            { icon: FileSpreadsheet, label: t('common.export') + ' ' + t('common.pdf'), path: '/schedule', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
            >
              <div className={`p-2.5 rounded-xl ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-slate-300 text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
