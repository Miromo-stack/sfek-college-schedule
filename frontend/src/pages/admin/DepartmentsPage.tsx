import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, Edit2, Trash2, Users, BookOpen, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { Department } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: '', nameKz: '', nameEn: '', code: '', description: '' });
  const { t } = useTranslation();

  const fetchData = async () => {
    try { const { data } = await api.get('/departments'); setDepartments(data.data); }
    catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await api.patch(`/departments/${editing.id}`, form); }
      else { await api.post('/departments', form); }
      toast.success(t('common.success'));
      setShowModal(false);
      setEditing(null);
      fetchData();
    } catch { toast.error(t('common.error')); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm') + '?')) return;
    try { await api.delete(`/departments/${id}`); toast.success(t('common.success')); fetchData(); }
    catch { toast.error(t('common.error')); }
  };

  const openEdit = (d: Department) => {
    setEditing(d);
    setForm({ name: d.name, nameKz: d.nameKz || '', nameEn: d.nameEn || '', code: d.code, description: d.description || '' });
    setShowModal(true);
  };

  const colors = ['from-blue-500 to-blue-600', 'from-emerald-500 to-emerald-600', 'from-indigo-500 to-indigo-600', 'from-amber-500 to-amber-600', 'from-cyan-500 to-cyan-600'];

  if (loading) return <LoadingSpinner size="lg" className="h-96" />;

  return (
    <div className="page-transition space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('common.departments')}</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setForm({ name: '', nameKz: '', nameEn: '', code: '', description: '' }); setEditing(null); setShowModal(true); }}>
          <Plus className="h-4 w-4" /> {t('common.add')}
        </button>
      </div>

      {departments.length === 0 ? (
        <EmptyState icon={<FolderOpen className="h-10 w-10 text-gray-400" />} title={t('common.noData')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept, i) => (
            <motion.div key={dept.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center shadow-lg`}>
                    <FolderOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{dept.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{dept.code}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(dept)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><Edit2 className="h-4 w-4 text-gray-400" /></button>
                  <button onClick={() => handleDelete(dept.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4 text-red-400" /></button>
                </div>
              </div>
              {dept.description && <p className="text-sm text-gray-500 dark:text-slate-400 mt-3">{dept.description}</p>}
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {dept._count?.teachers || 0} teachers</span>
                <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {dept._count?.subjects || 0} subjects</span>
                <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {dept._count?.groups || 0} groups</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? t('common.edit') : t('common.add')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('common.name')} (RU)</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('common.name')} (KZ)</label>
              <input value={form.nameKz} onChange={(e) => setForm({ ...form, nameKz: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('common.name')} (EN)</label>
              <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Code</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} />
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
