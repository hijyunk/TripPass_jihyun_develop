import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import tripReducer from './tripSlice';

export default configureStore({
  reducer: {
    user: userReducer,
    trip: tripReducer,
  },
});