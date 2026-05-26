import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Clock, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { Semester } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { cn } from '../../utils/cn';

export default function SemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Semester | null>(null);
  const [form, setForm] = useState({ name: '', nameKz: '', nameEn: '', academicYear: '', startDate: '', endDate: '', status: 'PLANNING' });
  const { t } = useTranslation();

  const fetchData = async () => {
    try { const { data } = await api.get('/semesters'); setSemesters(data.data); }
    catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await api.patch(`/semesters/${editing.id}`, form); }
      else { await api.post('/semesters', form); }
      toast.success(t('common.success'));
      setShowModal(false);
      setEditing(null);
      fetchData();
    } catch { toast.error(t('common.error')); }
  };

  const handleSetCurrent = async (id: string) => {
    try { await api.patch(`/semesters/${id}/set-current`); toast.success(t('common.success')); fetchData(); }
    catch { toast.error(t('common.error')); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm') + '?')) return;
    try { await api.delete(`/semesters/${id}`); toast.success(t('common.success')); fetchData(); }
    catch { toast.error(t('common.error')); }
  };

  const openEdit = (s: Semester) => {
    setEditing(s);
    setForm({ name: s.name, nameKz: s.nameKz || '', nameEn: s.nameEn || '', academicYear: s.academicYear, startDate: s.startDate.split('T')[0], endDate: s.endDate.split('T')[0], status: s.status });
    setShowModal(true);
  };

  const statusColors: Record<string, string> = {
    PLANNING: 'badge-yellow',
    ACTIVE: 'badge-green',
    COMPLETED: 'badge-blue',
    ARCHIVED: 'badge-red',
  };

  if (loading) return <LoadingSpinner size="lg" className="h-96" />;

  return (
    <div className="page-transition space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('common.semesters')}</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setForm({ name: '', nameKz: '', nameEn: '', academicYear: '', startDate: '', endDate: '', status: 'PLANNING' }); setEditing(null); setShowModal(true); }}>
          <Plus className="h-4 w-4" /> {t('common.add')}
        </button>
      </div>

      {semesters.length === 0 ? (
        <EmptyState icon={<Clock className="h-10 w-10 text-gray-400" />} title={t('common.noData')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {semesters.map((semester, i) => (
            <motion.div key={semester.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={cn('card p-6 hover:shadow-lg transition-shadow', semester.isCurrent && 'ring-2 ring-primary-500')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{semester.name}</h3>
                    {semester.isCurrent && <span className="badge badge-green">Current</span>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{semester.academicYear}</p>
                </div>
                <div className="flex gap-1">
                  {!semester.isCurrent && (
                    <button onClick={() => handleSetCurrent(semester.id)} className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20" title={t('semester.setCurrent')}>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </button>
                  )}
                  <button onClick={() => openEdit(semester)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><Edit2 className="h-4 w-4 text-gray-400" /></button>
                  <button onClick={() => handleDelete(semester.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4 text-red-400" /></button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                <span>{new Date(semester.startDate).toLocaleDateString()} — {new Date(semester.endDate).toLocaleDateString()}</span>
                <span className={`badge ${statusColors[semester.status]}`}>{t(`semester.${semester.status.toLowerCase()}` as const)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? t('common.edit') : t('common.add')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('common.name')}</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('semester.academicYear')}</label>
            <input value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} className="input-field" placeholder="2025-2026" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('semester.startDate')}</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('semester.endDate')}</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">{t('common.cancel')}</button>
            <button type="submit" className="btn-primary">{t('common.save')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
