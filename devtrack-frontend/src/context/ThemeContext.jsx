import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

/**
 * Resolves the effective theme ('light' | 'dark') for a given setting.
 * 'system' reads the OS/browser preference.
 */
function resolveTheme(setting) {
  if (setting === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return setting // 'light' | 'dark'
}

/** Applies or removes the 'dark' class on <html> */
function applyTheme(setting) {
  const resolved = resolveTheme(setting)
  const root = document.documentElement
  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function ThemeProvider({ children }) {
  // Read persisted setting from localStorage, default to 'light'
  const [theme, setTheme] = useState(
    () => localStorage.getItem('devtrack_theme') || 'light'
  )

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem('devtrack_theme', theme)
  }, [theme])

  // Keep 'system' mode in sync if the OS preference changes
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const changeTheme = (newTheme) => setTheme(newTheme)

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
