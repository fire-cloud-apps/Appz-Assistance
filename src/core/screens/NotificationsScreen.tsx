/**
 * Notifications Screen
 * Route: /notifications
 * View and manage all in-app notifications
 */
import {
  Box,
  Text,
  Group,
  Stack,
  ActionIcon,
  Button,
  Divider,
  Title,
  ThemeIcon,
  Badge,
  Paper,
  ScrollArea,
  Alert,
} from '@mantine/core'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'
import {
  useAllNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
  useDeleteReadNotifications,
} from '../hooks/useInAppNotifications'
import { InAppNotification } from '../database/models'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export function NotificationsScreen() {
  const navigate = useNavigate()
  const { data: notifications = [], isLoading } = useAllNotifications()

  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()
  const deleteNotification = useDeleteNotification()
  const deleteAll = useDeleteAllNotifications()
  const deleteRead = useDeleteReadNotifications()

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleNavigate = (notification: InAppNotification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id)
    }
    if (notification.taskRoute) {
      navigate(notification.taskRoute)
    }
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate()
  }

  const handleDeleteAll = () => {
    if (confirm('Are you sure you want to delete all notifications?')) {
      deleteAll.mutate()
    }
  }

  const handleDeleteRead = () => {
    deleteRead.mutate()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_created':
        return { icon: 'tabler:bell-ringing', color: 'blue' }
      case 'task_updated':
        return { icon: 'tabler:bell-ringing', color: 'blue' }
      case 'task_completed':
        return { icon: 'tabler:check', color: 'green' }
      case 'task_due':
        return { icon: 'tabler:clock', color: 'orange' }
      case 'task_overdue':
        return { icon: 'tabler:bell-ringing', color: 'red' }
      default:
        return { icon: 'tabler:bell', color: 'gray' }
    }
  }

  const handleClose = () => {
    navigate(-1)
  }

  return (
    <Box p="lg">
      <Stack gap="md">
        {/* Header */}
        <Group>
          <ActionIcon variant="subtle" onClick={handleClose}>
            <Icon icon="tabler:arrow-left" width={20} />
          </ActionIcon>
          <Title order={2}>Notifications</Title>
          {unreadCount > 0 && (
            <Badge color="red" variant="filled" size="lg">
              {unreadCount}
            </Badge>
          )}
        </Group>

        {/* Actions */}
        {notifications.length > 0 && (
          <Group justify="space-between">
            <Group>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="compact-sm"
                  leftSection={<Icon icon="tabler:check" width={16} />}
                  onClick={handleMarkAllAsRead}
                  loading={markAllAsRead.isPending}
                >
                  Mark all as read
                </Button>
              )}
              <Button
                variant="outline"
                size="compact-sm"
                color="red"
                leftSection={<Icon icon="tabler:trash" width={16} />}
                onClick={handleDeleteRead}
                loading={deleteRead.isPending}
                disabled={unreadCount === notifications.length}
              >
                Clear read
              </Button>
            </Group>
            <Button
              variant="outline"
              size="compact-sm"
              color="red"
              leftSection={<Icon icon="tabler:trash" width={16} />}
              onClick={handleDeleteAll}
              loading={deleteAll.isPending}
            >
              Clear all
            </Button>
          </Group>
        )}

        <Divider />

        {/* Notifications List */}
        {isLoading ? (
          <Box p="xl" style={{ textAlign: 'center' }}>
            <Text c="dimmed">Loading notifications...</Text>
          </Box>
        ) : notifications.length === 0 ? (
          <Alert
            icon={<Icon icon="tabler:bell" width={24} />}
            title="No notifications"
            color="gray"
            variant="light"
          >
            You don&apos;t have any notifications yet.
          </Alert>
        ) : (
          <Paper withBorder shadow="sm" radius="md">
            <ScrollArea.Autosize mah={600}>
              <Stack gap={0}>
                {notifications.map((notification, index) => {
                  const iconConfig = getNotificationIcon(notification.type)

                  return (
                    <Box key={notification.id}>
                      <Group
                        gap="sm"
                        p="md"
                        wrap="nowrap"
                        onClick={() => handleNavigate(notification)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: notification.isRead
                            ? 'transparent'
                            : 'var(--mantine-color-blue-light)',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            'var(--mantine-color-default-hover)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = notification.isRead
                            ? 'transparent'
                            : 'var(--mantine-color-blue-light)')
                        }
                      >
                        <ThemeIcon
                          variant="light"
                          color={iconConfig.color}
                          radius="xl"
                          size="md"
                          style={{ flexShrink: 0 }}
                        >
                          <Icon icon={iconConfig.icon} width={18} />
                        </ThemeIcon>

                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Group gap="xs" wrap="nowrap" mb={4}>
                            <Text
                              fw={notification.isRead ? 400 : 600}
                              size="sm"
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
                          <Text size="sm" c="dimmed" lineClamp={1}>
                            {notification.message}
                          </Text>
                          <Text size="xs" c="dimmed" mt={4}>
                            {dayjs(notification.createdAt).fromNow()}
                          </Text>
                        </Box>

                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification.mutate(notification.id)
                          }}
                          aria-label="Delete notification"
                          style={{ flexShrink: 0 }}
                        >
                          <Icon icon="tabler:x" width={16} />
                        </ActionIcon>
                      </Group>
                      {index < notifications.length - 1 && (
                        <Divider opacity={0.2} />
                      )}
                    </Box>
                  )
                })}
              </Stack>
            </ScrollArea.Autosize>
          </Paper>
        )}
      </Stack>
    </Box>
  )
}
