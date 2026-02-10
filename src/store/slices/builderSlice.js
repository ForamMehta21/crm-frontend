import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchBuilders = createAsyncThunk(
  'builders/fetchBuilders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/builders');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch builders');
    }
  }
);

export const createBuilder = createAsyncThunk(
  'builders/createBuilder',
  async (builderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/builders', builderData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create builder');
    }
  }
);

export const updateBuilder = createAsyncThunk(
  'builders/updateBuilder',
  async ({ id, builder }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/builders/${id}`, builder);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update builder');
    }
  }
);

export const deleteBuilder = createAsyncThunk(
  'builders/deleteBuilder',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/builders/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete builder');
    }
  }
);

const builderSlice = createSlice({
  name: 'builders',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuilders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBuilders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBuilders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBuilder.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateBuilder.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteBuilder.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      });
  },
});

export default builderSlice.reducer;
