"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, getUser, getConsultationByToken } from "@/lib/axios"; // Assume these exist
import { ConsultationRoom } from "@/components/consultation-room";

interface ConsultationData {
	role: 'doctor' | 'patient'; 
	patientName: string;      
	doctor: {                 
		id: string;
		name: string;
		email: string;
	};
	datetime: Date;           
	roomId: string;    
}

function ConsultationPage({
  params,
}: {
  params: { token: string }
}) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getConsultationByToken(params.token);
        const data = response.data as ConsultationData;
        setConsultationData(data);

        if (data.role === 'doctor') { // Changed from data.expectedRole
          const token = getAuthToken();
          const user = getUser();

          if (!token || !user) {
            router.replace('/login');
            return;
          }

          if (user.id !== data.doctor.id) {
            setError("Unauthorized: You are not the correct doctor for this consultation.");
            setIsLoading(false);
            return;
          }
        }
        // If expectedRole is 'patient', access is granted implicitly for now.
        // Additional checks for patients can be added here if needed.

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch consultation data:", err);
        router.replace('/consultation/not-found');
      }
    };

    if (params.token) {
      fetchData();
    }
  }, [params.token, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (consultationData) {
    return <ConsultationRoom token={params.token} consultationData={consultationData} />;
  }

  // Fallback, though ideally handled by loading/error states or redirect
  return <div>Something went wrong.</div>;
}

export default ConsultationPage;
