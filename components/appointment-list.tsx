"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video } from "lucide-react"
import Link from "next/link"
// Removed useState as appointments will come from props.
// import { useState } from "react" 

// Define IAppointment here if not imported from a shared location.
// This interface should match the one used in app/doctor/dashboard/page.tsx
// and app/patient/appointment/page.tsx
export interface IAppointment {
  id: string;
  patientName?: string; // For doctor's view
  doctorName?: string;  // For patient's view
  doctor?: { name: string; specialty?: string }; // More detailed structure
  time: string;
  date: string; // Ensure date is handled/formatted appropriately before display
  duration?: string;
  status: string; // 'upcoming', 'completed', 'cancelled', 'in-progress', etc.
  reason?: string;
  token?: string | null; // For joining the call
  // Add any other fields that might be relevant from the API response
}

interface AppointmentListProps {
  appointments: IAppointment[];
  userRole?: 'doctor' | 'patient'; // To conditionally render patient/doctor names if needed
}

export function AppointmentList({ appointments, userRole }: AppointmentListProps) {
  // Removed: const [appointments, setAppointments] = useState(mockAppointments)

  if (!appointments || appointments.length === 0) {
    return <p className="text-center text-muted-foreground py-4">Nenhum agendamento encontrado.</p>;
  }

  // Determine column headers based on role or a more generic approach
  const isDoctorView = userRole === 'doctor'; // Example, can be refined

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        {/* Responsive Grid: Adjust columns for smaller screens */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 bg-muted p-3 text-xs sm:text-sm font-medium text-muted-foreground">
          {/* Conditional rendering of Patient/Doctor name based on context */}
          <div>{isDoctorView ? "Paciente" : "Doutor(a)"}</div>
          <div className="hidden md:block">Horário</div>
          <div className="hidden sm:block">Status</div>
          <div className="text-right col-span-2 sm:col-span-1 md:col-span-1">Ação</div>
          {/* Hidden on smaller screens, or re-arrange for priority */}
          <div className="hidden md:block">Duração</div>
          <div className="hidden md:block">Motivo</div>
        </div>
        <div className="divide-y divide-border">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 p-3 text-xs sm:text-sm items-center hover:bg-muted/50 transition-colors">
              <div className="font-medium text-foreground truncate pr-1">
                {isDoctorView ? appointment.patientName : (appointment.doctor?.name || appointment.doctorName)}
              </div>
              <div className="hidden md:block text-muted-foreground">{new Date(appointment.date + 'T' + appointment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div>
                <Badge
                  variant={
                    appointment.status.toLowerCase() === "completed" || appointment.status.toLowerCase() === "concluído" || appointment.status.toLowerCase() === "cancelled" || appointment.status.toLowerCase() === "cancelado"
                      ? "outline"
                      : "default"
                  }
                  className={
                    appointment.status.toLowerCase() === "completed" || appointment.status.toLowerCase() === "concluído"
                      ? "bg-primary/10 text-primary border-primary/30 text-xs" // Completed style
                      : appointment.status.toLowerCase() === "cancelled" || appointment.status.toLowerCase() === "cancelado"
                      ? "bg-destructive/10 text-destructive border-destructive/30 text-xs" // Cancelled style
                      : "bg-primary hover:bg-primary/80 text-primary-foreground text-xs" // Primary action color for upcoming/in-progress
                  }
                >
                  {appointment.status}
                </Badge>
              </div>
              <div className="text-right col-span-2 sm:col-span-1 md:col-span-1">
                {/* CTA Buttons */}
                {appointment.status.toLowerCase() === "upcoming" || appointment.status.toLowerCase() === "pending" || appointment.status.toLowerCase() === "in-progress" || appointment.status.toLowerCase() === "iniciando..." ? (
                  <Button
                    size="xs" // Using a smaller size for list items
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm whitespace-nowrap"
                    asChild
                  >
                    <Link href={`/consultation/${appointment.token}`}>
                      <Video className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      {isDoctorView ? "Iniciar" : "Entrar"}
                    </Link>
                  </Button>
                ) : appointment.status.toLowerCase() === "completed" || appointment.status.toLowerCase() === "concluído" ? (
                  <Button size="xs" variant="outline" className="text-xs sm:text-sm whitespace-nowrap" asChild>
                    {/* Assuming a record viewing page exists */}
                    <Link href={isDoctorView ? `/doctor/records/${appointment.id}` : `/patient/records/${appointment.id}`}>Ver Prontuário</Link>
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">N/A</span> // No action for other statuses like 'cancelled'
                )}
              </div>
              <div className="hidden md:block text-muted-foreground">{appointment.duration}</div>
              <div className="hidden md:block text-muted-foreground truncate max-w-[100px] lg:max-w-[150px] pr-1">{appointment.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
