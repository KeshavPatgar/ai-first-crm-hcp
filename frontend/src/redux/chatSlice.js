import { createSlice } from '@reduxjs/toolkit'

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [
      { id: '1', sender: 'system', text: 'Log interaction details here (e.g., "Met Dr. Smith, discussed Prodo-X efficacy, positive sentiment, shared brochure") or ask for help.' }
    ],
    isTyping: false,
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload)
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload
    },
  },
})

export const { addMessage, setTyping } = chatSlice.actions
export default chatSlice.reducer
