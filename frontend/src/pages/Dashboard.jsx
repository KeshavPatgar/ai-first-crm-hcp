import React from 'react'
import InteractionForm from '../components/InteractionForm'
import ChatAssistant from '../components/ChatAssistant'

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#F0F2F5] p-6 gap-6 items-start justify-center">
      <div className="max-w-[1400px] w-full flex gap-6 h-full">
        {/* Left Panel */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
          <InteractionForm />
        </div>
        
        {/* Right Panel */}
        <div className="w-[450px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
          <ChatAssistant />
        </div>
      </div>
    </div>
  )
}
