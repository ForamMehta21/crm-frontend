import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { softBg } from '../../theme/createAppTheme';
import { buildWaUrl } from '../../utils/whatsapp';
import {
  fetchNotifications,
  fetchTodayFollowUps,
  runNotificationsNow,
  setFollowUpDone,
} from '../../store/slices/notificationSlice';

const istHour = () => Number(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }));

/**
 * Dashboard card: the 5 leads picked at random for today's follow-up.
 * Ticked automatically when someone comments on or updates the lead, or by hand here.
 */
const TodayFollowUps = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { followUps, followUpsDone, followUpsLoading, followUpsError } = useSelector((state) => state.notifications);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState(null);

  useEffect(() => {
    dispatch(fetchTodayFollowUps());
  }, [dispatch]);

  const pickNow = async () => {
    setRunning(true);
    setRunError(null);
    const result = await dispatch(runNotificationsNow());
    setRunning(false);
    if (runNotificationsNow.rejected.match(result)) {
      setRunError(result.payload || 'Could not pick follow-ups');
      return;
    }
    dispatch(fetchTodayFollowUps());
    dispatch(fetchNotifications({ limit: 10 }));
  };

  const total = followUps.length;
  const progress = total ? Math.round((followUpsDone / total) * 100) : 0;

  return (
    <Box sx={{ mt: { xs: 4, sm: 5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            bgcolor: (t) => softBg(t, 'primary'),
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <EventAvailableOutlinedIcon sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 180 }}>
          <Typography variant="h5" component="h2" sx={{ lineHeight: 1.2 }}>
            Today's follow-ups
          </Typography>
          <Typography variant="caption" color="text.secondary">
            5 open leads picked at random · none repeat within 7 days
          </Typography>
        </Box>
        {total > 0 && (
          <Chip
            label={`${followUpsDone} of ${total} done`}
            size="small"
            color={followUpsDone === total ? 'success' : 'primary'}
            sx={{ fontWeight: 700 }}
          />
        )}
      </Box>

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        {total > 0 && (
          <LinearProgress variant="determinate" value={progress} color={followUpsDone === total ? 'success' : 'primary'} aria-label="Follow-ups done" />
        )}

        {followUpsLoading && total === 0 ? (
          <Box sx={{ p: 2 }}>
            {[1, 2, 3].map((n) => <Skeleton key={n} height={44} />)}
          </Box>
        ) : followUpsError ? (
          <Alert severity="error" sx={{ m: 2 }}>{followUpsError}</Alert>
        ) : total === 0 ? (
          <Box sx={{ p: { xs: 2.5, sm: 3 }, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {istHour() < 8
                ? "Today's list is picked at 8:00 AM."
                : 'No follow-ups yet today. There may be no open leads left that weren\'t picked this week.'}
            </Typography>
            <Button variant="outlined" size="small" onClick={pickNow} disabled={running}>
              {running ? 'Picking…' : 'Pick today\'s follow-ups now'}
            </Button>
            {runError && <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>{runError}</Alert>}
          </Box>
        ) : (
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {followUps.map((pick, idx) => {
              const lead = pick.lead;
              return (
                <Box
                  component="li"
                  key={pick._id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    gap: { xs: 1, sm: 2 },
                    px: { xs: 1, sm: 2 },
                    py: 1.25,
                    borderTop: idx === 0 ? 'none' : (t) => `1px solid ${t.palette.divider}`,
                    opacity: pick.done ? 0.65 : 1,
                  }}
                >
                  <Tooltip title={pick.done ? `Done${pick.doneBy?.name ? ` by ${pick.doneBy.name}` : ''}` : 'Mark as done'}>
                    <Checkbox
                      checked={pick.done}
                      onChange={(e) => dispatch(setFollowUpDone({ id: pick._id, done: e.target.checked }))}
                      inputProps={{ 'aria-label': `Mark ${lead.fullName || lead.phoneNumber} as followed up` }}
                      color="success"
                    />
                  </Tooltip>

                  <Box
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(`/leads/view/${lead._id}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/leads/view/${lead._id}`)}
                    sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, textDecoration: pick.done ? 'line-through' : 'none' }}
                      noWrap
                    >
                      {lead.fullName || lead.phoneNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap component="div">
                      {lead.phoneNumber} · {lead.assignedTo?.name || 'Unassigned'}
                    </Typography>
                  </Box>

                  <Chip
                    label={lead.leadStatus || 'N/A'}
                    size="small"
                    sx={{ fontSize: '0.7rem', height: 22, ml: { xs: 6, sm: 0 } }}
                  />

                  <Box sx={{ display: 'flex', gap: 0.5, ml: { xs: 'auto', sm: 0 } }}>
                    <Tooltip title={`Call ${lead.phoneNumber}`}>
                      <IconButton size="small" component="a" href={`tel:${lead.phoneNumber}`} aria-label={`Call ${lead.fullName || lead.phoneNumber}`}>
                        <PhoneOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="WhatsApp">
                      <IconButton
                        size="small"
                        component="a"
                        href={buildWaUrl(lead.phoneNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`WhatsApp ${lead.fullName || lead.phoneNumber}`}
                        sx={{ color: theme.palette.whatsapp?.main }}
                      >
                        <WhatsAppIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default TodayFollowUps;
