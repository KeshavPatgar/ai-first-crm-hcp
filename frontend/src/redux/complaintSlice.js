import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  customer_name: '',
  organization: '',
  product_name: '',
  strength: '',
  batch_number: '',
  manufacturing_date: '',
  expiry_date: '',
  complaint_category: '',
  description: '',
  quantity: '',
  packaging: '',
  manufacturing_site: '',
  root_cause: '',
  capa: ''
}

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    updateComplaintForm: (state, action) => {
      return { ...state, ...action.payload }
    },
    clearComplaintForm: () => initialState,
  },
})

export const { updateComplaintForm, clearComplaintForm } = complaintSlice.actions
export default complaintSlice.reducer
