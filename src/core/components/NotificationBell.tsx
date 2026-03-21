import { useState } from 'react'
import {
  ActionIcon,
  Badge,
  Popover,
  Stack,
  Text,
  Group,
  ScrollArea,
  Button,
  Box,
  Divider,
  ThemeIcon,
  Paper,
} from '@mantine/core'
import { IconBell, IconX, IconTrash, IconCheck, IconBellRinging, IconClock } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import {
  useUnreadNotificationCount,
  useTopNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useDeleteReadNotifications,
} from '../hooks/useInAppNotifications'
import { InAppNotification } from '../database/models'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

interface NotificationItemProps {
  notification: InAppNotification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  onNavigate: (route?: string | null) => void
}

function NotificationItem({ notification, onMarkAsRead, onDelete, onNavigate }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }
    onNavigate(notification.taskRoute)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_created':
        return { icon: IconBellRinging, color: 'blue' }
      case 'task_updated':
        return { icon: IconBellRinging, color: 'blue' }
      case 'task_completed':
        return { icon: IconCheck, color: 'green' }
      case 'task_due':
        return { icon: IconClock, color: 'orange' }
      case 'task_overdue':
        return { icon: IconBellRinging, color: 'red' }
      default:
        return { icon: IconBellRinging, color: 'gray' }
    }
  }

  const iconConfig = getNotificationIcon(notification.type)
  const IconComponent = iconConfig.icon

  return (
    <Box 
      onClick={handleClick}
      style={{
        width: '100%',
        borderRadius: 'var(--mantine-radius-md)',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <Box p="xs">
        <Group justify="space-between" wrap="nowrap" gap="sm">
          <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <ThemeIcon 
              variant="light" 
              color={iconConfig.color} 
              radius="xl" 
              size="sm"
              style={{ flexShrink: 0 }}
            >
              <IconComponent size={14} />
            </ThemeIcon>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Group gap="xs" wrap="nowrap" mb={2}>
                <Text 
                  fw={notification.isRead ? 400 : 600} 
                  size="xs" 
                  lineClamp={1}
                >
                  {notification.title}
                </Text>
                {!notification.isRead && (
                  <Badge 
                    size="sm" 
                    variant="filled" 
                    color={iconConfig.color}
                    style={{ flexShrink: 0 }}
                  >
                    New
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed" lineClamp={1}>
                {notification.message}
              </Text>
              <Text size="xxs" c="dimmed" mt={2}>
                {dayjs(notification.createdAt).fromNow()}
              </Text>
            </Box>
          </Group>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="xs"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(notification.id)
            }}
            aria-label="Delete notification"
            style={{ flexShrink: 0 }}
          >
            <IconX size={14} />
          </ActionIcon>
        </Group>
      </Box>
    </Box>
  )
}

export function NotificationBell() {
  const [opened, setOpened] = useState(false)
  const navigate = useNavigate()

  const { data: unreadCount = 0, isLoading: isLoadingCount } = useUnreadNotificationCount()
  const { data: notifications = [], isLoading: isLoadingNotifications } = useTopNotifications(5)

  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()
  const deleteNotification = useDeleteNotification()
  const deleteRead = useDeleteReadNotifications()

  const handleNavigate = (route?: string | null) => {
    if (route) {
      navigate(route)
      setOpened(false)
    }
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate()
  }

  const handleDeleteRead = () => {
    deleteRead.mutate()
  }

  const hasNotifications = notifications.length > 0
  const hasUnread = unreadCount > 0
  const isLoading = isLoadingCount || isLoadingNotifications

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      withArrow
      shadow="md"
      width={320}
      withinPortal
      zIndex={2000}
    >
      <Popover.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="Notifications"
          pos="relative"
          onClick={() => setOpened(true)}
        >
          <IconBell size={20} />
          {hasUnread && (
            <Badge
              color="red"
              size="sm"
              variant="filled"
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 18,
                height: 18,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown>
        <Paper p="xs" radius="md" withBorder shadow="md">
          <Stack gap={0}>
            {/* Header */}
            <Group justify="space-between" p="xs">
              <Text fw={600} size="sm">
                Notifications
              </Text>
              <Group gap="xs">
                {hasUnread && (
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    loading={markAllAsRead.isPending}
                    aria-label="Mark all as read"
                  >
                    <IconCheck size={16} />
                  </ActionIcon>
                )}
                {hasNotifications && (
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={handleDeleteRead}
                    loading={deleteRead.isPending}
                    aria-label="Clear read notifications"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </Group>
            </Group>

            <Divider />

            {/* Notifications List */}
            <ScrollArea.Autosize mah={350}>
              <Stack gap={0}>
                {isLoading ? (
                  <Box p="md" style={{ textAlign: 'center' }}>
                    <Text c="dimmed" size="xs">Loading...</Text>
                  </Box>
                ) : !hasNotifications ? (
                  <Box p="md" style={{ textAlign: 'center' }}>
                    <IconBell size={24} color="var(--mantine-color-gray-5)" />
                    <Text c="dimmed" mt="xs" size="xs">
                      No notifications
                    </Text>
                  </Box>
                ) : (
                  notifications.map((notification, index) => (
                    <Box key={notification.id}>
                      <NotificationItem
                        notification={notification}
                        onMarkAsRead={(id) => markAsRead.mutate(id)}
                        onDelete={(id) => deleteNotification.mutate(id)}
                        onNavigate={handleNavigate}
                      />
                      {index < notifications.length - 1 && (
                        <Divider mx="xs" opacity={0.2} />
                      )}
                    </Box>
                  ))
                )}
              </Stack>
            </ScrollArea.Autosize>

            {hasNotifications && (
              <>
                <Divider />
                <Box p="xs">
                  <Button
                    variant="light"
                    size="xs"
                    fullWidth
                    onClick={() => navigate('/notifications')}
                    leftSection={<IconBellRinging size={14} />}
                  >
                    View all
                  </Button>
                </Box>
              </>
            )}
          </Stack>
        </Paper>
      </Popover.Dropdown>
    </Popover>
  )
}
