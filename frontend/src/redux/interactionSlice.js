import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  hcp_name: '',
  hospital: '',
  speciality: '',
  interaction_date: '',
  interaction_type: 'Meeting',
  topics_discussed: '',
  materials_shared: '',
  samples_distributed: '',
  sentiment: '',
  outcomes: '',
  followup_actions: '',
  followup_date: '',
  priority: '',
  attachments: '',
  save_status: ''
}

const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    updateForm: (state, action) => {
      return { ...state, ...action.payload }
    },
    clearForm: () => initialState,
  },
})

export const { updateForm, clearForm } = interactionSlice.actions
export default interactionSlice.reducer
