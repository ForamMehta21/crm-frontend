import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  Popover,
  Tooltip,
  Typography,
  CircularProgress,
} from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { softBg } from '../../theme/createAppTheme';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../store/slices/notificationSlice';
import {
  browserNotificationsSupported,
  browserPermission,
  notificationTarget,
  popUpNewNotifications,
  timeAgo,
  typeMeta,
} from './notificationUtils';

const POLL_MS = 60 * 1000;

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin } = useSelector((state) => state.auth);
  const { items, unreadCount, loading, loaded } = useSelector((state) => state.notifications);
  const [anchorEl, setAnchorEl] = useState(null);
  const [permission, setPermission] = useState(browserPermission());
  const adminId = admin?._id;

  const openNotification = useCallback((n) => {
    if (!n.read) dispatch(markNotificationRead(n._id));
    setAnchorEl(null);
    navigate(notificationTarget(n));
  }, [dispatch, navigate]);

  // Keep the latest click handler for pop-ups created by the poller
  const openRef = useRef(openNotification);
  openRef.current = openNotification;

  const poll = useCallback(async () => {
    if (!adminId) return;
    const result = await dispatch(fetchNotifications({ limit: 10 }));
    if (fetchNotifications.fulfilled.match(result)) {
      popUpNewNotifications(adminId, result.payload.data, (n) => openRef.current(n));
    }
  }, [dispatch, adminId]);

  useEffect(() => {
    if (!adminId) return undefined;
    poll();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') poll();
    }, POLL_MS);
    const onVisible = () => document.visibilityState === 'visible' && poll();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [adminId, poll]);

  const enablePopups = async () => {
    if (!browserNotificationsSupported()) return;
    try {
      const result = await window.Notification.requestPermission();
      setPermission(result);
    } catch {
      setPermission(browserPermission());
    }
  };

  const open = Boolean(anchorEl);
  const label = unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications';

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          aria-label={label}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ color: 'text.secondary' }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            {unreadCount ? <NotificationsActiveOutlinedIcon /> : <NotificationsNoneOutlinedIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { sx: { width: 'min(380px, calc(100vw - 32px))', maxHeight: 'min(560px, calc(100vh - 96px))', display: 'flex', flexDirection: 'column' } },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={() => dispatch(markAllNotificationsRead())}>
              Mark all read
            </Button>
          )}
        </Box>

        {permission === 'default' && (
          <Box sx={{ mx: 2, mb: 1.5, p: 1.5, borderRadius: 2, bgcolor: (t) => softBg(t, 'primary') }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Get a pop-up on this computer when a follow-up or call is due.
            </Typography>
            <Button size="small" variant="contained" onClick={enablePopups}>Turn on pop-ups</Button>
          </Box>
        )}
        {permission === 'denied' && (
          <Typography variant="caption" color="text.secondary" sx={{ px: 2, pb: 1 }}>
            Pop-ups are blocked for this site. Allow notifications in your browser's site settings to get them.
          </Typography>
        )}

        <Divider />

        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {!loaded && loading ? (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>
          ) : items.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              You're all caught up.
            </Typography>
          ) : (
            <List disablePadding>
              {items.map((n) => {
                const meta = typeMeta(n.type);
                const Icon = meta.icon;
                return (
                  <ListItemButton
                    key={n._id}
                    onClick={() => openNotification(n)}
                    sx={{
                      alignItems: 'flex-start',
                      gap: 1.5,
                      py: 1.25,
                      bgcolor: n.read ? 'transparent' : (t) => softBg(t, 'primary'),
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
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
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: n.read ? 500 : 700 }}>{n.title}</Typography>
                      {n.message && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        >
                          {n.message}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.disabled" component="div">{timeAgo(n.createdAt)}</Typography>
                    </Box>
                    {!n.read && (
                      <Box aria-label="Unread" sx={{ width: 8, height: 8, mt: 1, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Box>

        <Divider />
        <Button
          fullWidth
          sx={{ borderRadius: 0, py: 1.25 }}
          onClick={() => { setAnchorEl(null); navigate('/notifications'); }}
        >
          See all notifications
        </Button>
      </Popover>
    </>
  );
};

export default NotificationBell;
