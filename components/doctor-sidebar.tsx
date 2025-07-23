"use client"

import { usePathname } from "next/navigation"
import { BrandLogo } from "./brand-logo"
import { Button } from "@/components/ui/button"
import { Calendar, ClipboardList, Home, Settings, Users } from "lucide-react"
import Link from "next/link"

export function DoctorSidebar() {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/doctor/dashboard", icon: Home },
    { name: "Appointments", href: "/doctor/appointments", icon: Calendar },
    { name: "Patients", href: "/doctor/patients", icon: Users },
    { name: "Medical Records", href: "/doctor/records", icon: ClipboardList },
    { name: "Settings", href: "/doctor/settings", icon: Settings },
  ]

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-4">
        <BrandLogo className="h-8 w-auto" />
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto py-4">
        <nav className="flex-1 space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start ${isActive ? "bg-[var(--hospital-accent)] bg-opacity-20" : ""}`}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                  {item.name}
                </Link>
              </Button>
            )
          })}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <span className="text-sm font-medium">DR</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Dr. Jane Smith</p>
              <p className="text-xs text-muted-foreground">Cardiology</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
