import { useState, useEffect } from 'react'
import { Autocomplete, Group, Text, Loader, Box } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'

interface IconPickerProps {
  label?: string
  placeholder?: string
  value?: string
  onChange: (value: string) => void
  error?: string
  style?: React.CSSProperties
}

export function IconPicker({ label, placeholder, value, onChange, error, style }: IconPickerProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 500)
  const [loading, setLoading] = useState(false)
  const [icons, setIcons] = useState<string[]>([])

  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setIcons([])
      return
    }

    const fetchIcons = async () => {
      setLoading(true)
      try {
        const response = await fetch(`https://api.iconify.design/search?query=${debouncedSearch}&limit=32`)
        const data = await response.json()
        setIcons(data.icons || [])
      } catch (error) {
        console.error('Error fetching icons:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchIcons()
  }, [debouncedSearch])

  return (
    <Box style={style}>
      <Autocomplete
        label={label}
        placeholder={placeholder}
        value={value || search}
        onChange={(val) => {
          setSearch(val)
          onChange(val)
        }}
        data={icons}
        error={error}
        rightSection={loading ? <Loader size="xs" /> : (
          value && <iconify-icon icon={value} width="20" height="20" />
        )}
        renderOption={({ option }) => (
          <Group gap="sm">
            <iconify-icon icon={option.value} width="20" height="20" />
            <Text size="sm">{option.value}</Text>
          </Group>
        )}
        maxDropdownHeight={300}
      />
    </Box>
  )
}
