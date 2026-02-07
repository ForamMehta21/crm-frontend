import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const fetchLandmarks = createAsyncThunk('landmarks/fetch', async (filters, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/api/landmarks?${params}`, getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch landmarks');
  }
});

export const createLandmark = createAsyncThunk('landmarks/create', async (landmark, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.post('/api/landmarks', landmark, getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create landmark');
  }
});

export const updateLandmark = createAsyncThunk('landmarks/update', async ({ id, landmark }, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.put(`/api/landmarks/${id}`, landmark, getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update landmark');
  }
});

export const deleteLandmark = createAsyncThunk('landmarks/delete', async (id, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    await api.delete(`/api/landmarks/${id}`, getConfig(auth.admin.token));
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete landmark');
  }
});

const landmarkSlice = createSlice({
  name: 'landmarks',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLandmarks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLandmarks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLandmarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLandmark.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateLandmark.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteLandmark.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      });
  },
});

export const { clearError } = landmarkSlice.actions;
export default landmarkSlice.reducer;
