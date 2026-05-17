import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Shield, Filter, Download, BarChart3, Users, Zap, CheckCircle2,
} from 'lucide-react';
import { Logo } from '../../../components/brand/Logo';
import { Button } from '../../../components/ui/Button';

const features = [
  { icon: Shield, label: 'JWT auth & RBAC' },
  { icon: Filter, label: 'Advanced filters & search' },
  { icon: Download, label: 'CSV export' },
  { icon: BarChart3, label: 'Dashboard analytics' },
  { icon: Users, label: 'Multi-tenant orgs' },
  { icon: Zap, label: 'Real-time notifications' },
];

const stack = ['React 18', 'TypeScript', 'Node.js', 'MongoDB', 'Socket.io', 'Docker'];

export const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Logo size="sm" />
          <nav className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => i18n.changeLanguage(i18n.language === 'hi' ? 'en' : 'hi')}
              className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              {i18n.language === 'hi' ? 'EN' : 'हिं'}
            </button>
            <Link to="/login">
              <Button variant="ghost" size="sm">{t('landing.signIn')}</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">{t('landing.getStarted')}</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden px-4 pb-20 pt-16">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-50/80 to-transparent dark:from-indigo-950/30" />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="mb-4 inline-block rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            {t('tagline')}
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
            {t('landing.heroTitle')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            {t('landing.heroSubtitle')}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg">{t('landing.getStarted')}</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">{t('landing.signIn')}</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-gray-50 px-4 py-16 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-2xl font-bold">{t('landing.featuresTitle')}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <Icon className="mb-3 h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <p className="font-medium text-gray-900 dark:text-white">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-2xl font-bold">{t('landing.howTitle')}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[t('landing.step1'), t('landing.step2'), t('landing.step3')].map((step, i) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                  {i + 1}
                </div>
                <p className="font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-indigo-600 px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold">Product preview</h2>
          <div className="overflow-hidden rounded-2xl border border-indigo-500 bg-indigo-700/50 p-4 shadow-2xl">
            <div className="rounded-xl bg-gray-900 p-4">
              <div className="mb-4 flex gap-2">
                {['Total 47', 'New 12', 'Qualified 8'].map((s) => (
                  <div key={s} className="rounded-lg bg-gray-800 px-3 py-2 text-xs">{s}</div>
                ))}
              </div>
              <div className="space-y-2">
                {['Rahul Sharma', 'Priya Patel', 'Amit Kumar'].map((n) => (
                  <div key={n} className="flex items-center justify-between rounded-lg bg-gray-800/80 px-3 py-2 text-sm">
                    <span>{n}</span>
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <h2 className="mb-6 text-center text-xl font-bold">{t('landing.techTitle')}</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium dark:border-gray-700 dark:bg-gray-900"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-800">
        {t('landing.footer', { year })}
      </footer>
    </div>
  );
};
