import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  error: null,
  isAuthenticated: !!localStorage.getItem('user')
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    loginFailure(state, action) {
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('user');
    },
    updateProfileImage(state, action) {
      if (state.user) {
        state.user.profileImage = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    updateUserMainTrip(state, action) {
      if (state.user) {
        state.user.mainTrip = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    setUserPersonality(state, action) {
      if (state.user) {
        state.user.personality = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    }
  }
});

export const {
  loginSuccess,
  loginFailure,
  logout,
  updateProfileImage,
  updateUserMainTrip,
  setUserPersonality
} = userSlice.actions;


export default userSlice.reducer;