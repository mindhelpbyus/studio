export interface GrokTheme {
  colors: {
    background: string
    surface: string
    surfaceElevated: string
    primary: string
    primaryVariant: string
    secondary: string
    textPrimary: string
    textSecondary: string
    textMuted: string
    border: string
    success: string
    warning: string
    error: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
  }
}

export interface GrokAnimations {
  duration: {
    fast: string
    normal: string
    slow: string
  }
  easing: {
    easeInOut: string
    easeOut: string
    easeIn: string
  }
  transitions: {
    default: string
    smooth: string
    bounce: string
  }
}

export type GrokThemeMode = 'light' | 'dark'

export interface GrokThemeConfig {
  mode: GrokThemeMode
  theme: GrokTheme
  animations: GrokAnimations
}