"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type HospitalTheme = {
  name: string
  logo: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  domain?: string
}

// Default theme as fallback
const defaultTheme: HospitalTheme = {
  name: "General Hospital",
  logo: "/placeholder.svg?height=40&width=180",
  primaryColor: "#0ea5e9", // sky-500
  secondaryColor: "#0369a1", // sky-700
  accentColor: "#38bdf8", // sky-400
}

type HospitalThemeContextType = {
  theme: HospitalTheme
  setTheme: (theme: HospitalTheme) => void
}

const HospitalThemeContext = createContext<HospitalThemeContextType | undefined>(undefined)

export function HospitalThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState<HospitalTheme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  // Effect to load hospital theme based on domain or token
  useEffect(() => {
    setMounted(true)

    // In a real app, you would fetch the hospital theme based on:
    // 1. The current domain
    // 2. A token in the URL or localStorage

    // For demo purposes, we'll just use the default theme
    // This would be replaced with an API call in production

    // Example:
    // const fetchHospitalTheme = async () => {
    //   const domain = window.location.hostname;
    //   const response = await fetch(`/api/hospital-theme?domain=${domain}`);
    //   const data = await response.json();
    //   setTheme(data);
    // };
    // fetchHospitalTheme();
  }, [])

  // Apply CSS variables for the theme colors
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement
      root.style.setProperty("--hospital-primary", theme.primaryColor)
      root.style.setProperty("--hospital-secondary", theme.secondaryColor)
      root.style.setProperty("--hospital-accent", theme.accentColor)
    }
  }, [theme, mounted])

  // Avoid rendering with default theme on server
  if (!mounted) {
    return null
  }

  return <HospitalThemeContext.Provider value={{ theme, setTheme }}>{children}</HospitalThemeContext.Provider>
}

export function useHospitalTheme() {
  const context = useContext(HospitalThemeContext)
  if (context === undefined) {
    throw new Error("useHospitalTheme must be used within a HospitalThemeProvider")
  }
  return context
}
