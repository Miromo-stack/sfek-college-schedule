import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GraduationCap, Plus, Search, Edit2, Trash2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { Student, Group } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', middleName: '', phone: '', groupId: '', studentId: '', enrollYear: new Date().getFullYear().toString(), password: '' });
  const { t } = useTranslation();

  const fetchStudents = async () => {
    try {
      const params: Record<string, string | number> = { search, limit: 100 };
      if (filterGroup) params.groupId = filterGroup;
      const [studentsRes, groupsRes] = await Promise.all([
        api.get('/students', { params }),
        api.get('/groups'),
      ]);
      setStudents(studentsRes.data.data);
      setGroups(groupsRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [search, filterGroup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.patch(`/students/${editingStudent.id}`, form);
      } else {
        await api.post('/students', { ...form, enrollYear: Number(form.enrollYear), password: form.password || 'Student123!' });
      }
      toast.success(t('common.success'));
      setShowModal(false);
      setEditingStudent(null);
      fetchStudents();
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm') + '?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success(t('common.success'));
      fetchStudents();
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setForm({
      email: student.user.email,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      middleName: student.user.middleName || '',
      phone: student.user.phone || '',
      groupId: student.groupId,
      studentId: student.studentId,
      enrollYear: String(student.enrollYear),
      password: '',
    });
    setShowModal(true);
  };

  if (loading) return <LoadingSpinner size="lg" className="h-96" />;

  return (
    <div className="page-transition space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('common.students')}</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setForm({ email: '', firstName: '', lastName: '', middleName: '', phone: '', groupId: '', studentId: '', enrollYear: new Date().getFullYear().toString(), password: '' }); setEditingStudent(null); setShowModal(true); }}>
          <Plus className="h-4 w-4" /> {t('common.add')}
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder={t('common.search')} />
        </div>
        <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} className="input-field w-auto">
          <option value="">{t('common.all')} {t('common.groups').toLowerCase()}</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      {students.length === 0 ? (
        <EmptyState icon={<GraduationCap className="h-10 w-10 text-gray-400" />} title={t('common.noData')} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-slate-400">#</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-slate-400">{t('common.name')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-slate-400">{t('common.email')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-slate-400">{t('student.studentId')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-slate-400">{t('student.myGroup')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-slate-400">{t('student.course')}</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-slate-400">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="table-row border-b border-gray-100 dark:border-slate-800 last:border-0"
                  >
                    <td className="py-3 px-4 text-sm text-gray-500">{i + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">{student.user.firstName[0]}{student.user.lastName[0]}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.user.lastName} {student.user.firstName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-slate-400">{student.user.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-slate-400">{student.studentId}</td>
                    <td className="py-3 px-4"><span className="badge badge-blue">{student.group.name}</span></td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-slate-400">{student.group.course}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleEdit(student)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
                          <Edit2 className="h-3.5 w-3.5 text-gray-400" />
                        </button>
                        <button onClick={() => handleDelete(student.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingStudent ? t('common.edit') : t('common.add')}>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('student.studentId')}</label>
              <input value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('student.myGroup')}</label>
              <select value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })} className="input-field" required>
                <option value="">--</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
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
