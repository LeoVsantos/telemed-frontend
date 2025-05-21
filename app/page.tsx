import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { HospitalLogo } from "@/components/hospital-logo"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <HospitalLogo className="h-16 w-auto" />
          <h1 className="text-3xl font-bold text-center">DEMO: Plataforma de Telemedicina</h1>
          <p className="text-center text-muted-foreground">
            Consultas de vídeo seguras para profissionais de saúde e pacientes
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sou um médico</CardTitle>
              <CardDescription>Acesse suas consultas</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full bg-[var(--hospital-primary)] hover:bg-[var(--hospital-secondary)]">
                <Link href="/doctor/dashboard">Entrar no Portal do Médico</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eu sou um paciente</CardTitle>
              <CardDescription>Participe da sua consulta agendada</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full bg-[var(--hospital-primary)] hover:bg-[var(--hospital-secondary)]">
                <Link href="/patient/appointment">Entrar no Portal do Paciente</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Não é necessário fazer login. O acesso é feito por meio de links de token seguros.
        </p>
      </div>
    </div>
  )
}
