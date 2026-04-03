/**
 * Navigation menu component
 * Ref: MainLayout.tsx
 */
import {
  Box,
  UnstyledButton,
  Text,
  Stack,
  Divider,
  ScrollArea,
  Tooltip,
  Collapse,
  Group,
} from '@mantine/core'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatusIcon } from '../components/StatusIcon'
import classes from './ModuleMenu.module.css'

interface ModuleChild {
  id: string
  label: string
  path: string
  icon?: string
  disabled?: boolean
}

interface Module {
  id: string
  label: string
  icon: string
  path: string
  disabled?: boolean
  children?: ModuleChild[]
}

interface ModuleGroup {
  id: string
  label: string
  modules: Module[]
}

interface ModuleMenuProps {
  moduleGroups: ModuleGroup[]
  activeModule: string
  activePath: string
  onModuleClick: (id: string, path: string, disabled?: boolean) => void
}

export function ModuleMenu({ moduleGroups, activeModule, activePath, onModuleClick }: ModuleMenuProps) {
  const navigate = useNavigate()
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

  const toggleExpanded = (id: string) => {
    setExpandedModules((prev) => {
      const current = prev[id] ?? (activeModule === id)
      return { ...prev, [id]: !current }
    })
  }

  return (
    <ScrollArea h="calc(100vh - 80px)" type="scroll">
      <Stack gap="xs">
        <UnstyledButton
          className={classes.moduleLink}
          data-active={activePath === '/home' || undefined}
          onClick={() => navigate('/home')}
          w="100%"
        >
          <Box component="span" style={{ fontSize: '1.25rem' }}>
            📊
          </Box>
          <Text className={classes.moduleLabel} size="sm">
            Home
          </Text>
        </UnstyledButton>

        {moduleGroups.map((group) => (
          <Box key={group.id}>
            <Text size="xs" c="dimmed" fw={600} px="xs" py={4}>
              {group.label}
            </Text>
            <Stack gap={2}>
              {group.modules.map((module) => {
                const hasChildren = !!module.children && module.children.length > 0
                const isExpanded = expandedModules[module.id] ?? (activeModule === module.id)

                return (
                  <Box key={module.id}>
                    <Tooltip
                      label={module.disabled ? 'Coming Soon' : ''}
                      disabled={!module.disabled}
                      position="right"
                    >
                      <UnstyledButton
                        className={classes.moduleLink}
                        data-active={activeModule === module.id || undefined}
                        data-disabled={module.disabled || undefined}
                        onClick={() => onModuleClick(module.id, module.path, module.disabled)}
                        w="100%"
                      >
                        <Box component="span" style={{ fontSize: '1.25rem' }}>
                          {module.icon}
                        </Box>
                        <Text className={classes.moduleLabel} size="sm">
                          {module.label}
                        </Text>
                        {hasChildren && !module.disabled && (
                          <Box
                            component="span"
                            style={{ marginLeft: 'auto', display: 'inline-flex' }}
                            onClick={(event) => {
                              event.preventDefault()
                              event.stopPropagation()
                              toggleExpanded(module.id)
                            }}
                          >
                            {isExpanded ? <iconify-icon icon="lucide:chevron-down" width="16" height="16" /> : <iconify-icon icon="lucide:chevron-right" width="16" height="16" />}
                          </Box>
                        )}
                        {module.disabled && (
                          <iconify-icon icon="lucide:lock" width="14" height="14" className={classes.lockIcon} />
                        )}
                      </UnstyledButton>
                    </Tooltip>

                    {hasChildren && (
                      <Collapse in={isExpanded}>
                        <Stack gap={2} mt={4} pl={28}>
                          {module.children!.map((child) => (
                            <UnstyledButton
                              key={child.id}
                              className={classes.moduleLink}
                              data-active={activePath === child.path || undefined}
                              data-disabled={child.disabled || undefined}
                              onClick={() => onModuleClick(module.id, child.path, child.disabled)}
                              w="100%"
                              style={{ fontSize: '0.875rem' }}
                            >
                              <Group gap={6} wrap="nowrap">
                                {child.icon && (
                                  <StatusIcon icon={child.icon} size={14} />
                                )}
                                <Text className={classes.moduleLabel} size="xs">
                                  {child.label}
                                </Text>
                              </Group>
                              {child.disabled && (
                                <iconify-icon icon="lucide:lock" width="12" height="12" className={classes.lockIcon} />
                              )}
                            </UnstyledButton>
                          ))}
                        </Stack>
                      </Collapse>
                    )}
                  </Box>
                )
              })}
            </Stack>
          </Box>
        ))}

        <Divider my="sm" />

        <Box px="sm" py="xs">
          <Text size="xs" c="dimmed" fw={600}>
            ACCOUNT
          </Text>
        </Box>

        <UnstyledButton
          className={classes.moduleLink}
          onClick={() => navigate('/profile')}
          w="100%"
        >
          <Box component="span" style={{ fontSize: '1.25rem' }}>
            👤
          </Box>
          <Text className={classes.moduleLabel} size="sm">
            Profile
          </Text>
        </UnstyledButton>

        <UnstyledButton
          className={classes.moduleLink}
          onClick={() => navigate('/settings')}
          w="100%"
        >
          <Box component="span" style={{ fontSize: '1.25rem' }}>
            ⚙️
          </Box>
          <Text className={classes.moduleLabel} size="sm">
            Settings
          </Text>
        </UnstyledButton>
      </Stack>
    </ScrollArea>
  )
}
