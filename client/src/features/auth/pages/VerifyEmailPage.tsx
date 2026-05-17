import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/authApi';
import { Logo } from '../../../components/brand/Logo';
import { Spinner } from '../../../components/feedback/Spinner';

export const VerifyEmailPage = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'));
  }, [params]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
      <Logo className="mb-8" />
      {status === 'loading' && <Spinner />}
      {status === 'ok' && (
        <div className="text-center">
          <p className="text-lg font-medium text-green-600">{t('auth.verifySuccess')}</p>
          <Link to="/login" className="mt-4 inline-block text-indigo-600 hover:underline">{t('auth.login')}</Link>
        </div>
      )}
      {status === 'error' && (
        <div className="text-center">
          <p className="text-red-500">Invalid or expired link</p>
          <Link to="/login" className="mt-4 inline-block text-indigo-600">← {t('auth.login')}</Link>
        </div>
      )}
    </div>
  );
};
