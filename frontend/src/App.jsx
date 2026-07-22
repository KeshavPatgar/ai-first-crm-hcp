import React, { useState } from 'react'
import Dashboard from './pages/Dashboard'
import ComplaintDashboard from './pages/ComplaintDashboard'
import { Stethoscope, ShieldAlert } from 'lucide-react'

function App() {
  const [activeModule, setActiveModule] = useState('hcp')

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-inter flex flex-col">
      <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="font-bold text-gray-800 text-lg">AIVOA <span className="text-gray-400 font-normal">CRM</span></span>
        </div>
        <div className="flex bg-gray-50 p-1.5 border border-gray-200 rounded-full shadow-sm">
          <button 
            onClick={() => setActiveModule('hcp')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeModule === 'hcp' ? 'bg-white text-blue-600 shadow border border-gray-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            <Stethoscope size={16} />
            HCP Interactions
          </button>
          <button 
            onClick={() => setActiveModule('qa')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeModule === 'qa' ? 'bg-white text-gray-800 shadow border border-gray-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            <ShieldAlert size={16} />
            QA & Complaints
          </button>
        </div>
      </header>
      
      <main className="flex-1">
        {activeModule === 'hcp' ? <Dashboard /> : <ComplaintDashboard />}
      </main>
    </div>
  )
}

export default App
