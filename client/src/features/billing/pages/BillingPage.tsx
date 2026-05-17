import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { billingApi } from '../services/billingApi';
import { Header } from '../../../components/layout/Header';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/feedback/Spinner';
import { useAuth } from '../../../app/authContext';
import type { PlanType } from '../../../types';

export const BillingPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => billingApi.plans().then((r) => r.data.data),
  });

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => billingApi.subscription().then((r) => r.data.data),
  });

  const checkout = useMutation({
    mutationFn: (plan: 'pro' | 'enterprise') => billingApi.checkout(plan),
    onSuccess: (res) => {
      const { url, message, mock } = res.data.data;
      if (url && !mock) {
        window.location.href = url;
        return;
      }
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: () => toast.error('Upgrade failed'),
  });

  if (isLoading) return <Spinner />;

  const planKeys: PlanType[] = ['free', 'pro', 'enterprise'];

  return (
    <div>
      <Header title={t('billing.title')} subtitle={t('billing.subtitle')} />
      <p className="mb-6 text-sm text-gray-500">
        {t('billing.currentPlan')}: <strong className="capitalize">{sub?.plan ?? 'free'}</strong>
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {planKeys.map((key) => {
          const plan = plans?.[key];
          if (!plan) return null;
          const isCurrent = sub?.plan === key;
          return (
            <div
              key={key}
              className={`rounded-2xl border p-6 ${isCurrent ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-200 dark:border-gray-800'} bg-white dark:bg-gray-900`}
            >
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="mt-2 text-3xl font-extrabold">
                ${plan.price}
                <span className="text-sm font-normal text-gray-500">/mo</span>
              </p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="h-4 w-4 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              {key !== 'free' && user?.role === 'admin' && (
                <Button
                  className="mt-6 w-full"
                  variant={isCurrent ? 'secondary' : 'primary'}
                  disabled={isCurrent}
                  loading={checkout.isPending}
                  onClick={() => checkout.mutate(key as 'pro' | 'enterprise')}
                >
                  {isCurrent ? 'Current plan' : t('billing.upgrade')}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
