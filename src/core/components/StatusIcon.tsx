/**
 * Shared component for status icons
 * Used by: TaskStatsGrid, TaskAllTasksScreen, TaskGroupTasksScreen
 */
type StatusIconProps = {
  icon: string
  size?: number
  color?: string
  label?: string
}

export function StatusIcon({ icon, size = 20, color, label }: StatusIconProps) {
  return (
    <iconify-icon
      icon={icon}
      width={size}
      height={size}
      style={{ color }}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    />
  )
}
