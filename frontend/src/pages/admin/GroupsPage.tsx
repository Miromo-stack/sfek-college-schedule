import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Layers, Plus, Search, Edit2, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { Group, Department } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [form, setForm] = useState({ name: '', departmentId: '', course: '1', maxStudents: '30' });
  const { t } = useTranslation();

  const fetchData = async () => {
    try {
      const [groupsRes, deptsRes] = await Promise.all([api.get('/groups', { params: { search, limit: 100 } }), api.get('/departments')]);
      setGroups(groupsRes.data.data);
      setDepartments(deptsRes.data.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, course: Number(form.course), maxStudents: Number(form.maxStudents) };
      if (editing) { await api.patch(`/groups/${editing.id}`, payload); }
      else { await api.post('/groups', payload); }
      toast.success(t('common.success'));
      setShowModal(false);
      setEditing(null);
      fetchData();
    } catch { toast.error(t('common.error')); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm') + '?')) return;
    try { await api.delete(`/groups/${id}`); toast.success(t('common.success')); fetchData(); }
    catch { toast.error(t('common.error')); }
  };

  const openEdit = (g: Group) => {
    setEditing(g);
    setForm({ name: g.name, departmentId: g.departmentId, course: String(g.course), maxStudents: String(g.maxStudents) });
    setShowModal(true);
  };

  if (loading) return <LoadingSpinner size="lg" className="h-96" />;

  return (
    <div className="page-transition space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('common.groups')}</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setForm({ name: '', departmentId: '', course: '1', maxStudents: '30' }); setEditing(null); setShowModal(true); }}>
          <Plus className="h-4 w-4" /> {t('common.add')}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder={t('common.search')} />
      </div>

      {groups.length === 0 ? (
        <EmptyState icon={<Layers className="h-10 w-10 text-gray-400" />} title={t('common.noData')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {groups.map((group, i) => (
            <motion.div key={group.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                  <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(group)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><Edit2 className="h-3.5 w-3.5 text-gray-400" /></button>
                  <button onClick={() => handleDelete(group.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{group.name}</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('student.course')} {group.course}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="badge badge-blue">{group.department?.name}</span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="h-3.5 w-3.5" /> {group._count?.students || 0}/{group.maxStudents}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? t('common.edit') : t('common.add')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('common.name')}</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('teacher.department')}</label>
            <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className="input-field" required>
              <option value="">--</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('student.course')}</label>
              <input type="number" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="input-field" min="1" max="6" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Max Students</label>
              <input type="number" value={form.maxStudents} onChange={(e) => setForm({ ...form, maxStudents: e.target.value })} className="input-field" min="1" />
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
