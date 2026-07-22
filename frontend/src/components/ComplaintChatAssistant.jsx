import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Bot, CheckCircle2, UploadCloud } from 'lucide-react'
import axios from 'axios'
import { addComplaintMessage, setComplaintTyping } from '../redux/qaChatSlice'
import { updateComplaintForm } from '../redux/complaintSlice'
import { updateRiskAssessment } from '../redux/riskSlice'

export default function ComplaintChatAssistant() {
  const { messages, isTyping } = useSelector((state) => state.qaChat)
  const form = useSelector((state) => state.complaint)
  const risk = useSelector((state) => state.risk)
  const dispatch = useDispatch()
  const [input, setInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (e, customText = null) => {
    if (e) e.preventDefault()
    
    const textToSend = customText || input
    if (!textToSend.trim()) return

    const userMsg = { id: Date.now().toString(), sender: 'user', text: textToSend }
    dispatch(addComplaintMessage(userMsg))
    if (!customText) setInput('')
    dispatch(setComplaintTyping(true))

    try {
      const current_form = { ...form, ...risk }
      const res = await axios.post('http://localhost:8000/api/complaints/chat', {
        message: userMsg.text,
        current_form: current_form
      })

      if (res.data.form_data) {
        // We need to split the data between complaintSlice and riskSlice
        const riskFields = ["severity", "risk_summary", "suggested_action", "confidence_score"]
        const formData = { ...res.data.form_data }
        
        const riskData = {}
        riskFields.forEach(field => {
          if (formData[field] !== undefined) {
            riskData[field] = formData[field]
            delete formData[field]
          }
        })

        dispatch(updateComplaintForm(formData))
        if (Object.keys(riskData).length > 0) {
          dispatch(updateRiskAssessment(riskData))
        }
      }

      const aiMsg = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        text: res.data.reply,
        success: res.data.reply.includes("successfully") 
      }
      dispatch(addComplaintMessage(aiMsg))
    } catch (err) {
      dispatch(addComplaintMessage({ id: Date.now().toString(), sender: 'ai', text: 'Error connecting to AI Server.' }))
    } finally {
      dispatch(setComplaintTyping(false))
    }
  }

  // File Upload Handlers
  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => setIsDragging(false)

  const onDrop = useCallback(async (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [form, risk])

  const handleFileUpload = async (file) => {
    dispatch(addComplaintMessage({ id: Date.now().toString(), sender: 'user', text: `Uploaded Document: ${file.name}` }))
    dispatch(setComplaintTyping(true))
    
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await axios.post('http://localhost:8000/api/complaints/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const extractedText = res.data.extracted_text
      
      // Auto-trigger parsing in chat
      handleSend(null, `Extract complaint details from this document content:\n${extractedText}`)
    } catch (err) {
      dispatch(addComplaintMessage({ id: Date.now().toString(), sender: 'ai', text: 'Error parsing document.' }))
      dispatch(setComplaintTyping(false))
    }
  }

  return (
    <div 
      className={`flex flex-col h-full bg-white relative transition-all ${isDragging ? 'ring-4 ring-blue-500 ring-inset bg-blue-50/50' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
           <div className="text-center">
              <UploadCloud size={64} className="text-blue-500 mx-auto mb-4 animate-bounce" />
              <h3 className="text-xl font-bold text-gray-800">Drop Document to Extract</h3>
              <p className="text-gray-500 font-medium">PDF, DOCX, TXT, or Image</p>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot size={26} className="text-blue-600" />
          <div>
            <h2 className="text-[1.1rem] font-bold text-gray-800 tracking-tight">Complaint Copilot</h2>
            <p className="text-xs text-gray-500 font-medium">Drag & Drop or type details</p>
          </div>
        </div>
        <div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={onDrop} accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" />
          <button onClick={() => fileInputRef.current.click()} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <UploadCloud size={20} />
          </button>
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
              <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
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
            placeholder="Type complaint details..."
            className="flex-1 bg-white border-2 border-gray-900 rounded-full py-3 px-5 text-sm outline-none focus:border-blue-600 transition-colors shadow-sm font-medium placeholder-gray-400"
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
