import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    companions: [],
    selectedCompanion: null,

    loading: false,
    error: null,

    // filters:{
    //     catagory:"all",
    //     location:"",
    //     rating:0,
    // }
}

const companionSlice = createSlice({
    name: "companions",
    initialState,
    reducers:{
        setCompanions: (state, action)=>{
            state.companions = action.payload
        },
        setSelectedCompanion: (state, action)=>{
            state.selectedCompanion = action.payload
        },
        // setFilter: (state, action)=>{
        //     state.filters = {
        //         ...state.filters,
        //         ...action.payload,
        //     }
        // },
        setCompanionLoading: (state, action)=>{
            state.loading = action.payload
        },
        setCompanionError:(state, action)=>{
            state.error = action.payload
        },
        clearSelectedComanion:(state)=>{
            state.selectedCompanion = null
        },
        clearCompanionError: (state)=>{
            state.error = null
        }

    }
})

export const {setCompanions,setSelectCompanion,setCompanionLoading,setCompanionError,clearSelectedComanion,clearError} = companionSlice.actions
export default companionSlice.reducer