"use client";

import { useEffect, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, getUser } from '../lib/axios'; // Assuming these are exported from your axios setup

interface User {
  id: string;
  email: string;
  role: string;
  // Add other user properties as needed
}

// Define a type for the roles, which can be a single role or an array of roles.
type Role = string | string[];

export default function withRole<P extends object>(WrappedComponent: ComponentType<P>, requiredRoleOrRoles: Role) {
  const WithRoleComponent = (props: P) => {
    const router = useRouter();

    useEffect(() => {
      const token = getAuthToken();
      if (!token) {
        router.replace('/login'); // Not authenticated
        return;
      }

      const user: User | null = getUser(); // Get user info (which includes the role) from storage
      if (!user) {
        // This case might happen if user info is cleared but token is still there (unlikely with proper logout)
        console.error("User data not found, logging out.");
        localStorage.removeItem('token'); // Or your full logout function
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.replace('/login');
        return;
      }

      const hasRequiredRole = Array.isArray(requiredRoleOrRoles)
        ? requiredRoleOrRoles.includes(user.role)
        : user.role === requiredRoleOrRoles;

      if (!hasRequiredRole) {
        // User does not have the required role
        // Redirect to a generic dashboard, an unauthorized page, or back to login
        // For simplicity, redirecting to login or a hypothetical "unauthorized" page
        console.warn(`User with role "${user.role}" does not have required role(s): "${requiredRoleOrRoles}". Redirecting.`);
        // router.replace('/unauthorized'); // Or router.replace('/');
        // Depending on your app's structure, you might redirect them to their own dashboard if they have one.
        // For this example, if a doctor tries to access a patient page, they get redirected.
        // If a patient tries to access a doctor page, they get redirected.
        // Fallback to login for now.
        router.replace('/login'); // Or a more specific page like '/access-denied'
      }
    }, [router]);

    // Perform checks again before rendering to prevent rendering component if checks fail.
    // This is mostly for client-side components. SSR/SSG might need different handling.
    const token = getAuthToken();
    const user = getUser();

    if (!token || !user) {
      return null; // Or loading indicator
    }
    
    const hasRequiredRole = Array.isArray(requiredRoleOrRoles)
        ? requiredRoleOrRoles.includes(user.role)
        : user.role === requiredRoleOrRoles;

    if (!hasRequiredRole) {
        // This will typically be caught by the useEffect redirect, but as a fallback:
        return null; // Or an "Unauthorized" component / loading
    }


    return <WrappedComponent {...props} />;
  };
  
  WithRoleComponent.displayName = `WithRole(${WrappedComponent.displayName || WrappedComponent.name || 'Component'}, ${JSON.stringify(requiredRoleOrRoles)})`;

  return WithRoleComponent;
}
