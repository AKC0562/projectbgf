import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentBooking: null,
    bookings: [],
}

const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers:{
        setCurrentBooking: (state, acton)=>{
            state.currentBooking = acton.payload
        },
        addCurrentBooking: (state, action)=>{
            state.bookings.push(action.payload)
        },
        clearCurremtBooking: (state)=>{
            state.currentBooking = null
        }
    }
})

export const {setCurrentBooking,addCurrentBooking,clearCurremtBooking} = bookingSlice.actions
export default bookingSlice.reducer