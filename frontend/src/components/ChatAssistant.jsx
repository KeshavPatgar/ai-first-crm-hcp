import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Bot, CheckCircle2 } from 'lucide-react'
import axios from 'axios'
import { addMessage, setTyping } from '../redux/chatSlice'
import { updateForm } from '../redux/interactionSlice'

export default function ChatAssistant() {
  const { messages, isTyping } = useSelector((state) => state.chat)
  const form = useSelector((state) => state.interaction)
  const dispatch = useDispatch()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = { id: Date.now().toString(), sender: 'user', text: input }
    dispatch(addMessage(userMsg))
    setInput('')
    dispatch(setTyping(true))

    try {
      const res = await axios.post('http://localhost:8000/api/chat/', {
        message: userMsg.text,
        current_form: form
      })

      if (res.data.form_data) {
        dispatch(updateForm(res.data.form_data))
      }

      const aiMsg = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        text: res.data.reply,
        success: res.data.reply.includes("successfully") 
      }
      dispatch(addMessage(aiMsg))
    } catch (err) {
      dispatch(addMessage({ id: Date.now().toString(), sender: 'ai', text: 'Error connecting to AI Server. Is it running on port 8000?' }))
    } finally {
      dispatch(setTyping(false))
    }
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center gap-3">
        <Bot size={26} className="text-blue-500" />
        <div>
          <h2 className="text-[1.1rem] font-bold text-blue-500 tracking-tight">AI Assistant</h2>
          <p className="text-xs text-gray-400">Log Interaction details here via chat</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3.5 text-sm rounded-xl max-w-[90%] leading-relaxed shadow-sm ${
              msg.sender === 'user' ? 'bg-gray-100 text-gray-800 rounded-tr-none border border-gray-200' :
              msg.sender === 'system' ? 'bg-[#EBF5FF] text-gray-700 border border-blue-100 w-full' :
              msg.success ? 'bg-[#ECFDF5] text-gray-800 border border-green-200 w-full' :
              'bg-[#F8FAFC] text-gray-800 border border-gray-200 w-full'
            }`}>
              {msg.success && <CheckCircle2 size={16} className="inline mr-1.5 text-green-500 mb-0.5" />}
              <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex gap-1.5 shadow-sm">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 border-t border-gray-100 bg-white">
        <form onSubmit={handleSend} className="relative flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe Interaction..."
            className="flex-1 bg-white border-2 border-gray-900 rounded-full py-3 px-5 text-sm outline-none focus:border-blue-500 transition-colors shadow-sm font-medium placeholder-gray-400"
          />
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-6 flex items-center justify-center text-sm transition-colors shadow-md"
          >
            Log
          </button>
        </form>
      </div>
    </div>
  )
}
