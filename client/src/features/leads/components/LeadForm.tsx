import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { STATUS_OPTIONS, SOURCE_OPTIONS } from '../../../constants';
import type { Lead } from '../../../types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Lost']),
  source: z.enum(['Website', 'Instagram', 'Referral']),
});

type FormData = z.infer<typeof schema>;

interface LeadFormProps {
  defaultValues?: Partial<Lead>;
  onSubmit: (data: FormData) => void;
  loading?: boolean;
  submitLabel?: string;
}

export const LeadForm = ({
  defaultValues,
  onSubmit,
  loading,
  submitLabel = 'Save',
}: LeadFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      status: defaultValues?.status ?? 'New',
      source: defaultValues?.source ?? 'Website',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Name" error={errors.name?.message} {...register('name')} />
      <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
      <Select
        label="Status"
        options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
        error={errors.status?.message}
        {...register('status')}
      />
      <Select
        label="Source"
        options={SOURCE_OPTIONS.map((s) => ({ value: s, label: s }))}
        error={errors.source?.message}
        {...register('source')}
      />
      <Button type="submit" loading={loading}>
        {submitLabel}
      </Button>
    </form>
  );
};
