import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'
import {
  Modal,
  NumberInput,
  Select,
  Button,
  Group,
  Stack,
  TextInput,
} from '@mantine/core'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Investor, Portfolio, SIP } from '../../domain/entities'

const sipFormSchema = z.object({
  name: z.string().optional(),
  investorId: z.string().min(1, 'Investor is required'),
  portfolioId: z.string().min(1, 'Portfolio is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  frequency: z.enum(['Monthly', 'Quarterly']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  status: z.enum(['Active', 'Inactive']),
})

type SIPFormValues = z.infer<typeof sipFormSchema>

interface SIPModalProps {
  opened: boolean
  onClose: () => void
  investors: Investor[]
  portfolios: Portfolio[]
  initial?: SIP | null
  onSubmit: (sip: SIP) => Promise<void>
}

function generateSipName(portfolio: Portfolio | undefined, amount: number, startDate: string): string {
  if (!portfolio || !startDate) return ''
  
  const amcShort = portfolio.amcName || 'N/A'
  const schemeShort = portfolio.scheme.length > 20 ? portfolio.scheme.substring(0, 20) + '...' : portfolio.scheme
  const formattedDate = dayjs(startDate).format('DD-MM-YYYY')
  
  return `${amcShort} (${schemeShort}) - ${amount} - (${formattedDate})`
}

export function SIPModal({ opened, onClose, investors, portfolios, initial, onSubmit }: SIPModalProps) {
  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SIPFormValues>({
    resolver: zodResolver(sipFormSchema),
    defaultValues: {
      name: initial?.name ?? '',
      investorId: initial?.investorId ?? '',
      portfolioId: initial?.portfolioId ?? '',
      amount: initial?.amount ?? 0,
      frequency: initial?.frequency ?? 'Monthly',
      startDate: initial?.startDate ?? '',
      endDate: initial?.endDate ?? '',
      status: initial?.status ?? 'Active',
    },
  })

  useEffect(() => {
    if (opened) {
      reset({
        name: initial?.name ?? '',
        investorId: initial?.investorId ?? '',
        portfolioId: initial?.portfolioId ?? '',
        amount: initial?.amount ?? 0,
        frequency: initial?.frequency ?? 'Monthly',
        startDate: initial?.startDate ?? '',
        endDate: initial?.endDate ?? '',
        status: initial?.status ?? 'Active',
      })
    }
  }, [opened, initial, reset])

  const selectedInvestorId = watch('investorId')
  const selectedPortfolioId = watch('portfolioId')
  const amount = watch('amount')
  const startDate = watch('startDate')
  const name = watch('name')

  // Auto-generate SIP name when portfolio, amount, or start date changes (only for new SIPs)
  useEffect(() => {
    if (!initial && selectedPortfolioId && amount > 0 && startDate) {
      const portfolio = portfolios.find(p => p.id === selectedPortfolioId)
      const generatedName = generateSipName(portfolio, amount, startDate)
      if (generatedName && !name) {
        setValue('name', generatedName)
      }
    }
  }, [selectedPortfolioId, amount, startDate, portfolios, initial, name, setValue])

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

  const submitHandler = async (values: SIPFormValues) => {
    const portfolio = portfolios.find((item) => item.id === values.portfolioId)
    if (portfolio && portfolio.investorId !== values.investorId) {
      setError('portfolioId', { message: 'Selected portfolio does not belong to investor.' })
      return
    }

    // Auto-generate name if not provided
    let finalName = values.name
    if (!finalName && portfolio && values.startDate) {
      finalName = generateSipName(portfolio, values.amount, values.startDate)
    }

    const payload: SIP = {
      id: initial?.id ?? crypto.randomUUID(),
      name: finalName || 'Untitled SIP',
      investorId: values.investorId,
      portfolioId: values.portfolioId,
      amount: values.amount,
      frequency: values.frequency,
      startDate: values.startDate,
      endDate: values.endDate ? values.endDate : undefined,
      status: values.status,
    }

    await onSubmit(payload)
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title={initial ? 'Edit SIP' : 'Add SIP'} size="md">
      <form onSubmit={handleSubmit(submitHandler)}>
        <Stack gap="md">
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextInput
                label="SIP Name"
                placeholder="Auto-generated or enter custom name"
                value={field.value}
                onChange={field.onChange}
                error={errors.name?.message}
                description="Auto-filled from portfolio details, or customize your own"
              />
            )}
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
          <Controller
            control={control}
            name="portfolioId"
            render={({ field }) => (
              <Select
                label="Portfolio"
                placeholder="Select portfolio"
                data={portfolioOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.portfolioId?.message}
                searchable
              />
            )}
          />
          <Group grow>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <NumberInput
                  label="Amount"
                  min={0}
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? 0)}
                  error={errors.amount?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="frequency"
              render={({ field }) => (
                <Select
                  label="Frequency"
                  data={[
                    { value: 'Monthly', label: 'Monthly' },
                    { value: 'Quarterly', label: 'Quarterly' },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.frequency?.message}
                />
              )}
            />
          </Group>
          <Group grow>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <TextInput
                  label="Start Date"
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.startDate?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <TextInput
                  label="End Date"
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Group>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                label="Status"
                data={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
                value={field.value}
                onChange={field.onChange}
                error={errors.status?.message}
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
