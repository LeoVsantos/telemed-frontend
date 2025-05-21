import type React from "react"
import { HospitalLogo } from "@/components/hospital-logo"

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <header className="flex h-16 items-center border-b px-6">
        <HospitalLogo className="h-8 w-auto" />
      </header>
      <main>{children}</main>
    </div>
  )
}
