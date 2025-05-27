"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ConsultationNotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-4xl font-bold mb-4">Consultation Not Found</h1>
      <p className="text-lg mb-8">
        The consultation you are looking for could not be found. 
        The link may be invalid or the consultation may have been removed.
      </p>
      <Link href="/">
        <Button>Go to Homepage</Button>
      </Link>
    </div>
  );
}
