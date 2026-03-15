import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD')
}

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export const isDatePast = (date: string): boolean => {
  return dayjs().isAfter(dayjs(date), 'day')
}

export const isDateValid = (date: string): boolean => {
  return dayjs(date).isValid()
}

export const getToday = (): string => {
  return formatDate(new Date())
}
