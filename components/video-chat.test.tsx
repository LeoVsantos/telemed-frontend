import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { VideoChat } from './video-chat'; // Adjust path as necessary

// Mock navigator.mediaDevices.getUserMedia
const mockGetUserMedia = jest.fn();
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true, 
});

// Mock HTMLMediaElement.prototype.play for video elements
const mockPlay = jest.fn(() => Promise.resolve());
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  value: mockPlay,
  writable: true,
});
Object.defineProperty(HTMLMediaElement.prototype, 'pause', { // Also mock pause if needed by component logic
  value: jest.fn(),
  writable: true,
});


// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    // Add any other methods your component uses
  };
  return {
    io: jest.fn(() => mockSocket),
  };
});

// Mock Audio constructor as it's used for join/leave sounds
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn(() => Promise.resolve()),
  pause: jest.fn(),
  // Add other Audio properties/methods if your component uses them
})) as any;


describe('VideoChat Component - Camera Permissions', () => {
  beforeEach(() => {
    mockGetUserMedia.mockReset();
    mockPlay.mockReset();
    // Reset socket mocks if necessary, e.g., (io() as any).mockClear(); if io is the direct mock
  });

  test('displays "Nenhuma câmera detectada." on NotFoundError', async () => {
    const error = new Error("Simulated NotFoundError");
    error.name = "NotFoundError";
    mockGetUserMedia.mockRejectedValueOnce(error);

    render(<VideoChat roomId="test-room-1" isDoctor={true} />);

    await waitFor(() => {
      expect(screen.getByText("Nenhuma câmera detectada.")).toBeInTheDocument();
    });
  });

  test('displays "Permissão de acesso à câmera negada." on NotAllowedError', async () => {
    const error = new Error("Simulated NotAllowedError");
    error.name = "NotAllowedError";
    mockGetUserMedia.mockRejectedValueOnce(error);

    render(<VideoChat roomId="test-room-2" isDoctor={false} />);

    await waitFor(() => {
      expect(screen.getByText("Permissão de acesso à câmera negada.")).toBeInTheDocument();
    });
  });
  
  test('displays generic error message for other getUserMedia errors', async () => {
    const error = new Error("Simulated GenericError");
    error.name = "GenericError"; // Any other error name
    mockGetUserMedia.mockRejectedValueOnce(error);

    render(<VideoChat roomId="test-room-3" isDoctor={true} />);

    await waitFor(() => {
      expect(screen.getByText("Erro ao acessar a câmera. Verifique as permissões e dispositivos.")).toBeInTheDocument();
    });
  });


  test('attempts to play local video stream on successful getUserMedia', async () => {
    const mockStream = { getAudioTracks: () => [], getVideoTracks: () => [] }; // Mock MediaStream object
    mockGetUserMedia.mockResolvedValueOnce(mockStream as any);

    render(<VideoChat roomId="test-room-4" isDoctor={true} />);

    // Wait for getUserMedia to be called
    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({ video: true, audio: true });
    });

    // Wait for the play function on the video element to be called
    // This implies that the stream was set and the component tried to play it
    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalled(); 
    });
    
    // After play has been called (or attempted), check that error states are cleared
    // because setCameraError(null) should have been executed.
    // We need to ensure that the UI has re-rendered after setCameraError(null)
    await waitFor(() => {
        expect(screen.queryByText("Nenhuma câmera detectada.")).not.toBeInTheDocument();
        expect(screen.queryByText("Permissão de acesso à câmera negada.")).not.toBeInTheDocument();
        expect(screen.queryByText("Erro ao acessar a câmera. Verifique as permissões e dispositivos.")).not.toBeInTheDocument();
    });
  });
});
