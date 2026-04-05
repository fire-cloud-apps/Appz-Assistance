import { useEffect, useMemo } from 'react'
import {
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  MultiSelect,
  Button,
  Group,
  Stack,
} from '@mantine/core'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FinancialGoal, Investor, Portfolio, SIP } from '../../domain/entities'

const goalFormSchema = z
  .object({
    investorId: z.string().min(1, 'Investor is required'),
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    startDate: z.string().min(1, 'Start date is required'),
    targetDate: z.string().min(1, 'Target date is required'),
    targetAmount: z.number().positive('Target amount must be greater than 0'),
    sipIds: z.array(z.string()).optional(),
    portfolioIds: z.array(z.string()).min(1, 'Goal must have portfolios'),
  })
  .refine((data) => data.targetDate > data.startDate, {
    message: 'Target date must be after start date',
    path: ['targetDate'],
  })

type GoalFormValues = z.infer<typeof goalFormSchema>

interface GoalModalProps {
  opened: boolean
  onClose: () => void
  investors: Investor[]
  portfolios: Portfolio[]
  sips: SIP[]
  initial?: FinancialGoal | null
  onSubmit: (goal: FinancialGoal) => Promise<void>
}

export function GoalModal({
  opened,
  onClose,
  investors,
  portfolios,
  sips,
  initial,
  onSubmit,
}: GoalModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      investorId: initial?.investorId ?? '',
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      startDate: initial?.startDate ?? '',
      targetDate: initial?.targetDate ?? '',
      targetAmount: initial?.targetAmount ?? 0,
      sipIds: initial?.sipIds ?? [],
      portfolioIds: initial?.portfolioIds ?? [],
    },
  })

  useEffect(() => {
    if (opened) {
      reset({
        investorId: initial?.investorId ?? '',
        name: initial?.name ?? '',
        description: initial?.description ?? '',
        startDate: initial?.startDate ?? '',
        targetDate: initial?.targetDate ?? '',
        targetAmount: initial?.targetAmount ?? 0,
        sipIds: initial?.sipIds ?? [],
        portfolioIds: initial?.portfolioIds ?? [],
      })
    }
  }, [opened, initial, reset])

  const selectedInvestorId = watch('investorId')

  const investorOptions = investors.map((investor) => ({
    value: investor.id,
    label: investor.name,
  }))

  const portfolioOptions = useMemo(() => {
    return portfolios
      .filter((portfolio) => !selectedInvestorId || portfolio.investorId === selectedInvestorId)
      .map((portfolio) => ({
        value: portfolio.id,
        label: `${portfolio.scheme} • ${portfolio.folio}`,
      }))
  }, [portfolios, selectedInvestorId])

  const sipOptions = useMemo(() => {
    return sips
      .filter((sip) => !selectedInvestorId || sip.investorId === selectedInvestorId)
      .map((sip) => {
        const portfolio = portfolios.find(p => p.id === sip.portfolioId)
        const portfolioName = portfolio ? portfolio.scheme : sip.portfolioId
        const startDateStr = sip.startDate ? ` (Start: ${sip.startDate})` : ''
        const endDateStr = sip.endDate ? ` - End: ${sip.endDate}` : ''
        return {
          value: sip.id,
          label: `${portfolioName} • ₹${sip.amount.toLocaleString()}${startDateStr}${endDateStr}`,
        }
      })
  }, [sips, selectedInvestorId, portfolios])

  const submitHandler = async (values: GoalFormValues) => {
    const invalidPortfolio = values.portfolioIds.find((portfolioId) => {
      const portfolio = portfolios.find((item) => item.id === portfolioId)
      return portfolio && portfolio.investorId !== values.investorId
    })

    if (invalidPortfolio) {
      setError('portfolioIds', { message: 'Selected portfolio does not belong to investor.' })
      return
    }

    const payload: FinancialGoal = {
      id: initial?.id ?? crypto.randomUUID(),
      investorId: values.investorId,
      name: values.name,
      description: values.description,
      startDate: values.startDate,
      targetDate: values.targetDate,
      targetAmount: values.targetAmount,
      sipIds: values.sipIds ?? [],
      portfolioIds: values.portfolioIds,
    }

    await onSubmit(payload)
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title={initial ? 'Edit Goal' : 'Add Goal'} size="lg">
      <form onSubmit={handleSubmit(submitHandler)}>
        <Stack gap="md">
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
          <TextInput
            label="Goal Name"
            placeholder="e.g. Retirement corpus"
            {...register('name')}
            error={errors.name?.message}
          />
          <Textarea
            label="Description"
            placeholder="Describe the goal"
            {...register('description')}
            error={errors.description?.message}
            minRows={3}
          />
          <Group grow>
            <TextInput
              label="Start Date"
              type="date"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
            <TextInput
              label="Target Date"
              type="date"
              {...register('targetDate')}
              error={errors.targetDate?.message}
            />
          </Group>
          <Controller
            control={control}
            name="targetAmount"
            render={({ field }) => (
              <NumberInput
                label="Target Amount"
                min={0}
                value={field.value}
                onChange={(value) => field.onChange(value ?? 0)}
                error={errors.targetAmount?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="portfolioIds"
            render={({ field }) => (
              <MultiSelect
                label="Portfolios"
                placeholder="Select portfolios"
                data={portfolioOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.portfolioIds?.message}
                searchable
              />
            )}
          />
          <Controller
            control={control}
            name="sipIds"
            render={({ field }) => (
              <MultiSelect
                label="SIPs"
                placeholder="Select SIPs (optional)"
                data={sipOptions}
                value={field.value}
                onChange={field.onChange}
                searchable
              />
            )}
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
