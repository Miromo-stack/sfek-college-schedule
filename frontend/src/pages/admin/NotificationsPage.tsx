import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2, Info, AlertTriangle, Calendar, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { Notification, NotificationType } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { cn } from '../../utils/cn';

const iconMap: Record<NotificationType, React.ElementType> = {
  SCHEDULE_CHANGE: Calendar,
  NEW_SCHEDULE: Calendar,
  CANCELLATION: AlertTriangle,
  ROOM_CHANGE: MapPin,
  GENERAL: Info,
  SYSTEM: Bell,
};

const colorMap: Record<NotificationType, string> = {
  SCHEDULE_CHANGE: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
  NEW_SCHEDULE: 'bg-green-100 dark:bg-green-900/30 text-green-600',
  CANCELLATION: 'bg-red-100 dark:bg-red-900/30 text-red-600',
  ROOM_CHANGE: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
  GENERAL: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  SYSTEM: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const fetchData = async () => {
    try { const { data } = await api.get('/notifications', { params: { limit: 50 } }); setNotifications(data.data); }
    catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const markAllRead = async () => {
    try { await api.patch('/notifications/read-all'); toast.success(t('common.success')); fetchData(); }
    catch { toast.error(t('common.error')); }
  };

  const markRead = async (id: string) => {
    try { await api.patch(`/notifications/${id}/read`); fetchData(); }
    catch { console.error('Failed to mark as read'); }
  };

  const deleteNotification = async (id: string) => {
    try { await api.delete(`/notifications/${id}`); fetchData(); }
    catch { toast.error(t('common.error')); }
  };

  if (loading) return <LoadingSpinner size="lg" className="h-96" />;

  return (
    <div className="page-transition space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('notifications.title')}</h1>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={markAllRead} className="btn-ghost flex items-center gap-2 text-sm">
            <CheckCheck className="h-4 w-4" /> {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<Bell className="h-10 w-10 text-gray-400" />} title={t('notifications.noNotifications')} />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification, i) => {
            const Icon = iconMap[notification.type] || Bell;
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'card p-4 flex items-start gap-4 cursor-pointer transition-all',
                  !notification.isRead && 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-200/50 dark:border-primary-800/30'
                )}
                onClick={() => !notification.isRead && markRead(notification.id)}
              >
                <div className={cn('p-2 rounded-xl flex-shrink-0', colorMap[notification.type])}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={cn('text-sm font-semibold text-gray-900 dark:text-white', !notification.isRead && 'font-bold')}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.isRead && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
                      <button onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
                        <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-0.5">{notification.message}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
