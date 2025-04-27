import { useEffect, useState } from "react"
import { Theme, ThemeProviderContext } from "@/hooks/useTheme"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    
    // Add a transition class before changing theme
    root.classList.add("transition-colors")
    root.classList.add("duration-300")
    
    root.classList.remove("light", "dark")

    let currentTheme = theme;
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      currentTheme = systemTheme;
    }
    
    root.classList.add(currentTheme)
    root.style.colorScheme = currentTheme
    
    // Cleanup transition classes after a delay
    const timeoutId = setTimeout(() => {
      root.classList.remove("transition-colors", "duration-300")
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
