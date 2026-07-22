import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateForm } from '../redux/interactionSlice'
import { Search, Plus, Mic, Save } from 'lucide-react'
import axios from 'axios'

export default function InteractionForm() {
  const form = useSelector((state) => state.interaction)
  const dispatch = useDispatch()
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const handleChange = (field, value) => {
    dispatch(updateForm({ [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('')
    try {
      await axios.post('http://localhost:8000/api/interaction/', form)
      setSaveMessage('Saved successfully!')
    } catch (error) {
      console.error(error)
      setSaveMessage('Error saving interaction.')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[1.35rem] font-bold text-gray-800">Interaction Details</h1>
        <div className="flex items-center gap-4">
          {saveMessage && <span className="text-sm font-medium text-green-600">{saveMessage}</span>}
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Interaction'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5">HCP Name</label>
            <input type="text" value={form.hcp_name} onChange={(e) => handleChange('hcp_name', e.target.value)} placeholder="Name" className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5">Hospital</label>
            <input type="text" value={form.hospital} onChange={(e) => handleChange('hospital', e.target.value)} placeholder="Hospital" className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5">Speciality</label>
            <input type="text" value={form.speciality} onChange={(e) => handleChange('speciality', e.target.value)} placeholder="Speciality" className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5">Interaction Date</label>
            <input type="date" value={form.interaction_date} onChange={(e) => handleChange('interaction_date', e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5">Interaction Type</label>
            <input type="text" value={form.interaction_type} onChange={(e) => handleChange('interaction_type', e.target.value)} placeholder="Type" className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
          </div>
        </div>

        {/* Topics Discussed */}
        <div>
          <label className="block text-sm font-semibold text-gray-500 mb-1.5">Topics Discussed</label>
          <textarea value={form.topics_discussed} onChange={(e) => handleChange('topics_discussed', e.target.value)} placeholder="Topics discussed..." className="w-full bg-white border border-gray-300 rounded-md p-3 text-sm h-24 outline-none resize-none font-mono text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"></textarea>
          <button className="flex items-center text-blue-500 text-xs mt-2 font-medium hover:underline">
            <Mic size={14} className="mr-1" />
            Summarize from Voice Note (Requires Consent)
          </button>
        </div>

        {/* Materials & Samples */}
        <div>
          <h3 className="text-sm font-bold text-gray-600 mb-3">Materials Shared / Samples Distributed</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-500 mb-1.5">Materials Shared</label>
            <div className="flex items-center justify-between border border-gray-200 rounded-md p-1 pl-3 bg-white">
              <span className="text-sm text-gray-500">{form.materials_shared || 'No materials added.'}</span>
              <button className="flex items-center text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-100">
                <Search size={14} className="mr-1 text-blue-500" /> Search/Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5">Samples Distributed</label>
            <div className="flex items-center justify-between border border-gray-200 rounded-md p-1 pl-3 bg-white">
              <span className="text-sm text-gray-500">{form.samples_distributed || 'No samples added.'}</span>
              <button className="flex items-center text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-100">
                <Plus size={14} className="mr-1 text-purple-500" /> Add Sample
              </button>
            </div>
          </div>
        </div>

        {/* Sentiment */}
        <div>
          <label className="block text-sm font-semibold text-gray-500 mb-2">Observed/Inferred HCP Sentiment</label>
          <div className="flex gap-6">
            <label className="flex items-center text-sm text-gray-700 cursor-pointer">
              <input type="radio" onChange={() => handleChange('sentiment', 'positive')} checked={form.sentiment?.toLowerCase() === 'positive'} className="mr-2 w-4 h-4 text-purple-600 focus:ring-purple-500" />
              😊 Positive
            </label>
            <label className="flex items-center text-sm text-gray-700 cursor-pointer">
              <input type="radio" onChange={() => handleChange('sentiment', 'neutral')} checked={form.sentiment?.toLowerCase() === 'neutral'} className="mr-2 w-4 h-4 text-orange-400 focus:ring-orange-400" />
              😐 Neutral
            </label>
            <label className="flex items-center text-sm text-gray-700 cursor-pointer">
              <input type="radio" onChange={() => handleChange('sentiment', 'negative')} checked={form.sentiment?.toLowerCase() === 'negative'} className="mr-2 w-4 h-4 text-yellow-500 focus:ring-yellow-500" />
              ☹️ Negative
            </label>
          </div>
        </div>

        {/* Outcomes */}
        <div>
          <label className="block text-sm font-semibold text-gray-500 mb-1.5">Outcomes</label>
          <textarea value={form.outcomes} onChange={(e) => handleChange('outcomes', e.target.value)} placeholder="Key outcomes or agreements..." className="w-full bg-white border border-gray-300 rounded-md p-3 text-sm h-24 outline-none resize-none font-mono text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"></textarea>
        </div>

        {/* Follow up Actions */}
        <div>
          <label className="block text-sm font-semibold text-gray-500 mb-1.5">Follow-up Actions</label>
          <textarea value={form.followup_actions} onChange={(e) => handleChange('followup_actions', e.target.value)} placeholder="Follow-up actions..." className="w-full bg-white border border-gray-300 rounded-md p-3 text-sm h-16 outline-none resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"></textarea>
        </div>

        {/* Follow up date */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5">Follow-up Date</label>
            <input type="date" value={form.followup_date} onChange={(e) => handleChange('followup_date', e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  )
}
