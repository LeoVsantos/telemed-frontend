"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BrandLogo } from "./brand-logo"
import { VideoChat } from "./video-chat"
import { TextChat } from "./text-chat"
import { ClipboardList, FileText, MessageSquare, Pill, X, ChevronUp, ChevronDown, XCircle } from "lucide-react" // Added XCircle
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
// import { useParams, useSearchParams } from "next/navigation"; // useParams not used, useSearchParams removed
import { useRouter } from "next/navigation"; // useRouter is still needed
import { api } from "@/lib/axios"
import dynamic from "next/dynamic"

// const RichTextEditor = dynamic(
//   () => import('@/components/ui/richTextEditor'),
//   { ssr: false }
// );

// Define the RichTextEditorHandle type
type RichTextEditorHandle = {
  getContent: () => string;
};


// Mock data for the consultation is being replaced by API data.
// const mockConsultationData = { ... } // Removed or commented out

interface IAppointments {
	role: 'doctor' | 'patient'; // This determines if the user is a doctor or patient in this consultation
	patientName: string;      // Name of the patient
	doctor: {                 // Details of the doctor
		id: string;
		name: string;
		email: string;
	};
	datetime: Date;           // Date and time of the appointment
	roomId: string;           // Room ID for the call/chat
  // Optional: Add a nested structure for more detailed patient info if the API provides it
  // patientDetails?: {
  //   age?: number;
  //   gender?: string;
  //   medicalHistory?: string;
  //   currentMedications?: string;
  //   allergies?: string;
  //   reason?: string; // Reason for visit
  // };
}

export function ConsultationRoom({ token, consultationData }: { token: string, consultationData: IAppointments }) {
  // const params = useSearchParams(); // No longer needed for role determination via ?doctor=true
  const router = useRouter()
  const [isDoctor, setIsDoctor] = useState(false) // This will be set based on API response
  const [isConsultationEnded, setIsConsultationEnded] = useState(false)
  const [anamnesis, setAnamnesis] = useState("")
  const [prescriptions, setPrescriptions] = useState<string[]>([])
  const [newPrescription, setNewPrescription] = useState("")
  const [examOrders, setExamOrders] = useState<string[]>([])
  const [newExamOrder, setNewExamOrder] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isRoomLoading, setIsRoomLoading] = useState(true); // Loading state for initial consultation data


  useEffect(() => {
    setIsDoctor(consultationData.role === 'doctor');
    setIsRoomLoading(false);
  }, [])

  const handleEndConsultation = () => {
    setIsConsultationEnded(true)
  }

  const handleAddPrescription = () => {
    if (newPrescription.trim()) {
      setPrescriptions([...prescriptions, newPrescription.trim()])
      setNewPrescription("")
    }
  }

  const handleAddExamOrder = () => {
    if (newExamOrder.trim()) {
      setExamOrders([...examOrders, newExamOrder.trim()])
      setNewExamOrder("")
    }
  }

  const handleReturnToDashboard = () => {
    if (isDoctor) {
      router.push("/doctor/dashboard")
    } else {
      router.push("/patient/appointment")
    }
  }

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  if (isRoomLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground">Carregando informações da consulta...</p>
        {/* Optional: Add a spinner component here */}
      </div>
    );
  }

  if (!isRoomLoading && !consultationData) { // Handles case where token is invalid or API fails critically before setting appointment
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center p-6 bg-card rounded-lg shadow-md">
          <XCircle className="mx-auto h-12 w-12 text-destructive" /> {/* Assuming XCircle is imported */}
          <h2 className="mt-4 text-xl font-semibold text-card-foreground">Erro ao Carregar Consulta</h2>
          <p className="mt-2 text-muted-foreground">
            Não foi possível carregar os detalhes da consulta. Verifique o link ou tente novamente.
          </p>
          <Button onClick={() => router.push('/')} className="mt-6">Voltar para Home</Button>
        </div>
      </div>
    );
  }

  return (
    // Ensure overall screen height is utilized, flex-col for header and main content area
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-auto sm:h-16 items-center justify-between border-b bg-card px-4 sm:px-6 py-2 sm:py-0 z-20">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <BrandLogo className="h-7 sm:h-8 w-auto" />
          <Separator orientation="vertical" className="hidden sm:block h-8" />
          <div className="flex-grow">
            <h1 className="text-sm sm:text-lg font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg">
              {isDoctor ? `Consulta: ${consultationData?.patientName || 'Paciente'}` : `Consulta com: ${consultationData?.doctor.name || 'Doutor(a)'}`}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {consultationData?.datetime ? new Date(consultationData.datetime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : ''}
              {consultationData?.roomId && <span className="hidden sm:inline"> • Sala: {consultationData.roomId}</span>}
            </p>
          </div>
        </div>
        {isDoctor && (
          <Button variant="destructive" size="xs" smSize="sm" onClick={handleEndConsultation} className="ml-2 text-xs sm:text-sm whitespace-nowrap">
            <X className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Encerrar
          </Button>
        )}
      </header>

      {/* Main content area: flex-col on mobile, lg:flex-row for larger screens */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left panel - Video: Takes full width on mobile, then specific portion on lg screens */}
        <div className="relative w-full lg:flex-1 flex flex-col order-1"> {/* order-1 to keep it first visually */}
          {/* Padding adjusted for different screen sizes */}
          <div className="flex-1 p-2 sm:p-4 overflow-hidden h-[50vh] lg:h-auto"> {/* Fixed height for video on mobile for balance */}
            {consultationData?.roomId && <VideoChat roomId={consultationData.roomId} isDoctor={isDoctor} />}
          </div>
        </div>

        {/* Right panel - Medical notes and patient info: Full width on mobile, specific width on lg screens */}
        {/* border-t for mobile when stacked, lg:border-l for larger screens */}
        <div className="w-full lg:w-1/3 border-t lg:border-t-0 lg:border-l bg-card overflow-y-auto order-2 lg:max-h-full"> {/* max-h-full for lg screens with overflow-y-auto */}
          <Tabs defaultValue="anamnesis" className="flex flex-col h-full"> {/* h-full to utilize space */}
            <div className="sticky top-0 z-10 bg-card border-b shadow-sm">
              {/* TabsList will allow horizontal scroll on small screens if tabs don't fit */}
              <TabsList className="w-full justify-start p-1 sm:p-2 overflow-x-auto whitespace-nowrap">
                <TabsTrigger value="anamnesis" className="flex items-center text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">
                  <ClipboardList className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  {isDoctor ? 'Anamnese' : 'Info Paciente'}
                </TabsTrigger>
                <TabsTrigger value="prescriptions" className="flex items-center text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">
                  <Pill className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Receituário
                </TabsTrigger>
                <TabsTrigger value="exams" className="flex items-center text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">
                  <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Exames
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="anamnesis" className="p-4 space-y-4 flex-1 overflow-auto">


            {isDoctor && (
              <>
                <h3 className="text-sm font-medium">Notas de Consulta</h3>
                 {/* <RichTextEditor ref={editorRef} initialContent={editorContent} /> */}
                <Textarea
                  placeholder="Insira aqui as notas da consulta..."
                  className="min-h-[200px]"
                  value={anamnesis}
                  onChange={(e) => setAnamnesis(e.target.value)}
                  readOnly={!isDoctor}
                />
              </>
            )}

              <div className="mt-1 space-y-4 pt-1">
                <h3 className="text-sm font-medium">Informações do Paciente</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Pessoal</h4>
                    <p className="text-sm">
                    {/* Use patientName from appointment, placeholders for other details not in IAppointments */}
                    {consultationData?.patientName || "Nome do paciente não disponível"},{" "}
                    {/* Placeholder for age, replace if API provides it e.g., appointment.patientDetails?.age */}
                    Idade não informada,{" "}
                    {/* Placeholder for gender, replace if API provides it e.g., appointment.patientDetails?.gender */}
                    Gênero não informado
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Histórico Médico</h4>
                  {/* Placeholder, replace if API provides it e.g., appointment.patientDetails?.medicalHistory */}
                  <p className="text-sm">Não informado</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Medicamentos atuais</h4>
                  {/* Placeholder, replace if API provides it e.g., appointment.patientDetails?.currentMedications */}
                  <p className="text-sm">Não informado</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Alergias</h4>
                  {/* Placeholder, replace if API provides it e.g., appointment.patientDetails?.allergies */}
                  <p className="text-sm">Não informado</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground">Motivo da Consulta</h4>
                  {/* Placeholder, replace if API provides it e.g., appointment.patientDetails?.reason */}
                  <p className="text-sm">Não informado</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Outros</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>Outras infos, obtidas atraves dos modulos integrados</p>
                    </div>
                  </div>
                </div>
              </div>
                      
            </TabsContent>

            <TabsContent value="prescriptions" className="p-4 space-y-4 flex-1 overflow-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Receituários</h3> {/* Typo fixed */}
                <Badge className="bg-primary text-primary-foreground">{prescriptions.length} Itens</Badge> {/* Translated */}
              </div>

              {isDoctor && (
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Adicionar novo receituário..." /* Typo fixed */
                    value={newPrescription}
                    onChange={(e) => setNewPrescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button
                    onClick={handleAddPrescription}
                    className="self-end bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Adicionar
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                {prescriptions.length > 0 ? (
                  prescriptions.map((prescription, index) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <p className="text-sm">{prescription}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nenhum receituário adicionado ainda.</p> /* Typo fixed */
                )}
              </div>

            </TabsContent>

            <TabsContent value="exams" className="p-4 space-y-4 flex-1 overflow-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Exames solicitados</h3>
                <Badge className="bg-primary text-primary-foreground">{examOrders.length} Exames</Badge>
              </div>

              {isDoctor && (
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Solicitar nova ordem de exame..."
                    value={newExamOrder}
                    onChange={(e) => setNewExamOrder(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button
                    onClick={handleAddExamOrder}
                    className="self-end bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Adicionar {/* Changed from Add to Adicionar for consistency */}
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                {examOrders.length > 0 ? (
                  examOrders.map((exam, index) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <p className="text-sm">{exam}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nenhum exame foi solicitado ainda.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

          {/* Floating chat panel */}
          {/* Floating chat panel: Adjusted for responsiveness */}
          <div
            className={`fixed bottom-0 right-0 w-full sm:w-80 md:w-96 transition-transform duration-300 z-30 ${ // Changed to fixed, full width on mobile
              isChatOpen ? "translate-y-0" : "translate-y-[calc(100%-3rem)] sm:translate-y-[calc(100%-2.5rem)]" 
            }`}
          >
            <div
              className="bg-card rounded-t-lg border-t border-x shadow-xl cursor-pointer flex items-center justify-between p-2 h-12 sm:h-10"
              onClick={toggleChat}
            >
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="font-medium text-sm sm:text-base">Chat</span>
              </div>
              {isChatOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </div>
            {/* Chat content area with defined height, hidden when not open */}
            <div className={`bg-card border-x border-b rounded-b-lg shadow-lg ${isChatOpen ? 'h-64 sm:h-80 overflow-y-auto' : 'h-0 overflow-hidden'}`}>
                {consultationData?.roomId && <TextChat isDoctor={isDoctor} roomId={consultationData.roomId} />}
            </div>
          </div>

      </div>

      {/* End Consultation Dialog */}
      <Dialog open={isConsultationEnded} onOpenChange={setIsConsultationEnded}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Consulta encerrada</DialogTitle>
            <DialogDescription>
              {isDoctor
                ? "A consulta foi concluída. O que você gostaria de fazer em seguida?"
                : "Seu médico encerrou a consulta. Agradecemos por utilizar nosso serviço de telemedicina."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Resumo da Consulta</h3>
              <p className="text-sm text-muted-foreground">
                {isDoctor
                  ? `Consulta com ${consultationData?.patientName} foi concluida.`
                  : `Sua consulta com o Dr. ${consultationData?.doctor.name} foi concluida.`}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Próximos passos</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                {isDoctor ? (
                  <>
                    <p>• Preencha qualquer documentação restante</p>
                    <p>• Agende o acompanhamento se necessário</p>
                    <p>• Revisar e finalizar prescrições</p>
                  </>
                ) : (
                  <>
                    <p>• Siga o plano de tratamento prescrito</p>
                    <p>• Agende quaisquer exames solicitados</p>
                    <p>• Entre em contato com o suporte se tiver alguma dúvida</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={() =>
                (window.location.href = `mailto:support@hospital.com?subject=Recording%20Request%20${token}`)
              }
              className="mb-2 sm:mb-0"
            >
              Solicitar gravação
            </Button>
            <Button
              onClick={handleReturnToDashboard}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isDoctor ? "Voltar ao dashboard" : "Sair"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
