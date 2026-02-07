import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const fetchPropertyConditions = createAsyncThunk('propertyConditions/fetch', async (_, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.get('/api/property-conditions', getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch property conditions');
  }
});

export const createPropertyCondition = createAsyncThunk('propertyConditions/create', async (propertyCondition, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.post('/api/property-conditions', propertyCondition, getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create property condition');
  }
});

export const updatePropertyCondition = createAsyncThunk('propertyConditions/update', async ({ id, propertyCondition }, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { data } = await api.put(`/api/property-conditions/${id}`, propertyCondition, getConfig(auth.admin.token));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update property condition');
  }
});

export const deletePropertyCondition = createAsyncThunk('propertyConditions/delete', async (id, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    await api.delete(`/api/property-conditions/${id}`, getConfig(auth.admin.token));
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete property condition');
  }
});

const propertyConditionSlice = createSlice({
  name: 'propertyConditions',
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
      .addCase(fetchPropertyConditions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPropertyConditions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPropertyConditions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPropertyCondition.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updatePropertyCondition.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deletePropertyCondition.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      });
  },
});

export const { clearError } = propertyConditionSlice.actions;
export default propertyConditionSlice.reducer;
