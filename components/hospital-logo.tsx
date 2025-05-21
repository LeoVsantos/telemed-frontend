"use client"

import Image from "next/image"
import { useHospitalTheme } from "./hospital-theme-provider"

export function HospitalLogo({ className }: { className?: string }) {
  const { theme } = useHospitalTheme()

  return (
    <div className={className}>
      <Image
        src={theme.logo || "/placeholder.svg"}
        alt={`${theme.name} Logo`}
        width={180}
        height={40}
        className="h-full w-auto"
        priority
      />
    </div>
  )
}
