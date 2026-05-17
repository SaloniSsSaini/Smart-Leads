import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../app/authContext';
import { authApi } from '../../features/auth/services/authApi';

export const OnboardingBanner = () => {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();

  if (!user || user.onboardingDone) return null;

  const dismiss = async () => {
    await authApi.updateProfile({ onboardingDone: true });
    await refreshUser();
  };

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/40">
      <p className="flex-1 text-sm text-indigo-800 dark:text-indigo-200">{t('onboarding.tip')}</p>
      <button type="button" onClick={dismiss} className="shrink-0 text-indigo-600 hover:text-indigo-800">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};
