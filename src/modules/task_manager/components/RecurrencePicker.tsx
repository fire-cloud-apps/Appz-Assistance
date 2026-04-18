import { useState, useEffect } from 'react'
import {
  Modal,
  Button,
  Select,
  NumberInput,
  Group,
  Stack,
  Text,
  Divider,
  Radio,
  Box,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import {
  RecurrencePattern,
  RecurrenceFrequency,
  RecurrenceWeeklyDay,
} from '../data/models'
import { getRecurrenceLabel, getDayOfWeek } from '../../../core/utils/recurrenceHelper'
import dayjs from 'dayjs'

interface RecurrencePickerProps {
  opened: boolean
  onClose: () => void
  onSave: (pattern: RecurrencePattern | null, endDate: string | null) => void
  initialPattern?: RecurrencePattern | null
  initialEndDate?: string | null
  dueDate?: string | null
}

export function RecurrencePicker({
  opened,
  onClose,
  onSave,
  initialPattern,
  initialEndDate,
  dueDate,
}: RecurrencePickerProps) {
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('weekly')
  const [interval, setInterval] = useState(1)
  const [weeklyDays, setWeeklyDays] = useState<RecurrenceWeeklyDay[]>([])
  const [monthlyDay, setMonthlyDay] = useState(1)
  const [endType, setEndType] = useState<'never' | 'onDate'>('never')
  const [endDate, setEndDate] = useState<string | null>(null)

  // Initialize from existing pattern
  useEffect(() => {
    if (initialPattern) {
      setFrequency(initialPattern.frequency)
      setInterval(initialPattern.interval || 1)
      setWeeklyDays(initialPattern.weeklyDays || [])
      setMonthlyDay(initialPattern.monthlyDay || 1)
    } else {
      // Defaults
      const parsedDueDate = dueDate ? dayjs(dueDate, 'YYYY-MM-DD') : null
      setFrequency('weekly')
      setInterval(1)
      setWeeklyDays(parsedDueDate?.isValid() ? [getDayOfWeek(parsedDueDate.toDate())] : ['mon'])
      setMonthlyDay(parsedDueDate?.isValid() ? parsedDueDate.date() : 1)
    }

    if (initialEndDate) {
      setEndType('onDate')
      setEndDate(initialEndDate)
    } else {
      setEndType('never')
      setEndDate(null)
    }
  }, [initialPattern, initialEndDate, dueDate, opened])

  const handleSave = () => {
    const pattern: RecurrencePattern = {
      frequency,
      interval,
      weeklyDays: frequency === 'weekly' ? weeklyDays : undefined,
      monthlyDay: frequency === 'monthly' ? monthlyDay : undefined,
    }

    onSave(pattern, endType === 'onDate' ? endDate : null)
  }

  const handleClear = () => {
    onSave(null, null)
  }

  const getIntervalLabel = () => {
    switch (frequency) {
      case 'daily':
        return interval === 1 ? 'day' : 'days'
      case 'weekly':
        return interval === 1 ? 'week' : 'weeks'
      case 'monthly':
        return interval === 1 ? 'month' : 'months'
      case 'yearly':
        return interval === 1 ? 'year' : 'years'
    }
  }

  const getMonthlyDayOptions = () => {
    let daysInMonth = 31
    if (dueDate) {
      const parsedDate = dayjs(dueDate, 'YYYY-MM-DD')
      if (parsedDate.isValid()) {
        daysInMonth = parsedDate.daysInMonth()
      }
    }
    return Array.from({ length: daysInMonth }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}${getOrdinal(i + 1)}`,
    }))
  }

  const getOrdinal = (num: number) => {
    const j = num % 10
    const k = num % 100
    if (j === 1 && k !== 11) return 'st'
    if (j === 2 && k !== 12) return 'nd'
    if (j === 3 && k !== 13) return 'rd'
    return 'th'
  }

  const toggleWeeklyDay = (day: RecurrenceWeeklyDay) => {
    setWeeklyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Repeat Task"
      size="sm"
      centered
    >
      <Stack gap="md">
        {/* Frequency Selection */}
        <Radio.Group
          value={frequency}
          onChange={(value) => setFrequency(value as RecurrenceFrequency)}
        >
          <Stack gap="xs">
            <Radio value="daily" label="Daily" />
            <Radio value="weekly" label="Weekly" />
            <Radio value="monthly" label="Monthly" />
            <Radio value="yearly" label="Yearly" />
          </Stack>
        </Radio.Group>

        <Divider />

        {/* Interval Selection */}
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Repeat every
          </Text>
          <Group gap="xs" align="flex-end">
            <NumberInput
              value={interval}
              onChange={(value) => setInterval(Number(value) || 1)}
              min={1}
              max={365}
              w={80}
            />
            <Text size="sm" c="dimmed">
              {getIntervalLabel()}
            </Text>
          </Group>
        </Box>

        {/* Weekly Days Selection */}
        {frequency === 'weekly' && (
          <Box>
            <Text size="sm" fw={500} mb="xs">
              Repeat on
            </Text>
            <Group gap="xs">
              {(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as RecurrenceWeeklyDay[]).map((day) => {
                const dayLabels: Record<RecurrenceWeeklyDay, string> = {
                  sun: 'S',
                  mon: 'M',
                  tue: 'T',
                  wed: 'W',
                  thu: 'T',
                  fri: 'F',
                  sat: 'S',
                }
                return (
                  <Button
                    key={day}
                    variant={weeklyDays.includes(day) ? 'filled' : 'outline'}
                    size="compact-sm"
                    w={36}
                    h={36}
                    onClick={() => toggleWeeklyDay(day)}
                  >
                    {dayLabels[day]}
                  </Button>
                )
              })}
            </Group>
          </Box>
        )}

        {/* Monthly Day Selection */}
        {frequency === 'monthly' && (
          <Box>
            <Text size="sm" fw={500} mb="xs">
              Day of month
            </Text>
            <Select
              value={monthlyDay.toString()}
              onChange={(value) => setMonthlyDay(Number(value) || 1)}
              data={getMonthlyDayOptions().map((d) => ({
                value: d.value.toString(),
                label: d.label,
              }))}
              w={150}
            />
          </Box>
        )}

        <Divider />

        {/* End Date Selection */}
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Ends
          </Text>
          <Radio.Group
            value={endType}
            onChange={(value) => setEndType(value as 'never' | 'onDate')}
          >
            <Stack gap="xs">
              <Radio value="never" label="Never" />
              <Radio value="onDate" label="On date" />
              {endType === 'onDate' && (
                <Box ml="xl">
                  <DateInput
                    value={endDate ? dayjs(endDate, 'YYYY-MM-DD').toDate() : null}
                    onChange={(value) => setEndDate(value ? dayjs(value).format('YYYY-MM-DD') : null)}
                    minDate={dueDate ? dayjs(dueDate, 'YYYY-MM-DD').toDate() : new Date()}
                    valueFormat="YYYY-MM-DD"
                    placeholder="Select end date"
                    w={200}
                  />
                </Box>
              )}
            </Stack>
          </Radio.Group>
        </Box>

        {/* Preview */}
        {frequency && (
          <Box>
            <Text size="sm" fw={500} mb="xs">
              Preview
            </Text>
            <Text size="sm" c="dimmed">
              {getRecurrenceLabel({
                frequency,
                interval,
                weeklyDays: frequency === 'weekly' ? weeklyDays : undefined,
                monthlyDay: frequency === 'monthly' ? monthlyDay : undefined,
              })}
              {endType === 'onDate' && endDate
                ? ` until ${dayjs(endDate, 'YYYY-MM-DD').format('DD MMM YYYY')}`
                : ''}
            </Text>
          </Box>
        )}

        {/* Actions */}
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="light" color="red" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={handleSave} disabled={weeklyDays.length === 0 && frequency === 'weekly'}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
