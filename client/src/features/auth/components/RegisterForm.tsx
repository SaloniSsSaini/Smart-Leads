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
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  orgName: z.string().min(2),
});

type FormData = z.infer<typeof schema>;

export const RegisterForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => authApi.register(data),
    onSuccess: (res) => {
      const { token, user, organizations } = res.data.data;
      login(token, user, organizations);
      toast.success(res.data.message || 'Account created');
      navigate('/dashboard');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError('root', { message: err.response?.data?.message || 'Registration failed' });
    },
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <Input label={t('auth.name')} error={errors.name?.message} {...register('name')} />
      <Input label={t('auth.email')} type="email" error={errors.email?.message} {...register('email')} />
      <Input label={t('auth.orgName')} error={errors.orgName?.message} {...register('orgName')} />
      <Input label={t('auth.password')} type="password" error={errors.password?.message} {...register('password')} />
      {errors.root && <p className="text-sm text-red-500">{errors.root.message}</p>}
      <Button type="submit" className="w-full" loading={mutation.isPending}>{t('auth.register')}</Button>
      <p className="text-center text-sm text-gray-500">
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="text-indigo-600 hover:underline">{t('auth.login')}</Link>
      </p>
    </form>
  );
};
