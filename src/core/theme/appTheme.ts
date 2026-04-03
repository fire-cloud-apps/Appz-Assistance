import { createTheme, MantineThemeOverride } from '@mantine/core'
import { PrimaryColor } from '../services/userSettingsService'

const baseTheme: Omit<MantineThemeOverride, 'primaryColor'> = {
  fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  defaultRadius: 'md',
  cursorType: 'pointer',
  headings: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
      },
    },
    Input: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
}

export function createAppTheme(primaryColor: PrimaryColor): MantineThemeOverride {
  return createTheme({
    ...baseTheme,
    primaryColor,
  })
}

export const theme: MantineThemeOverride = createTheme({
  ...baseTheme,
  primaryColor: 'blue',
})
