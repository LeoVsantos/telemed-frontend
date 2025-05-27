"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HospitalLogo } from "@/components/hospital-logo";
import { getAppointmentDetailsByToken } from "@/lib/axios"; // Assume this will be created

// Define IAppointment interface (can be kept as is from original file if suitable)
interface IAppointment {
  id: string;
  doctorName?: string;
  doctor?: { name: string; specialty?: string };
  patientName?: string;
  time: string;
  date: string;
  status: string;
  token?: string | null;
  specialty?: string;
  reason?: string;
  notes?: string;
  duration?: string;
}

export default function PatientAppointmentTokenPage({ params }: { params: { token: string } }) {
  const [appointmentDetails, setAppointmentDetails] = useState<IAppointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (params.token) {
      const fetchAppointmentDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Assuming getAppointmentDetailsByToken returns { data: IAppointment }
          const response = await getAppointmentDetailsByToken(params.token);
          setAppointmentDetails(response.data);
        } catch (err: any) {
          console.error("Failed to fetch appointment details:", err);
          setError(err.response?.data?.message || err.message || "Agendamento não encontrado ou token inválido.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchAppointmentDetails();
    } else {
      setError("Token não fornecido.");
      setIsLoading(false);
    }
  }, [params.token]);

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'cancelled': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'in-progress': case 'iniciando...': return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'pending': default: return 'bg-yellow-500 hover:bg-yellow-600 text-black'; // text-black for yellow
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
        <p className="text-lg text-muted-foreground">Carregando detalhes do agendamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
        <div className="text-red-600 bg-red-100 flex flex-col items-center justify-center p-4 rounded-md shadow text-center">
          <AlertTriangle className="mr-0 sm:mr-2 h-6 w-6 mb-2" />
          <p>{error}</p>
          <Button onClick={() => router.push('/')} className="mt-4 bg-[var(--hospital-primary)] hover:bg-[var(--hospital-secondary)] text-white">
            Ir para a Página Inicial
          </Button>
        </div>
      </div>
    );
  }

  if (!appointmentDetails) {
    return (
      <div className="container mx-auto min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
        <p className="text-lg text-muted-foreground mb-4">Nenhum detalhe de agendamento encontrado.</p>
        <Button onClick={() => router.push('/')} className="bg-[var(--hospital-primary)] hover:bg-[var(--hospital-secondary)] text-white">
          Ir para a Página Inicial
        </Button>
      </div>
    );
  }

  // Displaying single appointment details
  return (
    <div className="container mx-auto min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col">
      <header className="flex flex-col items-center space-y-4 mb-6 sm:mb-8">
        <HospitalLogo className="h-12 sm:h-16 w-auto" />
        <h1 className="text-2xl sm:text-3xl font-bold text-center">Detalhes do Agendamento</h1>
      </header>

      <main className="flex-grow">
        <Card className="w-full max-w-2xl mx-auto shadow-md hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <CardTitle className="text-lg sm:text-xl">
                  Consulta com {appointmentDetails.doctor?.name || appointmentDetails.doctorName || 'Doutor(a)'}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {appointmentDetails.doctor?.specialty || appointmentDetails.specialty || 'Especialidade não informada'}
                </CardDescription>
              </div>
              <Badge className={`text-xs sm:text-sm px-2 py-1 ${getStatusBadgeClass(appointmentDetails.status)}`}>
                {appointmentDetails.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-xs sm:text-sm font-medium">Data</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{new Date(appointmentDetails.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 sm:space-x-3">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-xs sm:text-sm font-medium">Horário</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{appointmentDetails.time} {appointmentDetails.duration ? `(${appointmentDetails.duration})` : ''}</p>
                </div>
              </div>
            </div>
            {appointmentDetails.reason && (
              <div className="rounded-md bg-gray-50 p-3">
                <h3 className="mb-1 text-xs sm:text-sm font-medium">Motivo da Consulta</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{appointmentDetails.reason}</p>
              </div>
            )}
            {appointmentDetails.notes && (
              <div className="rounded-md bg-gray-50 p-3">
                <h3 className="mb-1 text-xs sm:text-sm font-medium">Observações</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{appointmentDetails.notes}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 sm:p-6 flex flex-col sm:flex-row justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            {appointmentDetails.token && (appointmentDetails.status?.toLowerCase() === 'pending' || appointmentDetails.status?.toLowerCase() === 'in-progress' || appointmentDetails.status?.toLowerCase() === 'iniciando...') ? (
              <Button className="w-full sm:w-auto bg-[var(--hospital-primary)] hover:bg-[var(--hospital-secondary)] text-white py-2 px-3 text-xs sm:text-sm" asChild>
                {/* Use params.token for the link to ensure it's the one from the URL */}
                <Link href={`/consultation/${params.token}`}>
                  <Video className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Entrar na sala
                </Link>
              </Button>
            ) : (
              <Button variant="outline" disabled className="w-full sm:w-auto py-2 px-3 text-xs sm:text-sm">
                Não disponível para entrar
              </Button>
            )}
            {/* Optional: Keep or remove cancel button as per requirements for this view */}
            {/* <Button variant="outline" className="w-full sm:w-auto py-2 px-3 text-xs sm:text-sm">Cancelar</Button> */}
          </CardFooter>
        </Card>
      </main>

      <footer className="mt-auto pt-8 text-center text-xs sm:text-sm text-muted-foreground">
        <p>Precisa de ajuda? Entre em contato com o suporte em support@hospitalxyz.com</p>
      </footer>
    </div>
  );
}
