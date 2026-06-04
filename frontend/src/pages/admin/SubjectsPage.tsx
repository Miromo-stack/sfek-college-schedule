import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { Subject, Department } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState({ name: '', nameKz: '', nameEn: '', code: '', departmentId: '', description: '', creditHours: '3', color: '#3B82F6' });
  const { t } = useTranslation();

  const fetchData = async () => {
    try {
      const [subjectsRes, deptsRes] = await Promise.all([
        api.get('/subjects', { params: { search, limit: 100 } }),
        api.get('/departments'),
      ]);
      setSubjects(subjectsRes.data.data);
      setDepartments(deptsRes.data.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, creditHours: Number(form.creditHours) };
      if (editing) {
        await api.patch(`/subjects/${editing.id}`, payload);
      } else {
        await api.post('/subjects', payload);
      }
      toast.success(t('common.success'));
      setShowModal(false);
      setEditing(null);
      fetchData();
    } catch { toast.error(t('common.error')); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm') + '?')) return;
    try { await api.delete(`/subjects/${id}`); toast.success(t('common.success')); fetchData(); }
    catch { toast.error(t('common.error')); }
  };

  const openEdit = (subject: Subject) => {
    setEditing(subject);
    setForm({ name: subject.name, nameKz: subject.nameKz || '', nameEn: subject.nameEn || '', code: subject.code, departmentId: subject.departmentId, description: subject.description || '', creditHours: String(subject.creditHours), color: subject.color || '#3B82F6' });
    setShowModal(true);
  };

  if (loading) return <LoadingSpinner size="lg" className="h-96" />;

  return (
    <div className="page-transition space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('common.subjects')}</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setForm({ name: '', nameKz: '', nameEn: '', code: '', departmentId: '', description: '', creditHours: '3', color: '#3B82F6' }); setEditing(null); setShowModal(true); }}>
          <Plus className="h-4 w-4" /> {t('common.add')}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder={t('common.search')} />
      </div>

      {subjects.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-10 w-10 text-gray-400" />} title={t('common.noData')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {subjects.map((subject, i) => (
            <motion.div key={subject.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-10 rounded-full" style={{ backgroundColor: subject.color || '#3B82F6' }} />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{subject.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{subject.code} · {subject.creditHours}h</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(subject)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><Edit2 className="h-3.5 w-3.5 text-gray-400" /></button>
                  <button onClick={() => handleDelete(subject.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
                </div>
              </div>
              {subject.nameKz && <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">{subject.nameKz}</p>}
              <div className="mt-3 flex items-center justify-between">
                <span className="badge badge-purple">{subject.department?.name}</span>
                <span className="text-xs text-gray-400">{subject._count?.lessons || 0} lessons</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? t('common.edit') : t('common.add')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('common.name')} (RU)</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('common.name')} (KZ)</label>
              <input value={form.nameKz} onChange={(e) => setForm({ ...form, nameKz: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('common.name')} (EN)</label>
              <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Code</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('teacher.department')}</label>
              <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className="input-field" required>
                <option value="">--</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Credit Hours</label>
              <input type="number" value={form.creditHours} onChange={(e) => setForm({ ...form, creditHours: e.target.value })} className="input-field" min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Color</label>
              <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="input-field h-10" />
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
