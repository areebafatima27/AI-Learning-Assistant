"use client"
import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, RotateCcw, MessageCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { useStatsStore } from "../store"
import { Link } from "react-router-dom"

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I'm your AI learning assistant powered by Gemini. How can I help you today? Feel free to ask me anything about your studies, homework, or any topic you'd like to learn more about!",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Get stats and functions from store
  const { stats, incrementStat, initializeStats } = useStatsStore()

  // Initialize stats when component mounts
  useEffect(() => {
    const initStats = async () => {
      await initializeStats()
    }
    initStats()
  }, [initializeStats])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const calculateMessagesHeight = () => {
    const baseHeight = 150 // Smaller minimum height
    const maxHeight = 600 // Maximum height
    const heightPerMessage = 60 // Reduced height per message for smoother growth
    const calculatedHeight = baseHeight + (messages.length - 1) * heightPerMessage
    return Math.min(calculatedHeight, maxHeight)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    }

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)
    setError("")

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_history: conversationHistory,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])

        // Increment questions asked count
        await incrementStat("questionsAsked")
      } else {
        throw new Error(data.error || "Failed to get response")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message. Please try again.")

      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again or check your connection.",
        timestamp: new Date(),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content:
          "Hello! I'm your AI learning assistant powered by Gemini. How can I help you today? Feel free to ask me anything about your studies, homework, or any topic you'd like to learn more about!",
        timestamp: new Date(),
      },
    ])
    setError("")
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className=" min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className=" p-20 absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-lg animate-bounce"
          style={{ animationDuration: "3s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-lg animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:scale-105 transition-transform duration-200 bg-transparent"
                >
                  ← Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Learning Assistant
                </h1>
                <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full border">
                Questions Asked: <span className="font-semibold text-blue-600">{stats.questionsAsked}</span>
              </div>
              <Button
                onClick={clearChat}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-gray-800 hover:scale-105 transition-all duration-200 bg-transparent"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
          <CardContent className="p-0">
            {/* Messages Area */}
            <div
              className="overflow-y-auto p-6 space-y-4 transition-all duration-500 ease-in-out"
              style={{ height: `${calculateMessagesHeight()}px` }}
            >
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 transform hover:scale-[1.02] transition-all duration-200 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl"
                        : message.isError
                          ? "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200 shadow-md"
                          : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 shadow-md hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === "assistant" && (
                        <div className="relative">
                          <Bot className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      )}
                      {message.role === "user" && <User className="h-5 w-5 text-white mt-1 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">{formatTime(message.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl px-4 py-3 shadow-md">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-5 w-5 text-blue-600" />
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-600">Thinking</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200/50 p-4 bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your studies, homework, or any topic..."
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-3 text-sm text-red-600 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg px-3 py-2 animate-in slide-in-from-top-1 duration-300">
                  {error}
                </div>
              )}

              {/* Help Text */}
              <div className="mt-3 text-xs text-gray-500 text-center">
                Press Enter to send, Shift+Enter for new line • Powered by Gemini AI
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
