import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/authApi';
import { Logo } from '../../../components/brand/Logo';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { toast } from 'sonner';

export const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      toast.success('Password reset!');
      navigate('/login');
    } catch {
      toast.error('Invalid or expired link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-900">
        <Logo className="mb-6 justify-center" />
        <h1 className="mb-4 text-xl font-bold">{t('auth.resetTitle')}</h1>
        <form onSubmit={submit} className="space-y-4">
          <Input label={t('auth.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <Button type="submit" className="w-full" loading={loading}>{t('common.save')}</Button>
        </form>
        <Link to="/login" className="mt-4 block text-center text-sm text-indigo-600">← {t('auth.login')}</Link>
      </div>
    </div>
  );
};
