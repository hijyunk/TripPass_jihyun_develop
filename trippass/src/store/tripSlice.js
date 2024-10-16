import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  trip: ""
};

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    updateTrip(state, action) {
      state.trip = action.payload;
    },
    deleteTrip(state) {
      state.trip = "";
    }
}
});

export const { updateTrip, deleteTrip } = tripSlice.actions;

export default tripSlice.reducer;
