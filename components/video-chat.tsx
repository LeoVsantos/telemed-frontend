"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, VideoIcon, VideoOff } from "lucide-react"
import { io } from 'socket.io-client'
import SimplePeer, { Instance as SimplePeerInstance, SignalData } from 'simple-peer'

interface VideoChatProps {
  isDoctor: boolean
  roomId: string
}

export function VideoChat({ isDoctor, roomId }: VideoChatProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [muted, setMuted] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true)
  const [remoteConnected, setRemoteConnected] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null); // For camera/permission errors

  const socket = useRef(io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000')).current
  const peerRef = useRef<SimplePeerInstance | null>(null)
  const joinAudioRef = useRef(new Audio('/join.mp3'))
  const leaveAudioRef = useRef(new Audio('/leave.mp3'))

  // Notify server before unload
  useEffect(() => {
    const handleUnload = () => socket.emit('leave-room', { roomId })
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [roomId, socket])

  // Capture camera + mic
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(s => {
        setStream(s)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = s
          localVideoRef.current.play().catch((playError) => {
            console.error("Error playing local video:", playError);
            // Optionally set a generic error if play fails, though getUserMedia errors are primary focus
          });
        }
        setCameraError(null); // Clear any previous errors
      })
      .catch(err => {
        console.error("Error accessing media devices:", err);
        if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setCameraError("Nenhuma câmera detectada.");
        } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraError("Permissão de acesso à câmera negada.");
        } else {
          setCameraError("Erro ao acessar a câmera. Verifique as permissões e dispositivos.");
        }
      });
  }, [])

  // Handle incoming signaling
  useEffect(() => {
    const handleSignal = ({ signal }: { signal: SignalData }) => {
      const peer = peerRef.current
      if (peer && !peer.destroyed) {
        try { peer.signal(signal) }
        catch { /* ignore */ }
      }
    }
    socket.on('webrtc-signal', handleSignal)
    return () => { socket.off('webrtc-signal', handleSignal) }
  }, [socket])

  // Create or recreate peer
  const createPeer = () => {
    if (!stream) return
    const oldPeer = peerRef.current
    if (oldPeer) {
      oldPeer.removeAllListeners()
      oldPeer.destroy()
      peerRef.current = null
      setRemoteConnected(false)
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    }
    const peer = new SimplePeer({ initiator: isDoctor, trickle: true, stream })
    peerRef.current = peer
    peer.on('signal', data => socket.emit('webrtc-signal', { roomId, signal: data }))
    peer.on('stream', remoteStream => {
      setRemoteConnected(true)
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
        remoteVideoRef.current.play().catch(() => {})
      }
    })
    peer.on('close', () => {
      setRemoteConnected(false)
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    })
    // ignore non-critical errors
    peer.on('error', () => {})
  }

  // Join room and negotiation: wait for both parties
  useEffect(() => {
    if (!stream) return
    setRemoteConnected(false)
    socket.emit('join-room', { roomId })

    const onJoin = () => {
      joinAudioRef.current.play().catch(() => {})
      createPeer()
    }
    const onLeft = () => {
      leaveAudioRef.current.play().catch(() => {})
      setRemoteConnected(false)
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    }
    socket.on('participant-joined', onJoin)
    socket.on('participant-left', onLeft)
    socket.on('video-toggle', ({ enabled }: { enabled: boolean }) => setRemoteVideoEnabled(enabled))

    // only non-initiator start early; initiator waits for peer
    if (!isDoctor) createPeer()

    return () => {
      socket.off('participant-joined', onJoin)
      socket.off('participant-left', onLeft)
      socket.off('video-toggle')
      peerRef.current?.removeAllListeners()
      peerRef.current?.destroy()
      peerRef.current = null
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    }
  }, [stream, isDoctor, roomId, socket])

  // Rejoin on socket reconnect
  useEffect(() => {
    const onConnect = () => {
      if (stream) {
        socket.emit('join-room', { roomId })
      }
    }
    socket.on('connect', onConnect)
    return () => { socket.off('connect', onConnect) }
  }, [socket, roomId, stream])

  // Media controls
  const toggleMute = () => {
    if (!stream) return
    stream.getAudioTracks().forEach(t => t.enabled = !t.enabled)
    setMuted(m => !m)
  }
  const toggleVideo = () => {
    if (!stream) return
    const newState = !videoEnabled
    stream.getVideoTracks().forEach(t => t.enabled = newState)
    setVideoEnabled(newState)
    socket.emit('video-toggle', { roomId, enabled: newState })
  }

  const remoteInitials = isDoctor ? 'P' : 'Dr'

  return (
    <div className="flex h-full flex-col">
      <div className="relative h-full overflow-hidden rounded-lg bg-muted">
        <video ref={remoteVideoRef} className="h-full w-full object-cover" autoPlay playsInline />
        {/* Remote video feed takes full space */}
        <video ref={remoteVideoRef} className="h-full w-full object-cover" autoPlay playsInline />

        {/* Overlay for waiting message */}
        {!remoteConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
            <span className="text-lg sm:text-xl font-semibold text-background p-4 rounded-md">
              {isDoctor ? 'Aguardando Paciente...' : 'Aguardando Doutor...'}
            </span>
          </div>
        )}

        {/* Overlay for remote participant's video off */}
        {remoteConnected && !remoteVideoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-muted-foreground text-background">
              <span className="text-xl sm:text-2xl font-semibold">{remoteInitials}</span>
            </div>
          </div>
        )}

        {/* Local video preview (Picture-in-Picture style) */}
        {/* Responsive size: smaller on mobile, larger on bigger screens */}
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 h-24 w-32 sm:h-28 sm:w-40 md:h-32 md:w-44 lg:h-36 lg:w-48 overflow-hidden rounded-md sm:rounded-lg border border-border shadow-lg bg-muted">
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive text-destructive-foreground p-1 sm:p-2">
              <VideoOff className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mb-1 sm:mb-2" />
              <p className="text-center text-xs sm:text-sm font-semibold">{cameraError}</p>
            </div>
          ) : (
            <video ref={localVideoRef} className="h-full w-full object-cover" autoPlay playsInline muted />
          )}
          {/* Overlay for local video off */}
          {!cameraError && !videoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/75">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-muted-foreground text-background">
                <span className="text-md sm:text-lg font-semibold">
                  {isDoctor ? 'Dr' : 'Me'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Controls for local media (mic and video toggle) */}
        {/* Positioned at the bottom center or bottom left, responsive padding/margin */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 flex space-x-2 sm:space-x-3 z-10 p-1 bg-foreground/20 rounded-lg">
          <Button
            size="icon"
            variant="outline"
            onClick={toggleMute}
            aria-label={!muted ? 'Mutar Microfone' : 'Desmutar Microfone'}
            className="h-8 w-8 sm:h-10 sm:w-10 bg-background/50 hover:bg-background/75 data-[state=on]:bg-destructive"
          >
            {!muted ? <Mic className="h-4 w-4 sm:h-5 sm:w-5" /> : <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={toggleVideo}
            aria-label={!videoEnabled ? 'Desligar Câmera' : 'Ligar Câmera'}
            className="h-8 w-8 sm:h-10 sm:w-10 bg-background/50 hover:bg-background/75 data-[state=on]:bg-destructive"
          >
            {!videoEnabled ? <VideoOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <VideoIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
