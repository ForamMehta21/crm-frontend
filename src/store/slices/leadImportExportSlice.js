import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const getConfigMultipart = (token) => ({
  headers: { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  },
});

export const exportLeads = createAsyncThunk('leadImportExport/export', async (_, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const response = await api.get('/api/leads/export', {
      ...getConfig(auth.admin.token),
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads-export-${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to export leads');
  }
});

export const downloadTemplate = createAsyncThunk('leadImportExport/template', async (_, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const response = await api.get('/api/leads/template', {
      ...getConfig(auth.admin.token),
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'lead-import-template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to download template');
  }
});

export const validateImport = createAsyncThunk('leadImportExport/validate', async (file, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await api.post('/api/leads/validate-import', formData, getConfigMultipart(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to validate import file');
  }
});

export const importLeads = createAsyncThunk('leadImportExport/import', async (validatedRows, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.post('/api/leads/import', { validatedRows }, getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to import leads');
  }
});

const leadImportExportSlice = createSlice({
  name: 'leadImportExport',
  initialState: {
    loading: false,
    error: null,
    validationResults: null,
    importResults: null,
  },
  reducers: {
    clearValidation: (state) => {
      state.validationResults = null;
      state.error = null;
    },
    clearImportResults: (state) => {
      state.importResults = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(exportLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportLeads.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(downloadTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadTemplate.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(downloadTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(validateImport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationResults = null;
      })
      .addCase(validateImport.fulfilled, (state, action) => {
        state.loading = false;
        state.validationResults = action.payload;
      })
      .addCase(validateImport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(importLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.importResults = action.payload;
        state.validationResults = null;
      })
      .addCase(importLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearValidation, clearImportResults } = leadImportExportSlice.actions;
export default leadImportExportSlice.reducer;
