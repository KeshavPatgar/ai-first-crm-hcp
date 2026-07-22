import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sparkles, UploadCloud, FileText, Bot, Send } from 'lucide-react'
import axios from 'axios'
import { 
  addComplaintMessage, 
  setComplaintTyping, 
  setExtractionProgress, 
  setExtracting 
} from '../redux/qaChatSlice'
import { updateComplaintForm } from '../redux/complaintSlice'
import { updateRiskAssessment } from '../redux/riskSlice'

export default function ComplaintIntakeAssistant() {
  const { messages, isTyping, extractionProgress, extractionStatus, isExtracting } = useSelector((state) => state.qaChat)
  const form = useSelector((state) => state.complaint)
  const risk = useSelector((state) => state.risk)
  const dispatch = useDispatch()
  
  const [pasteText, setPasteText] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Fake progress simulator while we wait for backend
  const simulateProgress = () => {
    dispatch(setExtracting(true))
    dispatch(setExtractionProgress({ progress: 10, status: 'Analyzing document content and extracting key details...' }))
    
    setTimeout(() => dispatch(setExtractionProgress({ progress: 25, status: 'Running AI analysis on extracted text...' })), 1500)
    setTimeout(() => dispatch(setExtractionProgress({ progress: 50, status: 'Generating risk assessment...' })), 3000)
    setTimeout(() => dispatch(setExtractionProgress({ progress: 75, status: 'Populating complaint form...' })), 4500)
  }

  const handleExtractionSuccess = (data) => {
    dispatch(setExtractionProgress({ progress: 100, status: 'Complete.' }))
    
    if (data.form_data) {
      const riskFields = ["severity", "risk_summary", "suggested_action", "confidence_score"]
      const formData = { ...data.form_data }
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

    if (data.reply) {
      dispatch(addComplaintMessage({ id: Date.now().toString(), sender: 'ai', text: data.reply }))
    }
    
    setTimeout(() => dispatch(setExtracting(false)), 1000)
  }

  const handleExtractionError = () => {
    dispatch(setExtracting(false))
    dispatch(setExtractionProgress({ progress: 0, status: '' }))
    dispatch(addComplaintMessage({ id: Date.now().toString(), sender: 'ai', text: 'Sorry, I encountered an error during extraction.' }))
  }

  const handleFileUpload = async (file) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10 MB limit.")
      return
    }
    
    simulateProgress()
    
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await axios.post('http://localhost:8000/api/complaints/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      handleExtractionSuccess(res.data)
    } catch (err) {
      console.error(err)
      handleExtractionError()
    }
  }

  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) return
    const text = pasteText
    setPasteText('')
    
    simulateProgress()

    try {
      const res = await axios.post('http://localhost:8000/api/complaints/extract', {
        text: text,
        current_form: { ...form, ...risk }
      })
      handleExtractionSuccess(res.data)
    } catch (err) {
      console.error(err)
      handleExtractionError()
    }
  }

  const handleChatSend = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMsg = { id: Date.now().toString(), sender: 'user', text: chatInput }
    dispatch(addComplaintMessage(userMsg))
    setChatInput('')
    dispatch(setComplaintTyping(true))

    try {
      const current_form = { ...form, ...risk }
      const res = await axios.post('http://localhost:8000/api/complaints/chat', {
        message: userMsg.text,
        current_form: current_form
      })

      if (res.data.form_data) {
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

      dispatch(addComplaintMessage({ 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        text: res.data.reply
      }))
    } catch (err) {
      dispatch(addComplaintMessage({ id: Date.now().toString(), sender: 'ai', text: 'Error connecting to AI Server.' }))
    } finally {
      dispatch(setComplaintTyping(false))
    }
  }

  // Drag handlers
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)
  const onDrop = useCallback(async (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [form, risk])

  return (
    <div className="flex flex-col h-full bg-white relative">
      
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <Sparkles size={22} className="text-blue-500" />
          <h2 className="text-lg font-bold text-gray-800 tracking-tight">AI Complaint Intake Assistant</h2>
        </div>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md tracking-wider">
          BETA
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
        
        {/* Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !isExtracting && fileInputRef.current.click()}
        >
          <input type="file" ref={fileInputRef} className="hidden" onChange={onDrop} accept=".pdf,.docx,.txt,.eml" disabled={isExtracting} />
          <UploadCloud size={32} className="text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700">Drag & drop complaint document here</p>
          <p className="text-sm text-gray-500 mt-1">or <span className="text-blue-600 hover:underline">click to browse</span></p>
        </div>

        {/* OR Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">OR</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Paste Area */}
        <div className="mb-6 relative">
          <div className="absolute top-3 left-3 text-gray-400"><FileText size={18} /></div>
          <textarea 
            className="w-full border border-gray-200 rounded-xl bg-gray-50 p-3 pl-10 text-sm outline-none resize-none h-14 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-gray-700 placeholder-gray-400"
            placeholder="Paste Complaint Text / Email"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            disabled={isExtracting}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handlePasteSubmit()
              }
            }}
          ></textarea>
        </div>

        {/* Supported Formats Card */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3 mb-8">
          <div className="text-green-600 mt-0.5">ⓘ</div>
          <div>
            <p className="text-sm text-green-800"><span className="font-semibold">Supported formats:</span> PDF, DOCX, TXT, EML</p>
            <p className="text-sm text-green-800">Max file size: 10MB</p>
          </div>
        </div>

        {/* Extraction Progress */}
        {(isExtracting || extractionProgress === 100) && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Extraction Progress</h3>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500 ease-out rounded-full relative" 
                  style={{ width: `${extractionProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_1.5s_infinite]"></div>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-700">{extractionProgress}%</span>
            </div>
            <p className="text-sm font-medium text-gray-800">{extractionStatus}</p>
            {isExtracting && <p className="text-sm text-gray-500 mt-1">Please wait, this may take a few moments.</p>}
          </div>
        )}

        {/* AI Assistant Section */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">AI Assistant</h3>
          
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <div className="bg-white p-2 rounded-full h-fit shadow-sm text-blue-600">
                  <Bot size={20} />
                </div>
                <p className="text-sm text-blue-900 leading-relaxed font-medium">
                  Upload a complaint document or paste text above.<br/>
                  I will automatically extract the details and populate the form for you.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && (
                  <div className="bg-blue-100/50 p-1.5 rounded-full h-fit mr-2 text-blue-600 mt-1">
                    <Bot size={16} />
                  </div>
                )}
                <div className={`p-3.5 text-sm rounded-xl max-w-[85%] leading-relaxed shadow-sm ${
                  msg.sender === 'user' ? 'bg-gray-100 text-gray-800 rounded-tr-none border border-gray-200' :
                  'bg-blue-50 text-blue-900 border border-blue-100 rounded-tl-none'
                }`}>
                  <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-blue-100/50 p-1.5 rounded-full h-fit mr-2 text-blue-600 mt-1">
                  <Bot size={16} />
                </div>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl rounded-tl-none flex gap-1.5 shadow-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Bottom Chat Input */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <form onSubmit={handleChatSend} className="relative flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask me anything about this complaint..."
            className="flex-1 bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-blue-400 transition-colors shadow-sm text-gray-700 placeholder-gray-400"
            disabled={isExtracting}
          />
          <button 
            type="submit" 
            disabled={isExtracting || !chatInput.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl w-12 flex items-center justify-center transition-colors shadow-sm"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-[10px] text-gray-400 text-center mt-2">AI responses may contain errors. Please verify information.</p>
      </div>

    </div>
  )
}
