"use client"; // HOCs with hooks require client components

import { ConsultationRoom } from "@/components/consultation-room";
import withAuth from "@/components/withAuth"; // Adjust path as necessary

function ConsultationPage({
  params,
}: {
  params: { token: string }
}) {
  // The actual fetching and role derivation based on appointment data
  // would happen inside ConsultationRoom or here, after authentication is confirmed.
  return <ConsultationRoom token={params.token} />;
}

export default withAuth(ConsultationPage);
