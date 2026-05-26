import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { Teacher, Department } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', middleName: '', phone: '', departmentId: '', employeeId: '', position: '', specialization: '', password: '' });
  const { t } = useTranslation();

  const fetchTeachers = async () => {
    try {
      const [teachersRes, deptsRes] = await Promise.all([
        api.get('/teachers', { params: { search, limit: 100 } }),
        api.get('/departments'),
      ]);
      setTeachers(teachersRes.data.data);
      setDepartments(deptsRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(); }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await api.patch(`/teachers/${editingTeacher.id}`, form);
        toast.success(t('common.success'));
      } else {
        await api.post('/teachers', { ...form, password: form.password || 'Teacher123!' });
        toast.success(t('common.success'));
      }
      setShowModal(false);
      setEditingTeacher(null);
      resetForm();
      fetchTeachers();
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm') + '?')) return;
    try {
      await api.delete(`/teachers/${id}`);
      toast.success(t('common.success'));
      fetchTeachers();
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setForm({
      email: teacher.user.email,
      firstName: teacher.user.firstName,
      lastName: teacher.user.lastName,
      middleName: teacher.user.middleName || '',
      phone: teacher.user.phone || '',
      departmentId: teacher.departmentId,
      employeeId: teacher.employeeId,
      position: teacher.position || '',
      specialization: teacher.specialization || '',
      password: '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({ email: '', firstName: '', lastName: '', middleName: '', phone: '', departmentId: '', employeeId: '', position: '', specialization: '', password: '' });
  };

  if (loading) return <LoadingSpinner size="lg" className="h-96" />;

  return (
    <div className="page-transition space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('common.teachers')}</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => { resetForm(); setEditingTeacher(null); setShowModal(true); }}>
          <Plus className="h-4 w-4" /> {t('common.add')}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
          placeholder={t('common.search')}
        />
      </div>

      {teachers.length === 0 ? (
        <EmptyState icon={<Users className="h-10 w-10 text-gray-400" />} title={t('common.noData')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {teachers.map((teacher, i) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <span className="text-white font-semibold text-sm">
                      {teacher.user.firstName[0]}{teacher.user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {teacher.user.lastName} {teacher.user.firstName}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{teacher.position || teacher.specialization}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(teacher)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <Edit2 className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                  <button onClick={() => handleDelete(teacher.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                  <Mail className="h-3.5 w-3.5" /> {teacher.user.email}
                </div>
                {teacher.user.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                    <Phone className="h-3.5 w-3.5" /> {teacher.user.phone}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="badge badge-blue">{teacher.department.name}</span>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {teacher._count?.lessons || 0} {t('dashboard.totalLessons').toLowerCase()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingTeacher ? t('common.edit') : t('common.add')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('common.name')}</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Фамилия</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('common.email')}</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('teacher.employeeId')}</label>
            <input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="input-field" required />
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
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('teacher.position')}</label>
              <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('teacher.specialization')}</label>
              <input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="input-field" />
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
