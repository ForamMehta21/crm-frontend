import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ErrorIcon from '@mui/icons-material/Error';
import ReplyIcon from '@mui/icons-material/Reply';
import GroupIcon from '@mui/icons-material/Group';

const statConfig = [
  { key: 'total', label: 'Total', color: '#6366f1', icon: <GroupIcon /> },
  { key: 'sent', label: 'Sent', color: '#3b82f6', icon: <SendIcon /> },
  { key: 'delivered', label: 'Delivered', color: '#10b981', icon: <DoneAllIcon /> },
  { key: 'read', label: 'Read', color: '#8b5cf6', icon: <VisibilityIcon /> },
  { key: 'failed', label: 'Failed', color: '#ef4444', icon: <ErrorIcon /> },
  { key: 'replied', label: 'Replied', color: '#f59e0b', icon: <ReplyIcon /> },
];

const WaStatCards = ({ stats = {} }) => {
  const total = stats.total || 0;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 2, mb: 3 }}>
      {statConfig.map(({ key, label, color, icon }) => {
        const value = stats[key] || 0;
        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

        return (
          <Paper
            key={key}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid',
              borderColor: 'rgba(148, 163, 184, 0.1)',
              textAlign: 'center'
            }}
          >
            <Box sx={{ color, mb: 1, display: 'flex', justifyContent: 'center' }}>
              {icon}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color }}>
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
