import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const fetchTemplates = createAsyncThunk('whatsapp/fetchTemplates', async (_, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.get('/api/whatsapp/templates', getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch templates');
  }
});

export const syncTemplates = createAsyncThunk('whatsapp/syncTemplates', async (_, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.post('/api/whatsapp/templates/sync', {}, getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to sync templates');
  }
});

export const fetchCampaigns = createAsyncThunk('whatsapp/fetchCampaigns', async (params, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const query = new URLSearchParams(params || {}).toString();
    const { data } = await api.get(`/api/whatsapp/campaigns?${query}`, getConfig(auth.admin.token));
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaigns');
  }
});

export const fetchCampaignDetail = createAsyncThunk('whatsapp/fetchCampaignDetail', async (id, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.get(`/api/whatsapp/campaigns/${id}`, getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaign detail');
  }
});

export const createCampaign = createAsyncThunk('whatsapp/createCampaign', async (campaignData, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.post('/api/whatsapp/campaigns', campaignData, getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create campaign');
  }
});

export const previewAudience = createAsyncThunk('whatsapp/previewAudience', async ({ id, filters }, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.post(`/api/whatsapp/campaigns/${id}/preview`, { filters }, getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to preview audience');
  }
});

export const sendCampaign = createAsyncThunk('whatsapp/sendCampaign', async ({ id, scheduledAt }, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.post(`/api/whatsapp/campaigns/${id}/send`, { scheduledAt }, getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to send campaign');
  }
});

export const fetchCampaignLogs = createAsyncThunk('whatsapp/fetchCampaignLogs', async ({ id, params }, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const query = new URLSearchParams(params || {}).toString();
    const { data } = await api.get(`/api/whatsapp/campaigns/${id}/logs?${query}`, getConfig(auth.admin.token));
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaign logs');
  }
});

const whatsappSlice = createSlice({
  name: 'whatsapp',
  initialState: {
    templates: [],
    campaigns: [],
    currentCampaign: null,
    logs: [],
    audiencePreview: null,
    loading: false,
    syncLoading: false,
    error: null,
    pagination: { page: 1, pages: 1, total: 0 },
    logsPagination: { page: 1, pages: 1, total: 0 }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCampaign: (state) => {
      state.currentCampaign = null;
      state.logs = [];
      state.audiencePreview = null;
    },
    clearAudiencePreview: (state) => {
      state.audiencePreview = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => { state.loading = true; })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(syncTemplates.pending, (state) => { state.syncLoading = true; })
      .addCase(syncTemplates.fulfilled, (state, action) => {
        state.syncLoading = false;
        state.templates = action.payload;
      })
      .addCase(syncTemplates.rejected, (state, action) => {
        state.syncLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCampaigns.pending, (state) => { state.loading = true; })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total
        };
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCampaignDetail.pending, (state) => { state.loading = true; })
      .addCase(fetchCampaignDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCampaign = action.payload;
      })
      .addCase(fetchCampaignDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.campaigns.unshift(action.payload);
      })
      .addCase(previewAudience.pending, (state) => { state.loading = true; })
      .addCase(previewAudience.fulfilled, (state, action) => {
        state.loading = false;
        state.audiencePreview = action.payload;
      })
      .addCase(previewAudience.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendCampaign.fulfilled, (state, action) => {
        state.currentCampaign = action.payload;
        const idx = state.campaigns.findIndex(c => c._id === action.payload._id);
        if (idx !== -1) state.campaigns[idx] = action.payload;
      })
      .addCase(fetchCampaignLogs.pending, (state) => { state.loading = true; })
      .addCase(fetchCampaignLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.data;
        state.logsPagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total
        };
      })
      .addCase(fetchCampaignLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentCampaign, clearAudiencePreview } = whatsappSlice.actions;
export default whatsappSlice.reducer;
