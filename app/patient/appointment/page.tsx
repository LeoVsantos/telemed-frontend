import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Video } from "lucide-react"
import Link from "next/link"
import { HospitalLogo } from "@/components/hospital-logo"
import { useRouter } from "next/router"

export default function PatientAppointment() {


  // Mock appointment data
  const appointment = {
    id: "1",
    doctorName: "Dr. Jane Smith",
    specialty: "Cardiologia",
    time: "10:30 AM",
    date: "Maio 12, 2025",
    duration: "30 min",
    status: "iniciando...",
    reason: "Check-up anual",
    token: "92497b31-9b20-48e1-ae75-e438d7f4e114",
    notes: "Esteja pronto 5 minutos antes da consulta. Tenha sua lista de medicamentos recentes em mãos.",
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <HospitalLogo className="h-16 w-auto" />
          <h1 className="text-3xl font-bold text-center">Sua consulta</h1>
        </div>

        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Consulta com {appointment.doctorName}</CardTitle>
                <CardDescription>{appointment.specialty}</CardDescription>
              </div>
              <Badge className="bg-[var(--hospital-primary)] hover:bg-[var(--hospital-primary)]">
                {appointment.status === "completed" ? "Completo" : "Iniciando"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Data</p>
                  <p className="text-sm text-muted-foreground">{appointment.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Horario</p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.time} ({appointment.duration})
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Doutor</p>
                  <p className="text-sm text-muted-foreground">{appointment.doctorName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Video className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Tipo</p>
                  <p className="text-sm text-muted-foreground">Video Call</p>
                </div>
              </div>
            </div>

            <div className="rounded-md bg-muted p-4">
              <h3 className="mb-2 text-sm font-medium">Motivo</h3>
              <p className="text-sm text-muted-foreground">{appointment.reason}</p>
            </div>

            <div className="rounded-md bg-muted p-4">
              <h3 className="mb-2 text-sm font-medium">Observacoes</h3>
              <p className="text-sm text-muted-foreground">{appointment.notes}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancelar consulta</Button>
            <Button className="bg-[var(--hospital-primary)] hover:bg-[var(--hospital-secondary)]" asChild>
              <Link href={`/consultation/${appointment.token}`}>
                <Video className="mr-2 h-4 w-4" />
                Entrar na sala
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Precisa de ajuda? Entre em contato com o suporte em support@pongeluppe.com</p>
        </div>
      </div>
    </div>
  )
}
