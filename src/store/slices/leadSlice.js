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

export const fetchLeadById = createAsyncThunk('leads/fetchById', async (id, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.get(`/api/leads/${id}`, getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch lead');
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

export const addComment = createAsyncThunk('leads/addComment', async ({ id, text }, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.post(
      `/api/leads/${id}/comments`,
      { text },
      getConfig(auth.admin.token)
    );
    return { id, comments: data.data };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
  }
});

export const fetchFBAdsLeads = createAsyncThunk('leads/fetchFBAds', async (filters, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/api/leads/fb-ads?${params}`, getConfig(auth.admin.token));
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch FB-Ads leads');
  }
});

const leadSlice = createSlice({
  name: 'leads',
  initialState: {
    items: [],
    currentLead: null,
    stats: null,
    loading: false,
    currentLeadLoading: false,
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
    clearCurrentLead: (state) => {
      state.currentLead = null;
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
      .addCase(fetchFBAdsLeads.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFBAdsLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total,
        };
      })
      .addCase(fetchFBAdsLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchLeadById
      .addCase(fetchLeadById.pending, (state) => {
        state.currentLeadLoading = true;
        state.currentLead = null;
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.currentLeadLoading = false;
        state.currentLead = action.payload;
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.currentLeadLoading = false;
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
        if (state.currentLead?._id === action.payload._id) {
          state.currentLead = action.payload;
        }
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      })
      // addComment — update comments on the current lead and in items list
      .addCase(addComment.fulfilled, (state, action) => {
        const { id, comments } = action.payload;
        if (state.currentLead?._id === id) {
          state.currentLead.comments = comments;
        }
        const idx = state.items.findIndex(i => i._id === id);
        if (idx !== -1) {
          state.items[idx].comments = comments;
        }
      });
  },
});

export const { clearError, clearCurrentLead } = leadSlice.actions;
export default leadSlice.reducer;
