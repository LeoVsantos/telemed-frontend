"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

// Mock data for appointments
const mockAppointments = [
  {
    id: "1",
    patientName: "John Doe",
    time: "10:30 AM",
    duration: "30 min",
    status: "upcoming",
    reason: "Annual checkup",
    token: "doc-123-pat-456",
  },
  {
    id: "2",
    patientName: "Sarah Johnson",
    time: "11:15 AM",
    duration: "45 min",
    status: "upcoming",
    reason: "Follow-up consultation",
    token: "doc-123-pat-789",
  },
  {
    id: "3",
    patientName: "Michael Brown",
    time: "1:00 PM",
    duration: "30 min",
    status: "upcoming",
    reason: "Prescription renewal",
    token: "doc-123-pat-101",
  },
  {
    id: "4",
    patientName: "Emily Wilson",
    time: "2:30 PM",
    duration: "60 min",
    status: "upcoming",
    reason: "New patient consultation",
    token: "doc-123-pat-202",
  },
  {
    id: "5",
    patientName: "Robert Garcia",
    time: "4:00 PM",
    duration: "30 min",
    status: "upcoming",
    reason: "Test results review",
    token: "doc-123-pat-303",
  },
  {
    id: "6",
    patientName: "Lisa Chen",
    time: "9:00 AM",
    duration: "30 min",
    status: "completed",
    reason: "Follow-up consultation",
    token: "doc-123-pat-404",
  },
  {
    id: "7",
    patientName: "David Kim",
    time: "9:45 AM",
    duration: "45 min",
    status: "completed",
    reason: "Chronic condition management",
    token: "doc-123-pat-505",
  },
  {
    id: "8",
    patientName: "Amanda Taylor",
    time: "10:00 AM",
    duration: "30 min",
    status: "completed",
    reason: "Medication review",
    token: "doc-123-pat-606",
  },
]

export function AppointmentList() {
  const [appointments, setAppointments] = useState(mockAppointments)

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="grid grid-cols-6 bg-muted p-3 text-sm font-medium">
          <div>Patient</div>
          <div>Time</div>
          <div>Duration</div>
          <div>Reason</div>
          <div>Status</div>
          <div className="text-right">Action</div>
        </div>
        <div className="divide-y">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="grid grid-cols-6 p-3 text-sm">
              <div className="font-medium">{appointment.patientName}</div>
              <div>{appointment.time}</div>
              <div>{appointment.duration}</div>
              <div className="truncate max-w-[150px]">{appointment.reason}</div>
              <div>
                <Badge
                  variant={appointment.status === "completed" ? "outline" : "default"}
                  className={
                    appointment.status === "completed"
                      ? "bg-muted text-muted-foreground"
                      : "bg-[var(--hospital-primary)] hover:bg-[var(--hospital-primary)]"
                  }
                >
                  {appointment.status === "completed" ? "Completed" : "Upcoming"}
                </Badge>
              </div>
              <div className="text-right">
                {appointment.status === "upcoming" ? (
                  <Button
                    size="sm"
                    className="bg-[var(--hospital-primary)] hover:bg-[var(--hospital-secondary)]"
                    asChild
                  >
                    <Link href={`/consultation/${appointment.token}`}>
                      <Video className="mr-2 h-4 w-4" />
                      Start
                    </Link>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/doctor/records/${appointment.id}`}>View Record</Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
