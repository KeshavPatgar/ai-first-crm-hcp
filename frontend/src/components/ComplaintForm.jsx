import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { clearComplaintForm } from '../redux/complaintSlice'
import { clearRiskAssessment } from '../redux/riskSlice'
import { Save, AlertTriangle } from 'lucide-react'
import axios from 'axios'

export default function ComplaintForm() {
  const form = useSelector((state) => state.complaint)
  const risk = useSelector((state) => state.risk)
  const dispatch = useDispatch()
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const handleReset = () => {
    dispatch(clearComplaintForm())
    dispatch(clearRiskAssessment())
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('')
    try {
      const payload = { ...form, ...risk }
      await axios.post('http://localhost:8000/api/complaints/commit', payload)
      setSaveMessage('Committed successfully!')
    } catch (error) {
      console.error(error)
      setSaveMessage('Error committing complaint.')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const InputField = ({ label, value }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
      <input type="text" readOnly value={value || ''} placeholder="Awaiting AI extraction..." className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 text-sm outline-none text-gray-700 placeholder-gray-400" />
    </div>
  )

  const getSeverityColor = (severity) => {
    if (!severity) return 'text-gray-400 border-gray-200 bg-gray-50'
    const s = severity.toLowerCase()
    if (s === 'critical') return 'text-red-700 border-red-200 bg-red-50'
    if (s === 'major') return 'text-orange-700 border-orange-200 bg-orange-50'
    if (s === 'minor') return 'text-yellow-700 border-yellow-200 bg-yellow-50'
    return 'text-blue-700 border-blue-200 bg-blue-50'
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-8 relative">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Complaint Form</h1>
          <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">API & FDF Quality Assurance Module</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">Pending Triage</span>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* Section 1 */}
        <section>
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-gray-400">1.</span> Customer Details
          </h2>
          <div className="grid grid-cols-2 gap-6 pl-4 border-l-2 border-gray-100">
            <InputField label="Complaint Source (Organization)" value={form.organization} />
            <InputField label="Customer Name" value={form.customer_name} />
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-gray-400">2.</span> Product Details
          </h2>
          <div className="grid grid-cols-2 gap-6 pl-4 border-l-2 border-gray-100">
            <InputField label="Product Name" value={form.product_name} />
            <InputField label="Product Strength/Grade" value={form.strength} />
            <InputField label="Batch/Lot Number" value={form.batch_number} />
            <InputField label="Manufacturing Date" value={form.manufacturing_date} />
            <InputField label="Expiry Date" value={form.expiry_date} />
            <InputField label="Quantity Affected" value={form.quantity} />
            <InputField label="Packaging Configuration" value={form.packaging} />
            <InputField label="Manufacturing Site" value={form.manufacturing_site} />
          </div>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-gray-400">3.</span> Complaint Details
          </h2>
          <div className="grid grid-cols-1 gap-6 pl-4 border-l-2 border-gray-100">
            <InputField label="Complaint Category/Type" value={form.complaint_category} />
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Detailed Complaint Description</label>
              <textarea readOnly value={form.description || ''} placeholder="Awaiting AI extraction..." className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 text-sm outline-none resize-none h-24 text-gray-700 placeholder-gray-400"></textarea>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-gray-400">4.</span> AI Risk Assessment
          </h2>
          <div className="grid grid-cols-1 gap-6 pl-4 border-l-2 border-gray-100">
            <div className="flex gap-4">
              <div className="flex-1">
                 <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Severity</label>
                 <div className={`border rounded-md p-2.5 text-sm font-bold flex items-center gap-2 ${getSeverityColor(risk.severity)}`}>
                   {risk.severity ? <AlertTriangle size={16} /> : null}
                   {risk.severity || 'Awaiting Assessment...'}
                 </div>
              </div>
              <div className="flex-1">
                 <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Confidence Score</label>
                 <div className="bg-gray-50 border border-gray-200 rounded-md p-2.5 text-sm text-gray-700 font-mono">
                   {risk.confidence_score ? `${(risk.confidence_score * 100).toFixed(1)}%` : '---'}
                 </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Risk Summary</label>
              <textarea readOnly value={risk.risk_summary || ''} className="w-full bg-blue-50/50 border border-blue-100 rounded-md p-3 text-sm outline-none resize-none h-16 text-gray-700"></textarea>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Suggested Action</label>
              <textarea readOnly value={risk.suggested_action || ''} className="w-full bg-blue-50/50 border border-blue-100 rounded-md p-3 text-sm outline-none resize-none h-16 text-gray-700"></textarea>
            </div>
          </div>
        </section>
        
        {/* Section 5 (AI Root Cause & CAPA Recommendations) */}
        <section>
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-gray-400">5.</span> Defect Analysis
          </h2>
          <div className="grid grid-cols-1 gap-6 pl-4 border-l-2 border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Likely Root Cause (AI Generated)</label>
              <textarea readOnly value={form.root_cause || ''} placeholder="Use the chat to recommend root causes..." className="w-full bg-purple-50/50 border border-purple-100 rounded-md p-3 text-sm outline-none resize-none h-24 text-gray-700 font-mono"></textarea>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Recommended CAPA (AI Generated)</label>
              <textarea readOnly value={form.capa || ''} placeholder="Use the chat to recommend CAPA..." className="w-full bg-green-50/50 border border-green-100 rounded-md p-3 text-sm outline-none resize-none h-24 text-gray-700 font-mono"></textarea>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center sticky bottom-0 bg-white pb-2">
        <button onClick={handleReset} className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">↺ Reset Form</button>
        <div className="flex items-center gap-3">
          {saveMessage && <span className="text-sm font-medium text-green-600">{saveMessage}</span>}
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-bold text-sm transition-all shadow-md disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Committing...' : 'Commit to QMS Ledger'}
          </button>
        </div>
      </div>

    </div>
  )
}
