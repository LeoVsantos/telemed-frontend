import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Video } from "lucide-react"
import Link from "next/link"
"use client"; // HOCs with hooks require client components

import { HospitalLogo } from "@/components/hospital-logo"
// import { useRouter } from "next/router"; // Replaced with next/navigation for App Router
import { useRouter } from "next/navigation"; // For App Router
import withRole from "@/components/withRole"; // Adjust path as necessary
import { useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import { AlertTriangle } from "lucide-react"; // For error display

// Assuming IAppointment structure from doctor's dashboard or define a suitable one.
// If it includes doctor details within a nested object, adjust access accordingly.
interface IAppointment {
  id: string;
  doctorName?: string; // Or doctor.name if nested
  doctor?: { name: string; specialty?: string }; // More likely structure
  patientName?: string; // May not be needed if it's patient's dashboard
  time: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled' | 'in-progress' | string; // Example statuses, allow string for flexibility
  token?: string | null; // For joining the call
  specialty?: string; // Could be top-level or under doctor
  reason?: string;
  notes?: string;
  duration?: string;
}

function PatientAppointmentPage() {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // For navigation if needed

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<IAppointment[]>('/appointments/patient');
        setAppointments(response.data);
      } catch (err: any) {
        console.error("Failed to fetch patient appointments:", err);
        setError(err.response?.data?.message || err.message || "Erro ao buscar seus agendamentos. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500 hover:bg-green-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      case 'in-progress':
      case 'iniciando...': // from mock
        return 'bg-blue-500 hover:bg-blue-600';
      case 'pending':
      default:
        return 'bg-yellow-500 hover:bg-yellow-600';
    }
  };


  return (
    // Use min-h-screen to ensure footer is pushed down on short content pages
    <div className="container mx-auto min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col">
      <header className="flex flex-col items-center space-y-4 mb-6 sm:mb-8">
        <HospitalLogo className="h-12 sm:h-16 w-auto" />
        <h1 className="text-2xl sm:text-3xl font-bold text-center">Meus Agendamentos</h1>
      </header>

      <main className="flex-grow">
        {isLoading && (
          <div className="text-center py-10">
            <p className="text-lg text-muted-foreground">Carregando seus agendamentos...</p>
            {/* Spinner can be added here */}
          </div>
        )}

        {error && (
          <div className="text-red-600 bg-red-100 flex flex-col sm:flex-row items-center justify-center p-4 rounded-md shadow">
            <AlertTriangle className="mr-0 sm:mr-2 h-6 w-6 mb-2 sm:mb-0" />
            <p className="text-center sm:text-left">{error}</p>
          </div>
        )}

        {!isLoading && !error && appointments.length === 0 && (
          <div className="text-center py-10">
            <p className="text-lg text-muted-foreground mb-4">Nenhum agendamento encontrado.</p>
            <Button onClick={() => router.push('/')} className="bg-[var(--hospital-primary)] hover:bg-[var(--hospital-secondary)] text-white">
              Agendar Nova Consulta
            </Button>
          </div>
        )}

        {!isLoading && !error && appointments.length > 0 && (
          <div className="space-y-6">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="w-full shadow-md hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="mb-2 sm:mb-0">
                      <CardTitle className="text-lg sm:text-xl">
                        Consulta com {appointment.doctor?.name || appointment.doctorName || 'Doutor(a)'}
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        {appointment.doctor?.specialty || appointment.specialty || 'Especialidade não informada'}
                      </CardDescription>
                    </div>
                    <Badge className={`text-white text-xs sm:text-sm px-2 py-1 ${getStatusBadgeClass(appointment.status)}`}>
                      {appointment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2"> {/* md:grid-cols-2 for larger content sections */}
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium">Data</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{new Date(appointment.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium">Horário</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{appointment.time} {appointment.duration ? `(${appointment.duration})` : ''}</p>
                      </div>
                    </div>
                  </div>
                  {appointment.reason && (
                    <div className="rounded-md bg-gray-50 p-3">
                      <h3 className="mb-1 text-xs sm:text-sm font-medium">Motivo da Consulta</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{appointment.reason}</p>
                    </div>
                  )}
                  {appointment.notes && (
                    <div className="rounded-md bg-gray-50 p-3">
                      <h3 className="mb-1 text-xs sm:text-sm font-medium">Observações</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{appointment.notes}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-4 sm:p-6 flex flex-col sm:flex-row justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                  {/* Buttons will stack on small screens if they don't fit */}
                  {appointment.token && (appointment.status.toLowerCase() === 'pending' || appointment.status.toLowerCase() === 'in-progress' || appointment.status.toLowerCase() === 'iniciando...') ? (
                    <Button className="w-full sm:w-auto bg-[var(--hospital-primary)] hover:bg-[var(--hospital-secondary)] text-white py-2 px-3 text-xs sm:text-sm" asChild>
                      <Link href={`/consultation/${appointment.token}`}>
                        <Video className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Entrar na sala
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" disabled className="w-full sm:w-auto py-2 px-3 text-xs sm:text-sm">
                      Não disponível para entrar
                    </Button>
                  )}
                   <Button variant="outline" className="w-full sm:w-auto py-2 px-3 text-xs sm:text-sm">Cancelar</Button> {/* Example secondary action */}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-auto pt-8 text-center text-xs sm:text-sm text-muted-foreground">
        <p>Precisa de ajuda? Entre em contato com o suporte em support@hospitalxyz.com</p>
      </footer>
    </div>
  );
}

export default withRole(PatientAppointmentPage, 'patient');
