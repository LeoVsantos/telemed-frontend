import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import withAuth from './withAuth'; // Adjust path as necessary
import withRole from './withRole';   // Adjust path as necessary

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
const mockedUseRouter = useRouter as jest.Mock;

// Mock localStorage
const localStorageMockFactory = () => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    getStore: () => store, // Helper to inspect store if needed
  };
};

let localStorageMock: ReturnType<typeof localStorageMockFactory>;

// Dummy component to wrap
const MockComponent = () => <div data-testid="mock-component">Protected Content</div>;
MockComponent.displayName = 'MockComponent'; // Good for HOC display names

describe('withAuth HOC', () => {
  let mockRouterReplace: jest.Mock;

  beforeEach(() => {
    localStorageMock = localStorageMockFactory();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
    
    mockRouterReplace = jest.fn();
    mockedUseRouter.mockReturnValue({ replace: mockRouterReplace, push: jest.fn() });
  });

  test('redirects to /login if no token is present', () => {
    localStorageMock.removeItem('token'); // Ensure no token
    const ProtectedComponent = withAuth(MockComponent);
    render(<ProtectedComponent />);
    
    expect(mockRouterReplace).toHaveBeenCalledWith('/login');
    // The component might render null or nothing before redirect, so content check might be tricky
    // or depend on specific HOC implementation (e.g., if it returns null immediately)
    // For now, the redirect check is the primary goal.
  });

  test('renders wrapped component if token is present', () => {
    localStorageMock.setItem('token', 'fake-token');
    const ProtectedComponent = withAuth(MockComponent);
    render(<ProtectedComponent />);
    
    expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
});

describe('withRole HOC', () => {
  let mockRouterReplace: jest.Mock;

  beforeEach(() => {
    localStorageMock = localStorageMockFactory();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
    
    mockRouterReplace = jest.fn();
    mockedUseRouter.mockReturnValue({ replace: mockRouterReplace, push: jest.fn() });
  });

  test('redirects to /login if no token is present (even with role check)', () => {
    localStorageMock.removeItem('token');
    const ProtectedComponent = withRole(MockComponent, 'doctor');
    render(<ProtectedComponent />);
    
    expect(mockRouterReplace).toHaveBeenCalledWith('/login');
  });

  test('renders wrapped component if token and correct role (doctor) are present', () => {
    localStorageMock.setItem('token', 'fake-token');
    localStorageMock.setItem('user', JSON.stringify({ role: 'doctor' }));
    const ProtectedComponent = withRole(MockComponent, 'doctor');
    render(<ProtectedComponent />);
    
    expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
  
  test('renders wrapped component if token and correct role (patient from array) are present', () => {
    localStorageMock.setItem('token', 'fake-token');
    localStorageMock.setItem('user', JSON.stringify({ role: 'patient' }));
    const ProtectedComponent = withRole(MockComponent, ['patient', 'admin']); // Role can be an array
    render(<ProtectedComponent />);
    
    expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  test('redirects to /login if user has incorrect role', () => {
    localStorageMock.setItem('token', 'fake-token');
    localStorageMock.setItem('user', JSON.stringify({ role: 'patient' })); // User is a patient
    const ProtectedComponent = withRole(MockComponent, 'doctor'); // Requires doctor
    render(<ProtectedComponent />);
    
    // The HOC might redirect to /login or a specific /unauthorized page.
    // Based on current withRole implementation, it redirects to /login.
    expect(mockRouterReplace).toHaveBeenCalledWith('/login');
  });

  test('redirects to /login if user data is missing (no role)', () => {
    localStorageMock.setItem('token', 'fake-token');
    localStorageMock.removeItem('user'); // No user item in localStorage
    const ProtectedComponent = withRole(MockComponent, 'doctor');
    render(<ProtectedComponent />);
    
    expect(mockRouterReplace).toHaveBeenCalledWith('/login');
  });
  
  test('redirects to /login if user data is invalid JSON', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error for this test
    localStorageMock.setItem('token', 'fake-token');
    localStorageMock.setItem('user', 'this-is-not-json'); 
    const ProtectedComponent = withRole(MockComponent, 'doctor');
    render(<ProtectedComponent />);
    
    expect(mockRouterReplace).toHaveBeenCalledWith('/login');
    consoleErrorSpy.mockRestore(); // Restore console.error
  });
});
