import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  role: string | null;
  email: string | null;
}

// Check localStorage for initial token
const storedToken = localStorage.getItem('jwt_token');

let initialRole = null;
let initialEmail = null;
if (storedToken) {
  try {
    const payload = JSON.parse(atob(storedToken.split('.')[1]));
    let auth = payload.auth || null;
    if (typeof auth === 'string' && auth.startsWith(',')) {
      auth = auth.substring(1);
    }
    initialRole = auth;
    initialEmail = payload.sub || null;
  } catch (e) {
    // invalid token
  }
}

const initialState: AuthState = {
  token: storedToken,
  isAuthenticated: !!storedToken,
  role: initialRole,
  email: initialEmail,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string }>
    ) => {
      const token = action.payload.token;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('jwt_token', token);
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        let auth = payload.auth || null;
        if (typeof auth === 'string' && auth.startsWith(',')) {
          auth = auth.substring(1);
        }
        state.role = auth;
        state.email = payload.sub || null;
      } catch (e) {
        state.role = null;
        state.email = null;
      }
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
      state.email = null;
      localStorage.removeItem('jwt_token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
