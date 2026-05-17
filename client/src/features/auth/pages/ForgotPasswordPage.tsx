import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/authApi';
import { Logo } from '../../../components/brand/Logo';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { toast } from 'sonner';

export const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setSent(true);
      toast.success(res.data.message);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-900">
        <Logo className="mb-6 justify-center" />
        <h1 className="mb-2 text-xl font-bold">{t('auth.forgotTitle')}</h1>
        {sent ? (
          <p className="text-sm text-gray-600">Check your email for the reset link (see server console in dev).</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Input label={t('auth.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" className="w-full" loading={loading}>{t('auth.sendReset')}</Button>
          </form>
        )}
        <Link to="/login" className="mt-4 block text-center text-sm text-indigo-600">← {t('auth.login')}</Link>
      </div>
    </div>
  );
};
