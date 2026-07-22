import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  messages: [
    {
      id: 'welcome',
      sender: 'system',
      text: 'Upload a complaint document or paste text below.\nI will automatically extract the details and populate the form for you.'
    }
  ],
  isTyping: false,
  extractionProgress: 0,
  extractionStatus: '',
  isExtracting: false
}

const qaChatSlice = createSlice({
  name: 'qaChat',
  initialState,
  reducers: {
    addComplaintMessage: (state, action) => {
      state.messages.push(action.payload)
    },
    setComplaintTyping: (state, action) => {
      state.isTyping = action.payload
    },
    setExtractionProgress: (state, action) => {
      state.extractionProgress = action.payload.progress
      state.extractionStatus = action.payload.status
    },
    setExtracting: (state, action) => {
      state.isExtracting = action.payload
    },
    clearComplaintChat: () => initialState,
  },
})

export const { addComplaintMessage, setComplaintTyping, setExtractionProgress, setExtracting, clearComplaintChat } = qaChatSlice.actions
export default qaChatSlice.reducer
