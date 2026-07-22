import { configureStore } from '@reduxjs/toolkit'
import interactionReducer from './interactionSlice'
import chatReducer from './chatSlice'
import complaintReducer from './complaintSlice'
import qaChatReducer from './qaChatSlice'
import riskReducer from './riskSlice'

export const store = configureStore({
  reducer: {
    interaction: interactionReducer,
    chat: chatReducer,
    complaint: complaintReducer,
    qaChat: qaChatReducer,
    risk: riskReducer,
  },
})
