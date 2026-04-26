import { useEffect } from 'react'
import { Modal, TextInput, Button, Group, Stack } from '@mantine/core'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Investor } from '../../domain/entities'
import { useAuthUser } from '../../../../core/auth/useAuthUser'

const investorFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().optional(),
  pan: z.string().optional(),
})

type InvestorFormValues = z.infer<typeof investorFormSchema>

interface InvestorModalProps {
  opened: boolean
  onClose: () => void
  initial?: Investor | null
  onSubmit: (investor: Investor) => Promise<void>
}

export function InvestorModal({ opened, onClose, initial, onSubmit }: InvestorModalProps) {
  const { profile } = useAuthUser()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvestorFormValues>({
    resolver: zodResolver(investorFormSchema),
    defaultValues: {
      name: initial?.name ?? '',
      mobile: initial?.mobile ?? '',
      pan: initial?.pan ?? '',
    },
  })

  useEffect(() => {
    if (opened) {
      reset({
        name: initial?.name ?? '',
        mobile: initial?.mobile ?? '',
        pan: initial?.pan ?? '',
      })
    }
  }, [opened, initial, reset])

  const submitHandler = async (values: InvestorFormValues) => {
    const payload: Investor = {
      id: initial?.id ?? crypto.randomUUID(),
      name: values.name,
      mobile: values.mobile || undefined,
      pan: values.pan || undefined,
      sync: false,
      userId: profile?.id ?? '',
    }

    await onSubmit(payload)
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title={initial ? 'Edit Investor' : 'Add Investor'} size="sm">
      <form onSubmit={handleSubmit(submitHandler)}>
        <Stack gap="md">
          <TextInput
            label="Investor Name"
            placeholder="Investor name"
            {...register('name')}
            error={errors.name?.message}
          />
          <TextInput
            label="Mobile Number"
            placeholder="Mobile (optional)"
            {...register('mobile')}
            error={errors.mobile?.message}
          />
          <TextInput
            label="PAN"
            placeholder="PAN (optional)"
            {...register('pan')}
            error={errors.pan?.message}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {initial ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
