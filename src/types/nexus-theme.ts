export type NexusThemeMode = 'light' | 'dark'

export interface NexusThemeConfig {
  mode: NexusThemeMode
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: {
      primary: string
      secondary: string
      muted: string
    }
    border: string
    success: string
    warning: string
    error: string
  }
}

export interface NexusThemeContextValue {
  theme: NexusThemeMode
  setTheme: (theme: NexusThemeMode) => void
  toggleTheme: () => void
  isDark: boolean
  isLight: boolean
  isLoading: boolean
}