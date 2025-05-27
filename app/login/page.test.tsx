import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './page'; // Adjust path as necessary
import axios from 'axios'; // Will be mocked
import { useRouter } from 'next/navigation'; // Will be mocked
import { HospitalThemeProvider } from '@/components/hospital-theme-provider'; // Import the provider

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
const mockedUseRouter = useRouter as jest.Mock;

// Mock localStorage
const localStorageMock = (() => {
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
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('LoginPage', () => {
  let mockRouterPush: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    mockedAxios.post.mockReset();
    localStorageMock.clear();
    mockRouterPush = jest.fn();
    mockedUseRouter.mockReturnValue({ push: mockRouterPush });
  });

  test('renders login form correctly', () => {
    render(
      <HospitalThemeProvider hospitalId="test-hospital">
        <LoginPage />
      </HospitalThemeProvider>
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  test('allows typing in email and password fields', async () => {
    const user = userEvent.setup();
    render(
      <HospitalThemeProvider hospitalId="test-hospital">
        <LoginPage />
      </HospitalThemeProvider>
    );
    
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/senha/i) as HTMLInputElement;

    await user.type(emailInput, 'test@example.com');
    expect(emailInput.value).toBe('test@example.com');

    await user.type(passwordInput, 'password123');
    expect(passwordInput.value).toBe('password123');
  });

  test('handles successful login for doctor and redirects', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        user: { id: 'doc1', email: 'doctor@example.com', role: 'doctor' },
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
      },
    });

    render(
      <HospitalThemeProvider hospitalId="test-hospital">
        <LoginPage />
      </HospitalThemeProvider>
    );
    
    await user.type(screen.getByLabelText(/email/i), 'doctor@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth', {
        email: 'doctor@example.com',
        password: 'password',
      });
      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
      expect(localStorage.getItem('refreshToken')).toBe('fake-refresh-token');
      expect(JSON.parse(localStorage.getItem('user') || '{}').role).toBe('doctor');
      expect(mockRouterPush).toHaveBeenCalledWith('/doctor/dashboard');
    });
  });

  test('handles successful login for patient and redirects', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        user: { id: 'pat1', email: 'patient@example.com', role: 'patient' },
        token: 'fake-jwt-token-patient',
        refreshToken: 'fake-refresh-token-patient',
      },
    });

    render(
      <HospitalThemeProvider hospitalId="test-hospital">
        <LoginPage />
      </HospitalThemeProvider>
    );
    
    await user.type(screen.getByLabelText(/email/i), 'patient@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/patient/dashboard');
    });
  });


  test('displays error message on failed login (server error)', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: { message: 'Invalid credentials' },
      },
    });

    render(
      <HospitalThemeProvider hospitalId="test-hospital">
        <LoginPage />
      </HospitalThemeProvider>
    );
    
    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
    consoleErrorSpy.mockRestore();
  });

  test('displays generic error message on failed login (network or other error)', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error')); // Simulate network error

    render(
      <HospitalThemeProvider hospitalId="test-hospital">
        <LoginPage />
      </HospitalThemeProvider>
    );
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText('Falha no login. Por favor, tente novamente.')).toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });


  test('shows loading state on submit button when submitting', async () => {
    const user = userEvent.setup();
    // Make the promise hang so we can check the loading state
    mockedAxios.post.mockImplementation(() => new Promise(() => {}));

    render(
      <HospitalThemeProvider hospitalId="test-hospital">
        <LoginPage />
      </HospitalThemeProvider>
    );

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password');
    
    const button = screen.getByRole('button', { name: /entrar/i });
    await user.click(button);

    // Check if button is disabled and text changed
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Entrando...');

    // Clean up by resolving the mock if necessary, though for this test it's not strictly needed
    // as we are only checking the loading state.
    // For a real scenario, you might want to resolve/reject it to avoid issues with other tests.
  });
});
