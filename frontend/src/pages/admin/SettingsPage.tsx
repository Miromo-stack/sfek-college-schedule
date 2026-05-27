import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User, Globe, Palette, Shield, Bell, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { cn } from '../../utils/cn';

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { t, i18n } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    middleName: user?.middleName || '',
    phone: user?.phone || '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success(t('common.success'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <div className="page-transition space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('common.settings')}</h1>

      {/* Profile Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
            <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('common.profile')}</h2>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">{user?.email}</p>
            <span className="badge badge-blue mt-1">{user?.role}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('common.name')}</label>
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Фамилия</label>
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Отчество</label>
            <input value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('common.phone')}</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 mt-4">
          <Save className="h-4 w-4" /> {saving ? t('common.loading') : t('common.save')}
        </button>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('common.darkMode')}</h2>
        </div>

        <div className="flex gap-3">
          {([['light', t('common.lightMode'), '☀️'], ['dark', t('common.darkMode'), '🌙']] as const).map(([value, label, icon]) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex-1 p-4 rounded-xl border-2 transition-all text-center',
                theme === value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
              )}
            >
              <span className="text-2xl">{icon}</span>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">{label}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Language */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-900/30">
            <Globe className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('common.language')}</h2>
        </div>

        <div className="flex gap-3">
          {[
            { code: 'kk', label: 'Қазақша', flag: '🇰🇿' },
            { code: 'ru', label: 'Русский', flag: '🇷🇺' },
            { code: 'en', label: 'English', flag: '🇬🇧' },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                'flex-1 p-4 rounded-xl border-2 transition-all text-center',
                i18n.language === lang.code
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
              )}
            >
              <span className="text-2xl">{lang.flag}</span>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">{lang.label}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
