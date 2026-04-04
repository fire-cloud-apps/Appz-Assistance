import { useEffect } from 'react'
import {
  Modal,
  TextInput,
  NumberInput,
  Select,
  Button,
  Group,
  Stack,
} from '@mantine/core'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Investor, Portfolio } from '../../domain/entities'

const portfolioFormSchema = z.object({
  amcName: z.string().min(1, 'AMC name is required'),
  scheme: z.string().min(1, 'Scheme is required'),
  type: z.string().min(1, 'Type is required'),
  folio: z.string().min(1, 'Folio is required'),
  investorId: z.string().min(1, 'Investor is required'),
  unitBalance: z.number().nonnegative(),
  navDate: z.string().min(1, 'NAV date is required'),
  currentValue: z.number().nonnegative(),
  costValue: z.number().nonnegative(),
  appreciation: z.number(),
  weightedAvg: z.number(),
  xirr: z.number(),
})

type PortfolioFormValues = z.infer<typeof portfolioFormSchema>

interface PortfolioModalProps {
  opened: boolean
  onClose: () => void
  investors: Investor[]
  initial?: Portfolio | null
  onSubmit: (portfolio: Portfolio) => Promise<void>
}

export function PortfolioModal({ opened, onClose, investors, initial, onSubmit }: PortfolioModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      amcName: initial?.amcName ?? '',
      scheme: initial?.scheme ?? '',
      type: initial?.type ?? '',
      folio: initial?.folio ?? '',
      investorId: initial?.investorId ?? '',
      unitBalance: initial?.unitBalance ?? 0,
      navDate: initial?.navDate ?? '',
      currentValue: initial?.currentValue ?? 0,
      costValue: initial?.costValue ?? 0,
      appreciation: initial?.appreciation ?? 0,
      weightedAvg: initial?.weightedAvg ?? 0,
      xirr: initial?.xirr ?? 0,
    },
  })

  useEffect(() => {
    if (opened) {
      reset({
        amcName: initial?.amcName ?? '',
        scheme: initial?.scheme ?? '',
        type: initial?.type ?? '',
        folio: initial?.folio ?? '',
        investorId: initial?.investorId ?? '',
        unitBalance: initial?.unitBalance ?? 0,
        navDate: initial?.navDate ?? '',
        currentValue: initial?.currentValue ?? 0,
        costValue: initial?.costValue ?? 0,
        appreciation: initial?.appreciation ?? 0,
        weightedAvg: initial?.weightedAvg ?? 0,
        xirr: initial?.xirr ?? 0,
      })
    }
  }, [opened, initial, reset])

  const investorOptions = investors.map((investor) => ({
    value: investor.id,
    label: investor.name,
  }))

  const submitHandler = async (values: PortfolioFormValues) => {
    const payload: Portfolio = {
      id: initial?.id ?? crypto.randomUUID(),
      amcName: values.amcName,
      scheme: values.scheme,
      type: values.type,
      folio: values.folio,
      investorId: values.investorId,
      unitBalance: values.unitBalance,
      navDate: values.navDate,
      currentValue: values.currentValue,
      costValue: values.costValue,
      appreciation: values.appreciation,
      weightedAvg: values.weightedAvg,
      xirr: values.xirr,
    }

    await onSubmit(payload)
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title={initial ? 'Edit Portfolio' : 'Add Portfolio'} size="lg">
      <form onSubmit={handleSubmit(submitHandler)}>
        <Stack gap="md">
          <TextInput
            label="AMC Name"
            placeholder="e.g. ABC Mutual"
            {...register('amcName')}
            error={errors.amcName?.message}
          />
          <TextInput
            label="Scheme"
            placeholder="Scheme name"
            {...register('scheme')}
            error={errors.scheme?.message}
          />
          <TextInput
            label="Type"
            placeholder="Equity, Debt, Hybrid"
            {...register('type')}
            error={errors.type?.message}
          />
          <TextInput
            label="Folio"
            placeholder="Folio number"
            {...register('folio')}
            error={errors.folio?.message}
          />
          <Controller
            control={control}
            name="investorId"
            render={({ field }) => (
              <Select
                label="Investor"
                placeholder="Select investor"
                data={investorOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.investorId?.message}
              />
            )}
          />
          <Group grow>
            <Controller
              control={control}
              name="unitBalance"
              render={({ field }) => (
                <NumberInput
                  label="Unit Balance"
                  min={0}
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? 0)}
                  error={errors.unitBalance?.message}
                />
              )}
            />
            <TextInput
              label="NAV Date"
              type="date"
              {...register('navDate')}
              error={errors.navDate?.message}
            />
          </Group>
          <Group grow>
            <Controller
              control={control}
              name="currentValue"
              render={({ field }) => (
                <NumberInput
                  label="Current Value"
                  min={0}
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? 0)}
                  error={errors.currentValue?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="costValue"
              render={({ field }) => (
                <NumberInput
                  label="Cost Value"
                  min={0}
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? 0)}
                  error={errors.costValue?.message}
                />
              )}
            />
          </Group>
          <Group grow>
            <Controller
              control={control}
              name="appreciation"
              render={({ field }) => (
                <NumberInput
                  label="Appreciation"
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? 0)}
                  error={errors.appreciation?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="weightedAvg"
              render={({ field }) => (
                <NumberInput
                  label="Weighted Avg"
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? 0)}
                  error={errors.weightedAvg?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="xirr"
              render={({ field }) => (
                <NumberInput
                  label="XIRR"
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? 0)}
                  error={errors.xirr?.message}
                />
              )}
            />
          </Group>
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
