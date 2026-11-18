import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const errMsg = (error) => error.response?.data?.message || error.message;

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async ({ limit = 20, page = 1, unread = false } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/notifications', { params: { limit, page, unread: unread || undefined } });
      return data;
    } catch (error) {
      return rejectWithValue(errMsg(error));
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/notifications/${id}/read`);
      return data.data;
    } catch (error) {
      return rejectWithValue(errMsg(error));
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.patch('/api/notifications/read-all');
      return true;
    } catch (error) {
      return rejectWithValue(errMsg(error));
    }
  }
);

export const fetchTodayFollowUps = createAsyncThunk(
  'notifications/fetchTodayFollowUps',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/notifications/followups/today');
      return data;
    } catch (error) {
      return rejectWithValue(errMsg(error));
    }
  }
);

export const setFollowUpDone = createAsyncThunk(
  'notifications/setFollowUpDone',
  async ({ id, done }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/notifications/followups/${id}`, { done });
      return data.data;
    } catch (error) {
      return rejectWithValue(errMsg(error));
    }
  }
);

export const runNotificationsNow = createAsyncThunk(
  'notifications/runNow',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/notifications/run-now');
      return data;
    } catch (error) {
      return rejectWithValue(errMsg(error));
    }
  }
);

const initialState = {
  items: [],
  unreadCount: 0,
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  loaded: false,
  error: null,
  followUps: [],
  followUpsDone: 0,
  followUpsLoading: false,
  followUpsError: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.loaded = true;
        state.items = payload.data;
        state.unreadCount = payload.unreadCount;
        state.total = payload.total;
        state.page = payload.page;
        state.pages = payload.pages;
      })
      .addCase(fetchNotifications.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, { payload }) => {
        const item = state.items.find((n) => n._id === payload._id);
        if (item && !item.read) {
          item.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((n) => { n.read = true; });
        state.unreadCount = 0;
      })
      .addCase(fetchTodayFollowUps.pending, (state) => {
        state.followUpsLoading = true;
        state.followUpsError = null;
      })
      .addCase(fetchTodayFollowUps.fulfilled, (state, { payload }) => {
        state.followUpsLoading = false;
        state.followUps = payload.data;
        state.followUpsDone = payload.done;
      })
      .addCase(fetchTodayFollowUps.rejected, (state, { payload }) => {
        state.followUpsLoading = false;
        state.followUpsError = payload;
      })
      .addCase(setFollowUpDone.fulfilled, (state, { payload }) => {
        const pick = state.followUps.find((p) => p._id === payload._id);
        if (pick) {
          pick.done = payload.done;
          pick.doneAt = payload.doneAt;
          pick.doneBy = payload.doneBy;
        }
        state.followUpsDone = state.followUps.filter((p) => p.done).length;
      })
      .addCase('auth/logout', () => initialState);
  },
});

export default notificationSlice.reducer;
