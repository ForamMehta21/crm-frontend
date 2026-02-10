import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const fetchPropertyTypes = createAsyncThunk('propertyTypes/fetch', async (_, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.get('/api/property-types', getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch property types');
  }
});

export const createPropertyType = createAsyncThunk('propertyTypes/create', async (propertyType, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.post('/api/property-types', propertyType, getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create property type');
  }
});

export const updatePropertyType = createAsyncThunk('propertyTypes/update', async ({ id, propertyType }, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.put(`/api/property-types/${id}`, propertyType, getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update property type');
  }
});

export const deletePropertyType = createAsyncThunk('propertyTypes/delete', async (id, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    await api.delete(`/api/property-types/${id}`, getConfig(auth.admin.token));
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete property type');
  }
});

const propertyTypeSlice = createSlice({
  name: 'propertyTypes',
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
      .addCase(fetchPropertyTypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPropertyTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPropertyTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPropertyType.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updatePropertyType.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deletePropertyType.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      });
  },
});

export const { clearError } = propertyTypeSlice.actions;
export default propertyTypeSlice.reducer;
