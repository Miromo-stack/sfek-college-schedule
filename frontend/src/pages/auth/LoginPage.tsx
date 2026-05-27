import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success(t('common.success'));
      navigate('/dashboard');
    } catch {
      toast.error(t('auth.loginError'));
    }
  };

  const languages = [
    { code: 'kk', label: 'Қаз' },
    { code: 'ru', label: 'Рус' },
    { code: 'en', label: 'Eng' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-400/10 dark:bg-primary-400/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-400/10 dark:bg-accent-400/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-300/5 rounded-full blur-3xl" />
      </div>

      {/* Top controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-gray-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <div className="flex rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { i18n.changeLanguage(lang.code); localStorage.setItem('language', lang.code); }}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                i18n.language === lang.code
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 0.1 }}
            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-2xl shadow-primary-500/30 border-2 border-primary-200 dark:border-slate-600"
          >
            <img src="/sfek-logo.webp" alt="SFEK" className="w-16 h-16 rounded-xl object-contain" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {t('common.appName')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {t('common.appSubtitle')}
          </p>
        </div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            {t('auth.loginTitle')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
            {t('auth.loginSubtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="admin@sfek.edu.kz"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11 pr-11"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t('auth.loginButton')
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-slate-700/50">
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-2 font-medium">Demo accounts:</p>
            <div className="space-y-1.5">
              {[
                { role: 'Admin', email: 'admin@sfek.edu.kz' },
                { role: 'Teacher', email: 'petrov@sfek.edu.kz' },
                { role: 'Student', email: 'student1@sfek.edu.kz' },
              ].map((demo) => (
                <button
                  key={demo.email}
                  onClick={() => { setEmail(demo.email); setPassword('Password123!'); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-xs"
                >
                  <span className="font-medium text-gray-700 dark:text-slate-300">{demo.role}</span>
                  <span className="text-gray-500 dark:text-slate-400">{demo.email}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-6">
          SFEK College, Semey, Kazakhstan © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}
