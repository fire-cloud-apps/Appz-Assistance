import { create } from 'zustand'

type ColorScheme = 'light' | 'dark' | 'auto'

interface AppState {
  colorScheme: ColorScheme
  isSidebarOpen: boolean
  isMobileMenuOpen: boolean
  activeModule: string

  setColorScheme: (scheme: ColorScheme) => void
  toggleColorScheme: () => void
  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
  openMobileMenu: () => void
  closeMobileMenu: () => void
  setActiveModule: (module: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  colorScheme: 'auto',
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  activeModule: 'task-manager',

  setColorScheme: (scheme) => set({ colorScheme: scheme }),

  toggleColorScheme: () =>
    set((state) => ({
      colorScheme: state.colorScheme === 'light' ? 'dark' : 'light',
    })),

  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  setActiveModule: (module) => set({ activeModule: module }),
}))
