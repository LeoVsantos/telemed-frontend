"use client"; // HOCs with hooks require client components

"use client"; // HOCs with hooks require client components

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users, Video, AlertTriangle } from "lucide-react" // Added AlertTriangle for errors
import { AppointmentList, IAppointment } from "@/components/appointment-list" // Assuming IAppointment is exported from here or define it locally
import withRole from "@/components/withRole";
import apiClient from "@/lib/axios"; // Assuming apiClient is the configured axios instance

// If IAppointment is not exported from AppointmentList, define it here:
// interface IAppointment {
//   id: string;
//   patientName: string;
//   time: string;
//   date: string;
//   status: 'pending' | 'completed' | 'cancelled' | 'in-progress'; // Example statuses
//   token?: string; // For joining the call
//   // Add other relevant appointment properties
//   doctorName?: string; // May not be needed if it's doctor's dashboard
//   specialty?: string;
// }


function DoctorDashboard() {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // The token is automatically added by the apiClient interceptor
        const response = await apiClient.get<IAppointment[]>('/appointments/doctor');
        setAppointments(response.data);
      } catch (err: any) {
        console.error("Failed to fetch doctor appointments:", err);
        setError(err.response?.data?.message || err.message || "Erro ao buscar agendamentos. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Update summary cards based on fetched appointments - OPTIONAL for this task, keeping static for now
  const todayAppointmentsCount = appointments.filter(app => {
    const appDate = new Date(app.date + 'T' + app.time); // Combine date and time
    const today = new Date();
    return appDate.toDateString() === today.toDateString();
  }).length;
  // Other summary calculations can be added here.


  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Doutor Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-xs sm:text-sm text-muted-foreground">
            {new Date().toLocaleDateString("pt-BR", { // Changed to pt-BR for consistency
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Responsive grid for summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Consultas de hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{isLoading ? '...' : todayAppointmentsCount}</div>
            {/* <p className="text-xs text-muted-foreground">X completas, Y restantes</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Próxima consulta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">10:30 AM</div> {/* Example, make dynamic if needed */}
            <p className="text-xs text-muted-foreground">em 25 minutos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">248</div> {/* Example, make dynamic if needed */}
            <p className="text-xs text-muted-foreground">12 novos esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Consultas (Mês)</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">42</div> {/* Example, make dynamic if needed */}
            <p className="text-xs text-muted-foreground">este mês</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Minhas Consultas</CardTitle>
          <CardDescription>Visualize suas consultas agendadas.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-center text-muted-foreground">Carregando agendamentos...</p>}
          {error && (
            <div className="text-destructive bg-destructive/10 p-3 rounded-md flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
              <p>{error}</p>
            </div>
          )}
          {!isLoading && !error && appointments.length === 0 && (
            <p className="text-center text-muted-foreground">Nenhum agendamento encontrado.</p>
          )}
          {!isLoading && !error && appointments.length > 0 && (
            // Ensure AppointmentList itself is responsive or adapt its container
            <div className="overflow-x-auto"> 
              <AppointmentList appointments={appointments} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default withRole(DoctorDashboard, 'doctor');
