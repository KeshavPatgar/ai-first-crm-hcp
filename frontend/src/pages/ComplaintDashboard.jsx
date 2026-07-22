import React from 'react'
import ComplaintForm from '../components/ComplaintForm'
import ComplaintIntakeAssistant from '../components/ComplaintIntakeAssistant'

export default function ComplaintDashboard() {
  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#F0F2F5] p-6 gap-6 items-start justify-center">
      <div className="max-w-[1400px] w-full flex gap-6 h-full">
        {/* Left Panel */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
          <ComplaintForm />
        </div>
        
        {/* Right Panel */}
        <div className="w-[500px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
          <ComplaintIntakeAssistant />
        </div>
      </div>
    </div>
  )
}
