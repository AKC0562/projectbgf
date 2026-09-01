import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  companions: [],
  selectedCompanion: null,

  loading: false,
  error: null,

  // Nearby companions
  nearbyCompanions: [],
  nearbyLoading: false,
  nearbyError: null,
  nearbyRadius: 5,

  // Future filters
  // filters: {
  //   category: "all",
  //   location: "",
  //   rating: 0,
  // },
};

const companionSlice = createSlice({
  name: "companions",

  initialState,

  reducers: {
    // -----------------------------
    // COMPANIONS
    // -----------------------------

    setCompanions: (state, action) => {
      state.companions = action.payload;
    },

    // -----------------------------
    // SELECTED COMPANION
    // -----------------------------

    setSelectedCompanion: (state, action) => {
      state.selectedCompanion = action.payload;
    },

    clearSelectedCompanion: (state) => {
      state.selectedCompanion = null;
    },

    // -----------------------------
    // MAIN LOADING
    // -----------------------------

    setCompanionLoading: (state, action) => {
      state.loading = action.payload;
    },

    // -----------------------------
    // MAIN ERROR
    // -----------------------------

    setCompanionError: (state, action) => {
      state.error = action.payload;
    },

    clearCompanionError: (state) => {
      state.error = null;
    },

    // -----------------------------
    // NEARBY
    // -----------------------------

    setNearbyCompanions: (state, action) => {
      state.nearbyCompanions = action.payload;
    },

    setNearbyLoading: (state, action) => {
      state.nearbyLoading = action.payload;
    },

    setNearbyError: (state, action) => {
      state.nearbyError = action.payload;
    },

    clearNearbyError: (state) => {
      state.nearbyError = null;
    },

    setNearbyRadius: (state, action) => {
      state.nearbyRadius = action.payload;
    },

    clearNearbyCompanions: (state) => {
      state.nearbyCompanions = [];
    },

    // -----------------------------
    // CLEAR EVERYTHING
    // -----------------------------

    clearCompanions: (state) => {
      state.companions = [];
      state.selectedCompanion = null;

      state.loading = false;
      state.error = null;

      state.nearbyCompanions = [];
      state.nearbyLoading = false;
      state.nearbyError = null;
    },
  },
});

export const {
  setCompanions,
  setSelectedCompanion,
  clearSelectedCompanion,

  setCompanionLoading,
  setCompanionError,
  clearCompanionError,

  setNearbyCompanions,
  setNearbyLoading,
  setNearbyError,
  clearNearbyError,
  setNearbyRadius,
  clearNearbyCompanions,

  clearCompanions,
} = companionSlice.actions;

export default companionSlice.reducer;