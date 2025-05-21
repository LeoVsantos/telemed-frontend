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
          localVideoRef.current.play().catch(() => {})
        }
      })
      .catch(console.error)
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
        {!remoteConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-xl font-semibold">
              {isDoctor ? 'Aguardando Paciente...' : 'Aguardando Doutor...'}
            </span>
          </div>
        )}
        {remoteConnected && !remoteVideoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-background">
              <span className="text-2xl font-semibold">{remoteInitials}</span>
            </div>
          </div>
        )}
        <div className="absolute bottom-4 right-4 h-36 w-48 overflow-hidden rounded-lg border-2 border-background shadow-lg">
          <video ref={localVideoRef} className="h-full w-full object-cover" autoPlay playsInline muted />
          {!videoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background">
                <span className="text-lg font-semibold">
                  {isDoctor ? 'Dr' : 'Me'}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="absolute bottom-4 left-4 flex space-x-2">
          <Button size="icon" onClick={toggleMute} aria-label={!muted ? 'Mute' : 'Unmute'}>
            {!muted ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          <Button size="icon" onClick={toggleVideo} aria-label={!videoEnabled ? 'Camera Off' : 'Camera On'}>
            {!videoEnabled ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
