import type React from "react"
import { DoctorSidebar } from "@/components/doctor-sidebar"

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <DoctorSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
