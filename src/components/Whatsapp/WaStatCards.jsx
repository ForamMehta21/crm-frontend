import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { softBg } from '../../theme/createAppTheme';
import SendIcon from '@mui/icons-material/Send';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ErrorIcon from '@mui/icons-material/Error';
import ReplyIcon from '@mui/icons-material/Reply';
import GroupIcon from '@mui/icons-material/Group';

const statConfig = [
  { key: 'total', label: 'Total', tone: 'primary', icon: <GroupIcon /> },
  { key: 'sent', label: 'Sent', tone: 'info', icon: <SendIcon /> },
  { key: 'delivered', label: 'Delivered', tone: 'success', icon: <DoneAllIcon /> },
  { key: 'read', label: 'Read', tone: 'violet', icon: <VisibilityIcon /> },
  { key: 'failed', label: 'Failed', tone: 'error', icon: <ErrorIcon /> },
  { key: 'replied', label: 'Replied', tone: 'brass', icon: <ReplyIcon /> },
];

const WaStatCards = ({ stats = {} }) => {
  const total = stats.total || 0;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, gap: { xs: 1.5, sm: 2 }, mb: 3 }}>
      {statConfig.map(({ key, label, tone, icon }) => {
        const value = stats[key] || 0;
        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

        return (
          <Paper
            key={key}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              textAlign: 'center'
            }}
          >
            <Box sx={{ color: `${tone}.main`, bgcolor: (t) => softBg(t, tone), width: 40, height: 40, borderRadius: 2.5, mx: 'auto', mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {icon}
            </Box>
            <Typography variant="h5" component="p" className="tabular-nums" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {label}
            </Typography>
            {key !== 'total' && (
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {percent}%
              </Typography>
            )}
          </Paper>
        );
      })}
    </Box>
  );
};

export default WaStatCards;
