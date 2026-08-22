import { createSlice } from "@reduxjs/toolkit";
 const initialState  = {
    user: null,
    isAuthenticated: false,
    role: null,
 }

 const authSlice = createSlice({
     name: "auth",
    initialState,
    reducers: {
        login: (state, action)=>{
            state.user = action.payload
            state.isAuthenticated = true
            state.role = action.payload.role
        },

        logout: (state)=>{
            state.user = null
            state.isAuthenticated = false
            state.role = null
        }
    }
 })


 export const {login, logout} = authSlice.actions
 export default authSlice.reducer