import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { isTokenExpired } from '../../utils/tokenUtils';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/api/auth/login', credentials);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { getState, rejectWithValue }) => {
  try {
    const { auth } = getState();
    if (!auth.admin?.token) {
      return rejectWithValue('No token found');
    }
    
    if (isTokenExpired(auth.admin.token)) {
      return rejectWithValue('Token expired');
    }
    
    // Fetch fresh profile from server to sync role and other fields
    try {
      const { data } = await api.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${auth.admin.token}` },
      });
      return { ...data.data, token: auth.admin.token };
    } catch (networkError) {
      // If network fails but token is still valid, use cached data
      return auth.admin;
    }
  } catch (error) {
    return rejectWithValue('Auth check failed');
  }
});

export const getProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const config = {
      headers: {
        Authorization: `Bearer ${auth.admin.token}`,
      },
    };
    const { data } = await api.get('/api/auth/profile', config);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    admin: null,
    loading: false,
    error: null,
    isInitialized: false,
  },
  reducers: {
    logout: (state) => {
      state.admin = null;
      state.loading = false;
      state.error = null;
      state.isInitialized = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.admin = { ...state.admin, ...action.payload };
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.admin = action.payload;
        state.isInitialized = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.admin = null;
        state.isInitialized = true;
      });
  },
});

export const { logout, clearError, setInitialized } = authSlice.actions;
export default authSlice.reducer;
