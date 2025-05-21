"use client"

import { usePathname } from "next/navigation"
import { HospitalLogo } from "./hospital-logo"
import { Button } from "@/components/ui/button"
import { BarChart, Building, Calendar, Home, Settings, Users } from "lucide-react"
import Link from "next/link"

export function AdminSidebar() {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Hospitals", href: "/admin/hospitals", icon: Building },
    { name: "Hospital Branding", href: "/admin/hospital-branding", icon: Settings },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Appointments", href: "/admin/appointments", icon: Calendar },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart },
  ]

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center space-x-2">
          <HospitalLogo className="h-8 w-auto" />
          <span className="font-medium">Admin</span>
        </div>
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
            <div className="h-8 w-8 rounded-full bg-[var(--hospital-primary)] flex items-center justify-center text-white">
              <span className="text-sm font-medium">AD</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">System Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
