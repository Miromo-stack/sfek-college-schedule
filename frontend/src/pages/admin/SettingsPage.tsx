import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User, Globe, Palette, MessageSquare, MapPin, Phone, Mail, Clock, Info, Send, Save, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { cn } from '../../utils/cn';

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { t, i18n } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    middleName: user?.middleName || '',
    phone: user?.phone || '',
  });
  const [feedback, setFeedback] = useState({
    subject: 'general',
    message: '',
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

  const handleFeedbackSend = async () => {
    if (!feedback.message.trim()) {
      toast.error(t('validation.required'));
      return;
    }
    setSendingFeedback(true);
    setTimeout(() => {
      toast.success(t('settings.feedbackSent'));
      setFeedback({ subject: 'general', message: '' });
      setSendingFeedback(false);
    }, 1000);
  };

  const feedbackSubjects = [
    { value: 'general', label: t('settings.feedbackSubjectGeneral') },
    { value: 'bug', label: t('settings.feedbackSubjectBug') },
    { value: 'feature', label: t('settings.feedbackSubjectFeature') },
    { value: 'schedule', label: t('settings.feedbackSubjectSchedule') },
    { value: 'other', label: t('settings.feedbackSubjectOther') },
  ];

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
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('settings.lastName')}</label>
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('settings.middleName')}</label>
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

      {/* Feedback */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
            <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.feedback')}</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 ml-12">{t('settings.feedbackDesc')}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('settings.feedbackSubject')}</label>
            <select
              value={feedback.subject}
              onChange={(e) => setFeedback({ ...feedback, subject: e.target.value })}
              className="input-field"
            >
              {feedbackSubjects.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('settings.feedbackMessage')}</label>
            <textarea
              value={feedback.message}
              onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
              placeholder={t('settings.feedbackPlaceholder')}
              rows={4}
              className="input-field resize-none"
            />
          </div>
          <button
            onClick={handleFeedbackSend}
            disabled={sendingFeedback}
            className="btn-primary flex items-center gap-2"
          >
            <Send className="h-4 w-4" /> {sendingFeedback ? t('common.loading') : t('settings.feedbackSend')}
          </button>
        </div>
      </motion.div>

      {/* Contact Us */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30">
            <Phone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.contactUs')}</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 ml-12">{t('settings.contactDesc')}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('settings.contactAddress')}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{t('settings.contactAddressValue')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
            <Phone className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('settings.contactPhone')}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{t('settings.contactPhoneValue')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
            <Mail className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('settings.contactEmail')}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-0.5">{t('settings.contactEmailValue')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
            <ExternalLink className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('settings.contactWebsite')}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-0.5">{t('settings.contactWebsiteValue')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 sm:col-span-2">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('settings.contactWorkHours')}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{t('settings.contactWorkHoursValue')}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* About System */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
            <Info className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.aboutSystem')}</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 ml-12">{t('settings.aboutDesc')}</p>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30">
            <img src="/sfek-logo.webp" alt="SFEK" className="w-16 h-16 rounded-xl object-contain" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">SFEK College Schedule System</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('settings.aboutVersion')}: 1.0.0</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
              <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide">{t('settings.aboutDeveloper')}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{t('settings.aboutDeveloperValue')}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
              <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide">{t('settings.aboutYear')}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">2026</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 sm:col-span-2">
              <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide">{t('settings.aboutTech')}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'PostgreSQL', 'Prisma', 'Docker'].map((tech) => (
                  <span key={tech} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('settings.aboutCollege')}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              {t('settings.aboutCollegeText')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
