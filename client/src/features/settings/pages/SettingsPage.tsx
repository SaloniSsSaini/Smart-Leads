import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { teamApi } from '../../team/services/teamApi';
import { Header } from '../../../components/layout/Header';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/feedback/Spinner';
import { toast } from 'sonner';

export const SettingsPage = () => {
  const { openSidebar } = useOutletContext<{ openSidebar: () => void }>();
  const queryClient = useQueryClient();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [totp, setTotp] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => teamApi.settings().then((r) => r.data.data),
  });

  const { data: webhooks } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => teamApi.webhooks().then((r) => r.data.data),
  });

  const [branding, setBranding] = useState({ primaryColor: '#4F46E5', displayName: '' });

  const saveBranding = useMutation({
    mutationFn: () => teamApi.updateBranding(branding),
    onSuccess: () => toast.success('Branding saved'),
  });

  const setup2fa = useMutation({
    mutationFn: () => teamApi.setup2FA(),
    onSuccess: (res) => {
      const qr = res.data.data?.qrCode;
      if (qr) setQrCode(qr);
      toast.success('Scan QR with your authenticator app');
    },
  });

  const verify2fa = useMutation({
    mutationFn: () => teamApi.verify2FA(totp),
    onSuccess: () => toast.success('2FA enabled'),
  });

  const addWebhook = useMutation({
    mutationFn: () => teamApi.createWebhook(webhookUrl, ['lead.created', 'lead.updated']),
    onSuccess: () => {
      toast.success('Webhook added');
      setWebhookUrl('');
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-8">
      <Header title="Settings" subtitle="White-label, security, integrations" onMenuClick={openSidebar} />

      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 font-semibold">White-label branding</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Display name" value={branding.displayName || settings?.branding?.displayName || ''} onChange={(e) => setBranding({ ...branding, displayName: e.target.value })} />
          <Input label="Primary color" type="color" value={branding.primaryColor} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} />
        </div>
        <Button className="mt-4" onClick={() => saveBranding.mutate()}>Save branding</Button>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 font-semibold">Two-factor authentication (TOTP)</h2>
        <Button variant="secondary" onClick={() => setup2fa.mutate()}>Setup 2FA</Button>
        {qrCode && <img src={qrCode} alt="2FA QR code" className="mt-4 h-40 w-40 rounded-lg border" />}
        <div className="mt-3 flex gap-2">
          <Input placeholder="6-digit code" value={totp} onChange={(e) => setTotp(e.target.value)} />
          <Button onClick={() => verify2fa.mutate()}>Verify & enable</Button>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 font-semibold">Webhooks (Zapier / custom)</h2>
        <div className="flex gap-2">
          <Input placeholder="https://your-app.com/webhook" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="flex-1" />
          <Button onClick={() => addWebhook.mutate()}>Add</Button>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {(webhooks as { url: string; events: string[] }[])?.map((w, i) => (
            <li key={i} className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">{w.url} — {w.events?.join(', ')}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};
