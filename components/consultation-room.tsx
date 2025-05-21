"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HospitalLogo } from "./hospital-logo"
import { VideoChat } from "./video-chat"
import { TextChat } from "./text-chat"
import { ClipboardList, FileText, MessageSquare, Pill, X, ChevronUp, ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useParams, useRouter, useSearchParams } from "next/navigation"
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


// Mock data for the consultation
const mockConsultationData = {
  doctorId: "doc-123",
  patientId: "pat-456",
  doctorName: "Dr. Teste Doutor",
  patientName: "Teste Paciente",
  patientAge: 45,
  patientGender: "Homem",
  reason: "Check-up anual",
  medicalHistory: "Hipertensão, Diabetes tipo 2",
  currentMedications: "Metformina 500mg, Lisinopril 10mg",
  allergies: "Penicilina",
  vitalSigns: {
    bloodPressure: "120/80",
    heartRate: "72",
    temperature: "98.6°F",
    respiratoryRate: "16",
    oxygenSaturation: "98%",
  },
}

interface IAppointments {
	role: 'doctor' | 'patient';
	patientName: string;
	doctor: {
		id: string;
		name: string;
		email: string;
	},
	datetime: Date;
	roomId: string;
}

export function ConsultationRoom({ token }: { token: string }) {
  const params = useSearchParams();
  const router = useRouter()
  const [isDoctor, setIsDoctor] = useState(false)
  const [isConsultationEnded, setIsConsultationEnded] = useState(false)
  const [anamnesis, setAnamnesis] = useState("")
  const [prescriptions, setPrescriptions] = useState<string[]>([])
  const [newPrescription, setNewPrescription] = useState("")
  const [examOrders, setExamOrders] = useState<string[]>([])
  const [newExamOrder, setNewExamOrder] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [appointment, setAppointment] = useState<IAppointments | null>()

    const editorRef = useRef<RichTextEditorHandle>(null); // Ref for RichTextEditor
    const [editorContent, setEditorContent] = useState<string>(''); // State to store the editor content

  const handleGetContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent(); // Get the editor content
      setEditorContent(content); // Update the state with the content
    }
  };


  useEffect(() => {
    
   const getConsultation = async () => {
      const consultation = await api.get<IAppointments>(`/appointments/${token}`);
      if(consultation.data){
        setIsDoctor(!!params.get('doctor'));
        setAppointment(consultation.data)
      }
    }

    getConsultation();
  }, [token])

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

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b px-6 z-10">
        <div className="flex items-center space-x-4">
          <HospitalLogo className="h-8 w-auto" />
          <Separator orientation="vertical" className="h-8" />
          <div>
            <h1 className="text-lg font-medium">
              Consulta em andamento com: {isDoctor ? appointment?.patientName : appointment?.doctor.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {appointment?.datetime ? appointment.datetime : ''} • {appointment?.roomId}
            </p>
          </div>
        </div>
        {isDoctor && (
          <Button variant="destructive" size="sm" onClick={handleEndConsultation}>
            <X className="mr-2 h-4 w-4" />
            Encerrar consulta
          </Button>
        )}
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Video */}
        <div className="relative flex-1 flex flex-col">
          <div className="flex-1 p-4 overflow-hidden">
            <VideoChat roomId={appointment?.roomId!} isDoctor={isDoctor} />
          </div>
        </div>

        {/* Right panel - Medical notes and patient info */}
        <div className="w-1/3 border-l overflow-hidden flex flex-col">
          <Tabs defaultValue="anamnesis" className="flex flex-col h-full">
            <div className="sticky top-0 z-10 bg-background border-b">
              <TabsList className="w-full justify-start p-2">
                <TabsTrigger value="anamnesis" className="flex items-center">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  {isDoctor ? 'Anamnesis' : 'Paciente'}
                </TabsTrigger>
                <TabsTrigger value="prescriptions" className="flex items-center">
                  <Pill className="mr-2 h-4 w-4" />
                  Receituario
                </TabsTrigger>
                <TabsTrigger value="exams" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
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
                      {appointment?.patientName}, {mockConsultationData.patientAge},{" "}
                      {mockConsultationData.patientGender}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Histórico Médico</h4>
                    <p className="text-sm">{mockConsultationData.medicalHistory}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Medicamentos atuais</h4>
                    <p className="text-sm">{mockConsultationData.currentMedications}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Alergias</h4>
                    <p className="text-sm">{mockConsultationData.allergies}</p>
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
                <h3 className="text-sm font-medium">Receituarios</h3>
                <Badge className="bg-[var(--hospital-primary)]">{prescriptions.length} Items</Badge>
              </div>

              {isDoctor && (
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Adicionar novo receituario..."
                    value={newPrescription}
                    onChange={(e) => setNewPrescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button
                    onClick={handleAddPrescription}
                    className="self-end bg-[var(--hospital-primary)] hover:bg-[var(--hospital-secondary)]"
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
                  <p className="text-sm text-muted-foreground italic">Nenhum receituario adicionada ainda.</p>
                )}
              </div>

            </TabsContent>

            <TabsContent value="exams" className="p-4 space-y-4 flex-1 overflow-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Exames solicitados</h3>
                <Badge className="bg-[var(--hospital-primary)]">{examOrders.length} Exames</Badge>
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
                    className="self-end bg-[var(--hospital-primary)] hover:bg-[var(--hospital-secondary)]"
                  >
                    Add
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
          <div
            className={`absolute bottom-1 right-4 w-80 transition-all duration-300 z-20 ${
              isChatOpen ? "translate-y-0" : "translate-y-[calc(100%-40px)]"
            }`}
          >
            <div
              className="bg-card rounded-t-lg border shadow-lg cursor-pointer flex items-center justify-between p-2"
              onClick={toggleChat}
            >
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                <span className="font-medium">Chat</span>
              </div>
              {isChatOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </div>
            {isChatOpen && (
              <div className="bg-card border-x border-b rounded-b-lg h-80 shadow-lg">
                <TextChat isDoctor={isDoctor} />
              </div>
            )}
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
                  ? `Consulta com ${appointment?.patientName} foi concluida.`
                  : `Sua consulta com o Dr. ${appointment?.doctor.name} foi concluida.`}
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
              className="bg-[var(--hospital-primary)] hover:bg-[var(--hospital-secondary)]"
            >
              {isDoctor ? "Voltar ao dashboard" : "Sair"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
