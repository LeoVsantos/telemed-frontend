"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send } from "lucide-react"

type Message = {
  id: string
  sender: "doctor" | "patient"
  text: string
  timestamp: Date
}

// Mock initial messages
const initialMessages: Message[] = [
  {
    id: "1",
    sender: "doctor",
    text: "Olá! Consegue me ver e ouvir bem?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
  {
    id: "2",
    sender: "patient",
    text: "Sim doutor.",
    timestamp: new Date(Date.now() - 1000 * 60 * 4), // 4 minutes ago
  },
  {
    id: "3",
    sender: "doctor",
    text: "Entendo. consegue ligar a camera pra gente continuar?",
    timestamp: new Date(Date.now() - 1000 * 60 * 3), // 3 minutes ago
  },
  {
    id: "4",
    sender: "patient",
    text: "Vou ajustar a camera doutor, um minuto.",
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
  },
    {
    id: "5",
    sender: "patient",
    text: "Consegue me ouvir?",
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
  },
]

export function TextChat({ isDoctor }: { isDoctor: boolean }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: isDoctor ? "doctor" : "patient",
        text: newMessage.trim(),
        timestamp: new Date(),
      }

      setMessages([...messages, message])
      setNewMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="h-[calc(100%-50px)] p-4 overflow-y-auto" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === (isDoctor ? "doctor" : "patient") ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex max-w-[80%] items-start space-x-2">
                {message.sender !== (isDoctor ? "doctor" : "patient") && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{message.sender === "doctor" ? "DR" : "PT"}</AvatarFallback>
                  </Avatar>
                )}

                <div className="space-y-1">
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.sender === (isDoctor ? "doctor" : "patient")
                        ? "bg-[var(--hospital-primary)] text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.text}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {message.sender === (isDoctor ? "doctor" : "patient") && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{message.sender === "doctor" ? "DR" : "PT"}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t p-2 bg-background">
        <div className="flex space-x-2">
          <Input
            placeholder="Digitar mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-[var(--hospital-primary)] hover:bg-[var(--hospital-secondary)]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
