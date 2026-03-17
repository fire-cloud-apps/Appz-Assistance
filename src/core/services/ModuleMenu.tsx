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
import { IconLock, IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { useState } from 'react'
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

interface ModuleMenuProps {
  modules: Module[]
  activeModule: string
  activePath: string
  onModuleClick: (id: string, path: string, disabled?: boolean) => void
}

export function ModuleMenu({ modules, activeModule, activePath, onModuleClick }: ModuleMenuProps) {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'app-modules': true,
  })

  const toggleExpanded = (id: string) => {
    setExpandedModules((prev) => {
      const current = prev[id] ?? (activeModule === id)
      return { ...prev, [id]: !current }
    })
  }

  return (
    <ScrollArea h="calc(100vh - 80px)" type="scroll">
      <Stack gap="xs">
        <Box key="app-modules">
          <Tooltip label="" position="right">
            <UnstyledButton
              className={classes.moduleLink}
              data-active={activeModule === 'app-modules' || undefined}
              onClick={() => toggleExpanded('app-modules')}
              w="100%"
            >
              <Box component="span" style={{ fontSize: '1.25rem' }}>
                📦
              </Box>
              <Text className={classes.moduleLabel} size="sm">
                Modules
              </Text>
              <Box
                component="span"
                style={{ marginLeft: 'auto', display: 'inline-flex' }}
              >
                {expandedModules['app-modules'] ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
              </Box>
            </UnstyledButton>
          </Tooltip>

          <Collapse in={expandedModules['app-modules']}>
            <Stack gap={2} mt={4} pl={28}>
              {modules.map((module) => {
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
                      {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                    </Box>
                  )}
                  {module.disabled && (
                    <IconLock size={14} className={classes.lockIcon} />
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
                          <IconLock size={12} className={classes.lockIcon} />
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
          </Collapse>
        </Box>

        <Divider my="sm" />

        <Box px="sm" py="xs">
          <Text size="xs" c="dimmed" fw={600}>
            ACCOUNT
          </Text>
        </Box>

        <UnstyledButton
          className={classes.moduleLink}
          onClick={() => {}}
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
          onClick={() => {}}
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
