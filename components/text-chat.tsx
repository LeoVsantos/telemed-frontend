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
              className={`flex mb-2 ${ // Added mb-2 for slight spacing between messages
                message.sender === (isDoctor ? "doctor" : "patient") ? "justify-end" : "justify-start"
              }`}
            >
              {/* Max width of message bubble, responsive avatar size */}
              <div className={`flex items-start space-x-1 sm:space-x-2 max-w-[75%] sm:max-w-[80%]`}>
                {message.sender !== (isDoctor ? "doctor" : "patient") && (
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                    <AvatarFallback className="text-xs sm:text-sm">{message.sender === "doctor" ? "DR" : "PT"}</AvatarFallback>
                  </Avatar>
                )}

                <div className="space-y-0.5"> {/* Reduced space-y for tighter packing */}
                  <div
                    className={`rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm break-words ${ // Added break-words
                      message.sender === (isDoctor ? "doctor" : "patient")
                        ? "bg-[var(--hospital-primary)] text-primary-foreground"
                        : "bg-muted text-foreground" // Ensure contrast for patient messages
                    }`}
                  >
                    {message.text}
                  </div>
                  <p className="text-xs text-muted-foreground pl-1 sm:pl-0"> {/* Adjusted pl for alignment */}
                    {message.timestamp.toLocaleTimeString([], { // Consider using a more compact time format if needed
                      hour: "numeric", // Changed to numeric for potentially shorter time
                      minute: "2-digit"
                    })}
                  </p>
                </div>

                {message.sender === (isDoctor ? "doctor" : "patient") && (
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                     <AvatarFallback className="text-xs sm:text-sm">{message.sender === "doctor" ? "DR" : "PT"}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input area styling */}
      <div className="border-t p-2 sm:p-3 bg-white"> {/* Changed background to white for potentially better theme consistency */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-10 sm:h-11 text-xs sm:text-sm px-2 sm:px-3" // Adjusted padding and height
            aria-label="Mensagem"
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-[var(--hospital-primary)] hover:bg-[var(--hospital-secondary)] h-10 w-10 sm:h-11 sm:w-11 shrink-0" // Ensure button doesn't shrink too much
            aria-label="Enviar Mensagem"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
