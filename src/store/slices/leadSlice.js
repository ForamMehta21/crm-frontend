import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const fetchLeads = createAsyncThunk('leads/fetch', async (filters, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/api/leads?${params}`, getConfig(auth.admin.token));
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads');
  }
});

export const fetchLeadStats = createAsyncThunk('leads/stats', async (_, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.get('/api/leads/stats', getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch lead stats');
  }
});

export const createLead = createAsyncThunk('leads/create', async (lead, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.post('/api/leads', lead, getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create lead');
  }
});

export const updateLead = createAsyncThunk('leads/update', async ({ id, lead }, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.put(`/api/leads/${id}`, lead, getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update lead');
  }
});

export const deleteLead = createAsyncThunk('leads/delete', async (id, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    await api.delete(`/api/leads/${id}`, getConfig(auth.admin.token));
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete lead');
  }
});

const leadSlice = createSlice({
  name: 'leads',
  initialState: {
    items: [],
    stats: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      pages: 1,
      total: 0,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total,
        };
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchLeadStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      });
  },
});

export const { clearError } = leadSlice.actions;
export default leadSlice.reducer;
