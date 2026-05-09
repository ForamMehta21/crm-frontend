import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  alpha,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventIcon from '@mui/icons-material/Event';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BookIcon from '@mui/icons-material/Book';
import CancelIcon from '@mui/icons-material/Cancel';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import PhoneIcon from '@mui/icons-material/Phone';
import GroupsIcon from '@mui/icons-material/Groups';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Layout from '../components/Layout';
import { fetchLeadStats, fetchTodayCalls } from '../store/slices/leadSlice';

const buildWaUrl = (phoneNumber) => {
  let phone = phoneNumber.replace(/\D/g, '');
  if (phone.length === 10) phone = `91${phone}`;
  else if (phone.length > 10 && phone.startsWith('0')) phone = `91${phone.substring(1)}`;
  return `https://api.whatsapp.com/send?phone=${phone}`;
};

const FunnelCard = ({ title, subtitle, count, gradient, icon: Icon, onClick, trend }) => (
  <Card
    sx={{
      background: gradient,
      color: 'white',
      height: '100%',
      minHeight: 140,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
        transform: 'translate(30%, -30%)',
      },
    }}
  >
    <CardActionArea onClick={onClick} sx={{ height: '100%', color: 'inherit', p: 0 }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 24 }} />
          </Box>
          {trend && (
            <Chip
              label={trend}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1, mb: 0.5 }}>
            {count}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, opacity: 0.95 }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {subtitle}
          </Typography>
        </Box>
      </CardContent>
    </CardActionArea>
  </Card>
);

const StatCard = ({ title, value, icon: Icon, color, progress }) => (
  <Card
    sx={{
      backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.6),
      backdropFilter: 'blur(20px)',
      border: '1px solid',
      borderColor: (theme) => alpha(theme.palette.divider, 0.1),
      height: '100%',
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${color}40 0%, ${color}20 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ color: color, fontSize: 22 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {value}
          </Typography>
        </Box>
      </Box>
      {progress !== undefined && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: (theme) => alpha(color, 0.15),
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
            },
          }}
        />
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, todayCalls, todayCallsLoading } = useSelector((state) => state.leads);

  useEffect(() => {
    dispatch(fetchLeadStats());
    dispatch(fetchTodayCalls());
  }, [dispatch]);

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getStatusCount = (statusName) => {
    if (!stats?.byStatus) return 0;
    const status = stats.byStatus.find(s => s._id === statusName);
    return status ? status.count : 0;
  };

  const goToLeads = (status) => {
    if (status) {
      navigate(`/leads?status=${encodeURIComponent(status)}`);
    } else {
      navigate('/leads');
    }
  };

  const totalLeads = stats?.total || 0;
  const followUpCount = getStatusCount('Follow-up');
  const newLeadsCount = getStatusCount('New');

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 2, px: { xs: 0, sm: 2 } }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Welcome back! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your leads today.
          </Typography>
        </Box>

        {/* Quick Stats Row */}
        <Grid container spacing={{ xs: 1.5, sm: 3 }} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Leads"
              value={totalLeads}
              icon={GroupsIcon}
              color="#6366f1"
              progress={100}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Follow-ups Today"
              value={followUpCount}
              icon={PhoneIcon}
              color="#10b981"
              progress={followUpCount > 0 ? Math.min((followUpCount / totalLeads) * 100, 100) : 0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="New This Week"
              value={newLeadsCount}
              icon={PersonAddIcon}
              color="#f59e0b"
              progress={newLeadsCount > 0 ? Math.min((newLeadsCount / totalLeads) * 100, 100) : 0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Hot Leads"
              value={getStatusCount('hot')}
              icon={WhatshotIcon}
              color="#ef4444"
              progress={getStatusCount('hot') > 0 ? Math.min((getStatusCount('hot') / totalLeads) * 100, 100) : 0}
            />
          </Grid>
        </Grid>

        {/* Section Title */}
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}
        >
          Lead Funnel
        </Typography>

        {/* Funnel Cards — 4 per row on large screens */}
        <Grid container spacing={{ xs: 1.5, sm: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FunnelCard
              title="Active Tasks"
              subtitle="Calls scheduled for today"
              count={getStatusCount('Follow-up')}
              gradient="linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
              icon={CheckCircleIcon}
              onClick={() => goToLeads('Follow-up')}
              trend="+12%"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FunnelCard
              title="MFA"
              subtitle="Initiate future activity"
              count={
                getStatusCount('Attempted 1') +
                getStatusCount('Attempted 2') +
                getStatusCount('Attempted 3')
              }
              gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
              icon={TrendingUpIcon}
              onClick={() => goToLeads('Attempted 1')}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FunnelCard
              title="Site Visits"
              subtitle="Visits planned soon"
              count={getStatusCount('site visit planned')}
              gradient="linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
              icon={EventIcon}
              onClick={() => goToLeads('site visit planned')}
              trend="Urgent"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FunnelCard
              title="Lead Merge"
              subtitle="Duplicate entries"
              count={0}
              gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
              icon={PersonAddIcon}
              onClick={() => goToLeads('')}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FunnelCard
              title="Hot Leads"
              subtitle="High priority prospects"
              count={getStatusCount('hot')}
              gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
              icon={WhatshotIcon}
              onClick={() => goToLeads('hot')}
              trend="🔥"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FunnelCard
              title="New Leads"
              subtitle="Fresh opportunities"
              count={getStatusCount('New')}
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              icon={PersonAddIcon}
              onClick={() => goToLeads('New')}
              trend="New"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FunnelCard
              title="Booked"
              subtitle="Confirmed bookings"
              count={getStatusCount('booked')}
              gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
              icon={BookIcon}
              onClick={() => goToLeads('booked')}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FunnelCard
              title="Drop Off"
              subtitle="Closed or lost leads"
              count={getStatusCount('booed someware else')}
              gradient="linear-gradient(135deg, #64748b 0%, #475569 100%)"
              icon={CancelIcon}
              onClick={() => goToLeads('booed someware else')}
            />
          </Grid>
        </Grid>

        {/* Today's Calls Section */}
        <Box sx={{ mt: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AccessTimeIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                Today's Calls
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {todayLabel}
              </Typography>
            </Box>
            {!todayCallsLoading && (
              <Chip
                label={`${todayCalls.length} lead${todayCalls.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  ml: 1,
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  color: '#fff',
                  fontWeight: 700,
                }}
              />
            )}
          </Box>

          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.6),
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: (theme) => alpha(theme.palette.divider, 0.12),
              borderRadius: 2,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' } }}>
                  <TableCell>#</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Call Time</TableCell>
                  <TableCell>Assigned To</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {todayCallsLoading ? (
                  [1, 2, 3].map((n) => (
                    <TableRow key={n}>
                      {[1, 2, 3, 4, 5, 6].map((c) => (
                        <TableCell key={c}><Skeleton variant="text" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : todayCalls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No calls scheduled for today 🎉
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  todayCalls.map((lead, idx) => (
                    <TableRow
                      key={lead._id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/leads/view/${lead._id}`)}
                    >
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{idx + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{lead.fullName || '—'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <a href={`tel:${lead.phoneNumber}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {lead.phoneNumber || '—'}
                          </a>
                          {lead.phoneNumber && (
                            <a
                              href={buildWaUrl(lead.phoneNumber)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{ display: 'inline-flex', alignItems: 'center', color: '#25D366', textDecoration: 'none', padding: '3px', borderRadius: '50%', lineHeight: 0 }}
                            >
                              <WhatsAppIcon style={{ fontSize: 18 }} />
                            </a>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={lead.leadStatus || 'N/A'}
                          size="small"
                          sx={{ fontSize: '0.7rem', height: 22 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={new Date(lead.nextCallDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}>
                          <Typography variant="body2" sx={{ color: '#06b6d4', fontWeight: 600 }}>
                            {new Date(lead.nextCallDate).toLocaleTimeString('en-IN', {
                              timeZone: 'Asia/Kolkata',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{lead.assignedTo?.name || 'Unassigned'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </Layout>
  );
};

export default Dashboard;
