import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Pagination,
  Paper,
  Skeleton,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import Layout from '../components/Layout';
import { softBg } from '../theme/createAppTheme';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  runNotificationsNow,
} from '../store/slices/notificationSlice';
import { formatCallTime, timeAgo, typeMeta } from '../components/Notifications/notificationUtils';

const PAGE_SIZE = 20;

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin } = useSelector((state) => state.auth);
  const { items, unreadCount, pages, loading, error } = useSelector((state) => state.notifications);
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [runResult, setRunResult] = useState(null);

  useEffect(() => {
    dispatch(fetchNotifications({ limit: PAGE_SIZE, page, unread: tab === 'unread' }));
  }, [dispatch, page, tab]);

  const openLead = (n, leadId) => {
    if (!n.read) dispatch(markNotificationRead(n._id));
    navigate(`/leads/view/${leadId}`);
  };

  const runNow = async () => {
    setRunResult(null);
    const result = await dispatch(runNotificationsNow());
    if (runNotificationsNow.rejected.match(result)) {
      setRunResult({ severity: 'error', text: result.payload || 'Run failed' });
      return;
    }
    const { digest, reminders } = result.payload;
    const text = digest?.skipped
      ? `Daily digest: ${digest.skipped}. Call reminders sent: ${reminders?.sent ?? 0}.`
      : `Picked ${digest.followUps} follow-up(s), found ${digest.calls} call(s) today. Call reminders sent: ${reminders?.sent ?? 0}.`;
    setRunResult({ severity: 'success', text });
    dispatch(fetchNotifications({ limit: PAGE_SIZE, page: 1, unread: tab === 'unread' }));
    setPage(1);
  };

  return (
    <Layout>
      <Container maxWidth="md" disableGutters>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h4" component="h2">Notifications</Typography>
            <Typography variant="body2" color="text.secondary">
              Daily follow-ups at 8:00 AM, today's calls, and a reminder 15 minutes before each call.
            </Typography>
          </Box>
          {unreadCount > 0 && (
            <Button variant="outlined" size="small" onClick={() => dispatch(markAllNotificationsRead())}>
              Mark all read
            </Button>
          )}
          {admin?.role === 'admin' && (
            <Button variant="contained" size="small" onClick={runNow}>
              Run now
            </Button>
          )}
        </Box>

        {runResult && <Alert severity={runResult.severity} sx={{ mb: 2 }} onClose={() => setRunResult(null)}>{runResult.text}</Alert>}

        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setPage(1); }}
          sx={{ mb: 2 }}
        >
          <Tab value="all" label="All" />
          <Tab value="unread" label={unreadCount ? `Unread (${unreadCount})` : 'Unread'} />
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading && items.length === 0 ? (
          [1, 2, 3].map((n) => <Skeleton key={n} variant="rounded" height={88} sx={{ mb: 1.5 }} />)
        ) : items.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {tab === 'unread' ? "You're all caught up." : 'No notifications yet.'}
            </Typography>
          </Paper>
        ) : (
          items.map((n) => {
            const meta = typeMeta(n.type);
            const Icon = meta.icon;
            const leads = (n.leads || []).filter(Boolean);
            return (
              <Paper
                key={n._id}
                variant="outlined"
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  mb: 1.5,
                  display: 'flex',
                  gap: 1.5,
                  borderColor: n.read ? undefined : 'primary.main',
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: `${meta.tone}.main`,
                    bgcolor: (t) => softBg(t, meta.tone),
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: n.read ? 600 : 800, flex: 1, minWidth: 0 }}>
                      {n.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{timeAgo(n.createdAt)}</Typography>
                  </Box>

                  {leads.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                      {leads.map((lead) => (
                        <Chip
                          key={lead._id}
                          size="small"
                          clickable
                          onClick={() => openLead(n, lead._id)}
                          label={
                            n.type === 'daily_followup'
                              ? (lead.fullName || lead.phoneNumber)
                              : `${lead.fullName || lead.phoneNumber} · ${formatCallTime(lead.nextCallDate)}`
                          }
                        />
                      ))}
                    </Box>
                  ) : (
                    n.message && <Typography variant="body2" color="text.secondary">{n.message}</Typography>
                  )}

                  {!n.read && (
                    <Button size="small" sx={{ mt: 1, ml: -1 }} onClick={() => dispatch(markNotificationRead(n._id))}>
                      Mark read
                    </Button>
                  )}
                </Box>
              </Paper>
            );
          })
        )}

        {pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
          </Box>
        )}
      </Container>
    </Layout>
  );
};

export default Notifications;
