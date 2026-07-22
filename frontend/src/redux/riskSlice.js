import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  severity: '',
  risk_summary: '',
  suggested_action: '',
  confidence_score: 0.0
}

const riskSlice = createSlice({
  name: 'risk',
  initialState,
  reducers: {
    updateRiskAssessment: (state, action) => {
      return { ...state, ...action.payload }
    },
    clearRiskAssessment: () => initialState,
  },
})

export const { updateRiskAssessment, clearRiskAssessment } = riskSlice.actions
export default riskSlice.reducer
