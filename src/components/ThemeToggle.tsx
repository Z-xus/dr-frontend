import { Moon, Sun } from "lucide-react"
import { Button } from "./ui/button"
import { useTheme } from "@/hooks/useTheme"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="opacity-0 w-9 h-9" />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative w-9 h-9 overflow-hidden group"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <span className="sr-only">Toggle theme</span>
      
      {/* Pixelated animation effect */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
        {Array(9).fill(0).map((_, i) => (
          <div 
            key={i} 
            className="bg-primary transition-all duration-150" 
            style={{ 
              transitionDelay: `${i * 30}ms`,
              transform: `scale(${theme === "dark" ? 0 : 1})`,
            }}
          ></div>
        ))}
      </div>
      
      <div className="transition-all duration-500 transform scale-100 absolute inset-0 flex items-center justify-center">
        {theme === "dark" ? (
          <Moon className="absolute h-5 w-5 rotate-0 scale-100 transition-all" />
        ) : (
          <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all" />
        )}
      </div>
    </Button>
  )
}