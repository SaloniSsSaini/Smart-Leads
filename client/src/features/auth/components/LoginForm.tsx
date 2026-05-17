import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { authApi } from '../services/authApi';
import { useAuth } from '../../../app/authContext';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totpToken: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const LoginForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [needs2FA, setNeeds2FA] = useState(false);
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => authApi.login(data),
    onSuccess: (res) => {
      const { token, user, organizations } = res.data.data;
      login(token, user, organizations);
      toast.success(t('auth.login'));
      navigate('/dashboard');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err.response?.data?.message || 'Invalid credentials';
      if (msg.toLowerCase().includes('2fa')) setNeeds2FA(true);
      setError('root', { message: msg });
    },
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <Input label={t('auth.email')} type="email" error={errors.email?.message} {...register('email')} />
      <Input label={t('auth.password')} type="password" error={errors.password?.message} {...register('password')} />
      {needs2FA && (
        <Input label="2FA code" placeholder="6-digit code" error={errors.totpToken?.message} {...register('totpToken')} />
      )}
      <div className="text-right">
        <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          {t('auth.forgotPassword')}
        </Link>
      </div>
      {errors.root && <p className="text-sm text-red-500">{errors.root.message}</p>}
      <Button type="submit" className="w-full" loading={mutation.isPending}>{t('auth.login')}</Button>
      <p className="text-center text-sm text-gray-500">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="text-indigo-600 hover:underline">{t('auth.register')}</Link>
      </p>
    </form>
  );
};
