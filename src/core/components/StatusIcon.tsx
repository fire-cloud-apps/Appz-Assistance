import { Icon } from '@iconify/react'

type StatusIconProps = {
  icon: string
  size?: number
  color?: string
  label?: string
}

export function StatusIcon({ icon, size = 20, color, label }: StatusIconProps) {
  return (
    <Icon
      icon={icon}
      width={size}
      height={size}
      color={color}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    />
  )
}
