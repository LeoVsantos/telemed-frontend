import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppointmentList, IAppointment } from './appointment-list'; // Adjust path as necessary
import Link from 'next/link';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

const mockAppointmentsDoctorView: IAppointment[] = [
  { id: '1', patientName: 'João Silva', date: '2024-05-26', time: '10:00', status: 'upcoming', token: 'token1', duration: '30 min', reason: 'Check-up' },
  { id: '2', patientName: 'Maria Santos', date: '2024-05-27', time: '11:00', status: 'completed', duration: '45 min', reason: 'Follow-up' },
  { id: '3', patientName: 'Carlos Pereira', date: '2024-05-28', time: '14:00', status: 'cancelled', duration: '30 min', reason: 'Pain' },
];

const mockAppointmentsPatientView: IAppointment[] = [
  { id: '1', doctor: { name: 'Dr. Ana Costa', specialty: 'Cardiologia' }, date: '2024-05-26', time: '10:00', status: 'upcoming', token: 'token1', duration: '30 min', reason: 'Check-up' },
  { id: '2', doctor: { name: 'Dr. Bruno Lima', specialty: 'Neurologia' }, date: '2024-05-27', time: '11:00', status: 'completed', duration: '45 min', reason: 'Follow-up' },
];


describe('AppointmentList Component', () => {
  test('renders "Nenhum agendamento encontrado." when no appointments are provided', () => {
    render(<AppointmentList appointments={[]} />);
    expect(screen.getByText('Nenhum agendamento encontrado.')).toBeInTheDocument();
  });

  describe('Doctor View (userRole="doctor")', () => {
    beforeEach(() => {
      render(<AppointmentList appointments={mockAppointmentsDoctorView} userRole="doctor" />);
    });

    test('renders appointment details correctly for doctor', () => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      // The component formats time to include AM/PM, so test should reflect that.
      // The actual output from toLocaleTimeString can be locale-specific.
      // For "10:00", it's likely "10:00 AM" in many English locales, or "10:00" in 24-hour format.
      // The mock data uses "10:00 AM" directly in one place, and the component uses toLocaleTimeString.
      // Let's check for the presence of "10:00" which is part of "10:00 AM".
      // A more robust way would be to ensure the date/time formatting in tests matches component exactly.
      // The component uses: new Date(appointment.date + 'T' + appointment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      // For '10:00' this will likely be '10:00 AM' or '10:00'.
      // The test data has '10:00 AM', so I will search for that.
      expect(screen.getByText('10:00 AM')).toBeInTheDocument();
      expect(screen.getByText('upcoming')).toBeInTheDocument();
      
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();

      expect(screen.getByText('Carlos Pereira')).toBeInTheDocument();
      expect(screen.getByText('cancelled')).toBeInTheDocument();
    });

    test('renders "Iniciar" button for upcoming appointments for doctor', () => {
      const iniciarButton = screen.getByRole('link', { name: /iniciar/i });
      expect(iniciarButton).toBeInTheDocument();
      expect(iniciarButton).toHaveAttribute('href', '/consultation/token1');
    });

    test('renders "Ver Prontuário" button for completed appointments for doctor', () => {
      const verProntuarioButton = screen.getByRole('link', { name: /ver prontuário/i });
      expect(verProntuarioButton).toBeInTheDocument();
      expect(verProntuarioButton).toHaveAttribute('href', '/doctor/records/2'); // For Maria Santos
    });
    
    test('renders "N/A" for cancelled appointments', () => {
      // For Carlos Pereira (cancelled)
      const carlosRow = screen.getByText('Carlos Pereira').closest('div.grid');
      expect(carlosRow).toHaveTextContent('N/A'); // Check if N/A text is present for the action
    });
  });

  describe('Patient View (userRole="patient")', () => {
    beforeEach(() => {
      render(<AppointmentList appointments={mockAppointmentsPatientView} userRole="patient" />);
    });

    test('renders appointment details correctly for patient', () => {
      expect(screen.getByText('Dr. Ana Costa')).toBeInTheDocument();
      expect(screen.getByText('upcoming')).toBeInTheDocument();
      
      expect(screen.getByText('Dr. Bruno Lima')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });

    test('renders "Entrar" button for upcoming appointments for patient', () => {
      const entrarButton = screen.getByRole('link', { name: /entrar/i });
      expect(entrarButton).toBeInTheDocument();
      expect(entrarButton).toHaveAttribute('href', '/consultation/token1');
    });

    test('renders "Ver Prontuário" button for completed appointments for patient', () => {
      const verProntuarioButton = screen.getByRole('link', { name: /ver prontuário/i });
      expect(verProntuarioButton).toBeInTheDocument();
      expect(verProntuarioButton).toHaveAttribute('href', '/patient/records/2'); // For Dr. Bruno Lima appointment
    });
  });
  
  test('displays correct column headers for doctor view', () => {
    render(<AppointmentList appointments={mockAppointmentsDoctorView} userRole="doctor" />);
    expect(screen.getByText('Paciente')).toBeInTheDocument();
    expect(screen.getByText('Ação')).toBeInTheDocument(); // Common header
  });

  test('displays correct column headers for patient view', () => {
    render(<AppointmentList appointments={mockAppointmentsPatientView} userRole="patient" />);
    expect(screen.getByText('Doutor(a)')).toBeInTheDocument();
    expect(screen.getByText('Ação')).toBeInTheDocument(); // Common header
  });

});
