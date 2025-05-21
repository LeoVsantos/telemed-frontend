import { ConsultationRoom } from "@/components/consultation-room"

export default function ConsultationPage({
  params,
}: {
  params: { token: string }
}) {
  return <ConsultationRoom token={params.token} />
}
