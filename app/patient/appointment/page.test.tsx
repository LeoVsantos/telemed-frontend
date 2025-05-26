// 1. Mock function declarations
const mockApiGet = jest.fn();
const mockGetAuthToken = jest.fn();
const mockGetUser = jest.fn();
const mockRouterPush = jest.fn(); 

// 2. jest.mock calls for external modules
jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: { 
    get: mockApiGet, 
  },
  getAuthToken: mockGetAuthToken,
  getUser: mockGetUser,
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockRouterPush,
    replace: jest.fn(), 
  })),
}));

// 3. ALL import statements
import React from 'react'; 
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientAppointmentPage from './page'; 
import { HospitalThemeProvider } from '@/components/hospital-theme-provider'; 
// apiClient and other mocked functions will be imported if needed by test logic,
// but the actual module is already mocked above.
// For instance, to configure the mock return values:
import apiClientImported from '@/lib/axios'; // This is the mocked default
import { getAuthToken as mockedGetAuthTokenImported, getUser as mockedGetUserImported } from '@/lib/axios'; // These are the mocked named exports


// Assuming IAppointment is defined in a shared location or within the component file if not exported separately
interface IAppointment {
  id: string;
  doctorName?: string;
  doctor?: { name: string; specialty?: string };
  time: string;
  date: string;
  status: string;
  token?: string | null;
  specialty?: string;
  reason?: string;
  notes?: string;
  duration?: string;
}

// 4. Rest of the test code
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });


describe('PatientAppointmentPage', () => {
  beforeEach(() => {
    // Reset the actual mock functions defined in the outer scope
    mockApiGet.mockReset();
    mockGetAuthToken.mockReset();
    mockGetUser.mockReset();
    mockRouterPush.mockClear();

    // Setup mocks for withRole HOC
    mockGetAuthToken.mockReturnValue('fake-patient-token');
    mockGetUser.mockReturnValue({ id: 'pat1', role: 'patient', name: 'Patient Zero' });

    localStorageMock.setItem('token', 'fake-patient-token');
    localStorageMock.setItem('user', JSON.stringify({ id: 'pat1', role: 'patient', name: 'Patient Zero' }));
  });

  // Helper function to wrap with provider
  const renderPage = () => {
    return render(
      <HospitalThemeProvider hospitalId="test-hospital">
        <PatientAppointmentPage />
      </HospitalThemeProvider>
    );
  };

  test('displays loading state initially', () => {
    mockApiGet.mockReturnValueOnce(new Promise(() => {})); 
    renderPage();
    expect(screen.getByText(/carregando seus agendamentos/i)).toBeInTheDocument();
  });

  test('fetches and displays appointments successfully', async () => {
    const mockAppointmentsData: IAppointment[] = [
      { id: '1', doctor: { name: 'Dr. Smith', specialty: 'Cardiology' }, date: '2024-05-26', time: '10:00 AM', status: 'Pendente', token: 'token123' },
      { id: '2', doctor: { name: 'Dr. Jones', specialty: 'Neurology' }, date: '2024-05-27', time: '11:00 AM', status: 'Concluído' },
    ];
    mockApiGet.mockResolvedValueOnce({ data: mockAppointmentsData });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/consulta com dr. smith/i)).toBeInTheDocument();
      expect(screen.getByText(/cardiology/i)).toBeInTheDocument();
      expect(screen.getByText(/pendente/i)).toBeInTheDocument();
      expect(screen.getByText(/entrar na sala/i)).toBeInTheDocument();

      expect(screen.getByText(/consulta com dr. jones/i)).toBeInTheDocument();
      expect(screen.getByText(/neurology/i)).toBeInTheDocument();
      expect(screen.getByText(/concluído/i)).toBeInTheDocument();
      expect(screen.getAllByText(/não disponível para entrar/i).length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.queryByText(/carregando seus agendamentos/i)).not.toBeInTheDocument();
  });

  test('displays error message if fetching appointments fails', async () => {
    mockApiGet.mockRejectedValueOnce({
      response: { data: { message: 'Erro de API ao buscar agendamentos do paciente' } }
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/erro de api ao buscar agendamentos do paciente/i)).toBeInTheDocument();
    });
  });
  
  test('displays generic error message if fetching fails without specific message', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Network problem for patient test'));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/erro ao buscar seus agendamentos. tente novamente mais tarde./i)).toBeInTheDocument();
    });
  });

  test('displays "no appointments" message and "Agendar Nova Consulta" button if fetch is successful but returns empty list', async () => {
    const mockAppointmentsData: IAppointment[] = [];
    mockApiGet.mockResolvedValueOnce({ data: mockAppointmentsData });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/nenhum agendamento encontrado/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /agendar nova consulta/i })).toBeInTheDocument();
    });
  });

  test('"Agendar Nova Consulta" button navigates to home', async () => {
    const user = userEvent.setup();
    const mockAppointmentsData: IAppointment[] = [];
    mockApiGet.mockResolvedValueOnce({ data: mockAppointmentsData });
    
    renderPage();
    
    await waitFor(async () => {
      const scheduleButton = screen.getByRole('button', { name: /agendar nova consulta/i });
      expect(scheduleButton).toBeInTheDocument();
      await user.click(scheduleButton);
    });
    await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/');
    });
  });
});
