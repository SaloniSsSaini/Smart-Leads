import { Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../app/authContext';
import { LoginForm } from '../components/LoginForm';
import { Logo } from '../../../components/brand/Logo';

export const LoginPage = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 p-4 dark:from-gray-950 dark:to-indigo-950/30">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <Link to="/" className="mb-6 flex justify-center">
          <Logo />
        </Link>
        <h1 className="mb-2 text-center text-2xl font-bold">{t('auth.login')}</h1>
        <p className="mb-6 text-center text-sm text-gray-500">{t('tagline')}</p>
        <LoginForm />
        <p className="mt-4 text-center text-xs text-gray-400">{t('auth.demo')}</p>
      </div>
    </div>
  );
};
