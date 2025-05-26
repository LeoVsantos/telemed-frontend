"use client";

import { useEffect, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, getUser } from '../lib/axios'; // Assuming getUser and getAuthToken are exported from lib/axios.ts

export default function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const router = useRouter();

    useEffect(() => {
      const token = getAuthToken();
      if (!token) {
        router.replace('/login'); // Use replace to prevent going back to the protected route
      }
      // Optional: You could also add a check here to verify the token with the backend
      // if the token is present but invalid.
    }, [router]);

    // If using server-side rendering and want to avoid rendering the component if not auth
    // This client-side check is usually sufficient for most SPAs.
    // For Next.js, you might handle this differently with middleware or getServerSideProps for stricter server-side protection.
    if (!getAuthToken()) {
      return null; // Or a loading spinner, or a message
    }

    return <WrappedComponent {...props} />;
  };

  // Set a display name for the HOC for better debugging
  WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
}
