import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchInvestors = createAsyncThunk(
  'investors/fetchInvestors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/investors');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch investors');
    }
  }
);

export const createInvestor = createAsyncThunk(
  'investors/createInvestor',
  async (investorData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/investors', investorData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create investor');
    }
  }
);

export const updateInvestor = createAsyncThunk(
  'investors/updateInvestor',
  async ({ id, investor }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/investors/${id}`, investor);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update investor');
    }
  }
);

export const deleteInvestor = createAsyncThunk(
  'investors/deleteInvestor',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/investors/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete investor');
    }
  }
);

const investorSlice = createSlice({
  name: 'investors',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvestors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestors.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInvestors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createInvestor.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateInvestor.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteInvestor.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      });
  },
});

export default investorSlice.reducer;
