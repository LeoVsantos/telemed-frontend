// Step 1: jest.mock calls. The factory functions define the mock implementations directly.
jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: { 
    get: jest.fn(), 
  },
  getAuthToken: jest.fn(),
  getUser: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(), 
  })),
}));

jest.mock('@/components/appointment-list', () => ({
  AppointmentList: ({ appointments }: { appointments: import('@/components/appointment-list').IAppointment[] }) => (
    <div data-testid="appointment-list">
      {appointments.map(app => (
        <div key={app.id} data-testid={`appointment-${app.id}`}>
          {app.patientName || app.doctorName} - {app.status}
        </div>
      ))}
    </div>
  ),
  // Re-export IAppointment if your test file or component relies on it being exported from appointment-list
  // For example, if IAppointment is defined in appointment-list.tsx:
  // IAppointment: jest.fn(), // This line is likely not needed if IAppointment is just a type/interface
}));

// Step 2: ALL import statements
import React from 'react'; 
import { render, screen, waitFor } from '@testing-library/react';
import DoctorDashboard from './page'; 
import apiClient from '@/lib/axios'; // This will import the mocked default export { get: jest.fn() }
import { getAuthToken, getUser } from '@/lib/axios'; // These will import the mocked named exports (jest.fn())
import { IAppointment } from '@/components/appointment-list'; // Ensure this type import is correct


// Step 3: Rest of the test code (localStorage mock, describe, beforeEach, tests)
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
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });


describe('DoctorDashboard Page', () => {
  beforeEach(() => {
    // Reset the imported mocks. Cast to jest.Mock to access mock methods.
    ((apiClient.get as unknown) as jest.Mock).mockReset();
    (getAuthToken as jest.Mock).mockReset();
    (getUser as jest.Mock).mockReset();
    
    // Setup mocks for withRole HOC
    (getAuthToken as jest.Mock).mockReturnValue('fake-doctor-token');
    (getUser as jest.Mock).mockReturnValue({ id: 'doc1', role: 'doctor', name: 'Dr. Test' });
    
    localStorageMock.setItem('token', 'fake-doctor-token');
    localStorageMock.setItem('user', JSON.stringify({ id: 'doc1', role: 'doctor', name: 'Dr. Test' }));
  });

  test('displays loading state initially', () => {
    ((apiClient.get as unknown) as jest.Mock).mockReturnValueOnce(new Promise(() => {})); 
    render(<DoctorDashboard />);
    expect(screen.getByText(/carregando agendamentos/i)).toBeInTheDocument();
  });

  test('fetches and displays appointments successfully', async () => {
    const mockAppointmentsData: IAppointment[] = [
      { id: '1', patientName: 'John Doe', date: '2024-05-26', time: '10:00 AM', status: 'Pending' },
      { id: '2', patientName: 'Jane Smith', date: '2024-05-27', time: '11:00 AM', status: 'Completed' },
    ];
    ((apiClient.get as unknown) as jest.Mock).mockResolvedValueOnce({ data: mockAppointmentsData });

    render(<DoctorDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('appointment-list')).toBeInTheDocument();
      expect(screen.getByTestId('appointment-1')).toHaveTextContent('John Doe - Pending');
      expect(screen.getByTestId('appointment-2')).toHaveTextContent('Jane Smith - Completed');
    });
    expect(screen.queryByText(/carregando agendamentos/i)).not.toBeInTheDocument();
  });

  test('displays error message if fetching appointments fails', async () => {
    ((apiClient.get as unknown) as jest.Mock).mockRejectedValueOnce({ 
        response: { data: { message: 'API Error From Test For Doctor' } } 
    });

    render(<DoctorDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/api error from test for doctor/i)).toBeInTheDocument();
    });
  });
  
  test('displays generic error message if fetching appointments fails without specific message', async () => {
    // Spy on console.error for this specific test to suppress expected error log
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const testErrorMessage = 'Network problem for doctor test';
    ((apiClient.get as unknown) as jest.Mock).mockRejectedValueOnce(new Error(testErrorMessage));

    render(<DoctorDashboard />);

    await waitFor(() => {
      // Expect the specific error message from new Error()
      expect(screen.getByText(testErrorMessage)).toBeInTheDocument();
    });
    consoleErrorSpy.mockRestore();
  });

  test('displays "no appointments" message if fetch is successful but returns empty list', async () => {
    ((apiClient.get as unknown) as jest.Mock).mockResolvedValueOnce({ data: [] });
    render(<DoctorDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/nenhum agendamento encontrado/i)).toBeInTheDocument();
    });
  });
  
  test('summary card shows loading indicator then data', async () => {
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    const mockAppointmentsData: IAppointment[] = [
      // Appointment for today
      { id: '1', patientName: 'John Doe', date: todayDateString, time: '10:00', status: 'Pending' }, // Use 24-hr time for simpler parsing
      // Appointment for another day (should not be counted)
      { id: '2', patientName: 'Jane Roe', date: '2023-01-01', time: '11:00', status: 'Pending' },
    ];
    ((apiClient.get as unknown) as jest.Mock).mockResolvedValueOnce({ data: mockAppointmentsData });
    
    render(<DoctorDashboard />);
    
    const consultasHojeTitle = screen.getByText("Consultas de hoje");
    const cardContentInitially = consultasHojeTitle.closest('div.pb-2')?.nextElementSibling;
    expect(cardContentInitially).toHaveTextContent("..."); 

    await waitFor(() => {
        const cardContentAfterLoad = consultasHojeTitle.closest('div.pb-2')?.nextElementSibling;
        expect(cardContentAfterLoad).toHaveTextContent("1"); 
    });
  });
});
