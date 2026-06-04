import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Building2, Plus, Search, Edit2, Trash2, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { Classroom } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Classroom | null>(null);
  const [form, setForm] = useState({ name: '', building: '', floor: '1', capacity: '30', type: 'LECTURE', equipment: '' });
  const { t } = useTranslation();

  const fetchData = async () => {
    try {
      const { data } = await api.get('/classrooms', { params: { search, limit: 100 } });
      setClassrooms(data.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, floor: Number(form.floor), capacity: Number(form.capacity), equipment: form.equipment.split(',').map((s) => s.trim()).filter(Boolean) };
      if (editing) {
        await api.patch(`/classrooms/${editing.id}`, payload);
      } else {
        await api.post('/classrooms', payload);
      }
      toast.success(t('common.success'));
      setShowModal(false);
      setEditing(null);
      fetchData();
    } catch { toast.error(t('common.error')); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm') + '?')) return;
    try { await api.delete(`/classrooms/${id}`); toast.success(t('common.success')); fetchData(); }
    catch { toast.error(t('common.error')); }
  };

  const openEdit = (c: Classroom) => {
    setEditing(c);
    setForm({ name: c.name, building: c.building, floor: String(c.floor), capacity: String(c.capacity), type: c.type, equipment: c.equipment.join(', ') });
    setShowModal(true);
  };

  const typeColors: Record<string, string> = {
    LECTURE: 'badge-blue',
    LAB: 'badge-purple',
    SEMINAR: 'badge-green',
    PRACTICE: 'badge-yellow',
  };

  if (loading) return <LoadingSpinner size="lg" className="h-96" />;

  return (
    <div className="page-transition space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('common.classrooms')}</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setForm({ name: '', building: '', floor: '1', capacity: '30', type: 'LECTURE', equipment: '' }); setEditing(null); setShowModal(true); }}>
          <Plus className="h-4 w-4" /> {t('common.add')}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder={t('common.search')} />
      </div>

      {classrooms.length === 0 ? (
        <EmptyState icon={<Building2 className="h-10 w-10 text-gray-400" />} title={t('common.noData')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {classrooms.map((room, i) => (
            <motion.div key={room.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-900/30">
                  <Building2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(room)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><Edit2 className="h-3.5 w-3.5 text-gray-400" /></button>
                  <button onClick={() => handleDelete(room.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{room.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 mt-1">
                <MapPin className="h-3.5 w-3.5" /> {room.building}, {t('student.course')} {room.floor}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 mt-1">
                <Users className="h-3.5 w-3.5" /> {room.capacity} мест
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={`badge ${typeColors[room.type] || 'badge-blue'}`}>{room.type}</span>
                <span className="text-xs text-gray-400">{room._count?.lessons || 0} lessons</span>
              </div>
              {room.equipment.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {room.equipment.slice(0, 3).map((eq) => (
                    <span key={eq} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400">{eq}</span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? t('common.edit') : t('common.add')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('common.name')}</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Building</label>
              <input value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Floor</label>
              <input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} className="input-field" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Capacity</label>
              <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="input-field" min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                <option value="LECTURE">Lecture</option>
                <option value="LAB">Lab</option>
                <option value="SEMINAR">Seminar</option>
                <option value="PRACTICE">Practice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Equipment (comma-separated)</label>
              <input value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} className="input-field" />
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
