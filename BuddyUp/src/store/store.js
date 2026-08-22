import  {configureStore} from '@reduxjs/toolkit'

import authReducer from './slices/authSlice'
import companionReducer from './slices/companionSlice'
import bookingReducer from './slices/boookingSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        companions: companionReducer,
        bookings: bookingReducer,
    }
})