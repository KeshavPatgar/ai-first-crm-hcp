import React from 'react'
import { useSelector } from 'react-redux'
import { Search, Plus, Mic } from 'lucide-react'

export default function InteractionForm() {
  const form = useSelector((state) => state.interaction)

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-8">
      <h1 className="text-[1.35rem] font-bold text-gray-800 mb-8">Interaction Details</h1>

      <div className="space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5">HCP Name</label>
            <input type="text" readOnly value={form.hcp_name} placeholder="Name" className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5">Hospital</label>
            <input type="text" readOnly value={form.hospital} placeholder="Hospital" className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 text-sm outline-none" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5">Speciality</label>
            <input type="text" readOnly value={form.speciality} placeholder="Speciality" className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5">Interaction Date</label>
            <input type="text" readOnly value={form.interaction_date} placeholder="Date" className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5">Interaction Type</label>
            <input type="text" readOnly value={form.interaction_type} className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 text-sm outline-none" />
          </div>
        </div>

        {/* Topics Discussed */}
        <div>
          <label className="block text-sm font-semibold text-gray-500 mb-1.5">Topics Discussed</label>
          <textarea readOnly value={form.topics_discussed} className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 text-sm h-24 outline-none resize-none font-mono text-gray-700"></textarea>
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
            <label className="flex items-center text-sm text-gray-700">
              <input type="radio" readOnly checked={form.sentiment?.toLowerCase() === 'positive'} className="mr-2 w-4 h-4 text-purple-600 focus:ring-purple-500" />
              😊 Positive
            </label>
            <label className="flex items-center text-sm text-gray-700">
              <input type="radio" readOnly checked={form.sentiment?.toLowerCase() === 'neutral'} className="mr-2 w-4 h-4 text-orange-400 focus:ring-orange-400" />
              😐 Neutral
            </label>
            <label className="flex items-center text-sm text-gray-700">
              <input type="radio" readOnly checked={form.sentiment?.toLowerCase() === 'negative'} className="mr-2 w-4 h-4 text-yellow-500 focus:ring-yellow-500" />
              ☹️ Negative
            </label>
          </div>
        </div>

        {/* Outcomes */}
        <div>
          <label className="block text-sm font-semibold text-gray-500 mb-1.5">Outcomes</label>
          <textarea readOnly value={form.outcomes} placeholder="Key outcomes or agreements..." className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 text-sm h-24 outline-none resize-none font-mono text-gray-700"></textarea>
        </div>

        {/* Follow up Actions */}
        <div>
          <label className="block text-sm font-semibold text-gray-500 mb-1.5">Follow-up Actions</label>
          <textarea readOnly value={form.followup_actions} className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 text-sm h-16 outline-none resize-none"></textarea>
        </div>

        {/* Follow up date */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5">Follow-up Date</label>
            <input type="text" readOnly value={form.followup_date} className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 text-sm outline-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
