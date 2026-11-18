import React, { useEffect, useMemo, useCallback, memo } from 'react';
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
import { alpha, useTheme } from '@mui/material/styles';
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
import { softBg } from '../theme/createAppTheme';
import { fetchLeadStats, fetchTodayCalls } from '../store/slices/leadSlice';
import { buildWaUrl } from '../utils/whatsapp';
import TodayFollowUps from '../components/Notifications/TodayFollowUps';
import { formatCallTime } from '../components/Notifications/notificationUtils';

const FunnelCard = memo(({ title, subtitle, count, tone, icon: Icon, onClick, trend }) => (
  <Card
    sx={{
      height: '100%',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: 4,
        borderColor: (theme) => alpha(theme.palette[tone].main, 0.5),
      },
    }}
  >
    <CardActionArea onClick={onClick} sx={{ height: '100%', p: 0 }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 }, p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: (theme) => softBg(theme, tone),
              color: `${tone}.main`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Box>
          {trend && (
            <Chip
              label={trend}
              size="small"
              sx={{
                bgcolor: (theme) => softBg(theme, tone),
                color: `${tone}.main`,
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>
        <Box>
          <Typography variant="h4" component="p" className="tabular-nums" sx={{ fontWeight: 800, lineHeight: 1.1, mb: 0.5 }}>
            {count}
          </Typography>
          <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </CardContent>
    </CardActionArea>
  </Card>
));

const StatCard = memo(({ title, value, icon: Icon, tone, progress }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, mb: progress !== undefined ? 2 : 0 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            bgcolor: (theme) => softBg(theme, tone),
            color: `${tone}.main`,
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }} noWrap>
            {title}
          </Typography>
          <Typography variant="h5" component="p" className="tabular-nums" sx={{ fontWeight: 800 }}>
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
            bgcolor: (theme) => softBg(theme, tone),
            '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: `${tone}.main` },
          }}
        />
      )}
    </CardContent>
  </Card>
));

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { stats, todayCalls, todayCallsLoading } = useSelector((state) => state.leads);
  const { admin } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchLeadStats());
    dispatch(fetchTodayCalls());
  }, [dispatch]);

  const todayLabel = useMemo(() => new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }), []);

  const getStatusCount = useCallback((statusName) => {
    if (!stats?.byStatus) return 0;
    const status = stats.byStatus.find(s => s._id === statusName);
    return status ? status.count : 0;
  }, [stats]);

  const goToLeads = useCallback((status) => {
    if (status) {
      navigate(`/leads?status=${encodeURIComponent(status)}`);
    } else {
      navigate('/leads');
    }
  }, [navigate]);

  const totalLeads = stats?.total || 0;
  const followUpCount = getStatusCount('Follow-up');
  const newLeadsCount = getStatusCount('New');

  return (
    <Layout>
      <Container maxWidth={false}>
        {/* Welcome Section */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography variant="h4" component="h2" sx={{ mb: 0.5 }}>
            Welcome back{admin?.name ? `, ${admin.name.split(' ')[0]}` : ''}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your leads today.
          </Typography>
        </Box>

        {/* Quick Stats Row */}
        <Grid container spacing={{ xs: 1.5, sm: 2, lg: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid item xs={6} lg={3}>
            <StatCard
              title="Total Leads"
              value={totalLeads}
              icon={GroupsIcon}
              tone="primary"
              progress={100}
            />
          </Grid>
          <Grid item xs={6} lg={3}>
            <StatCard
              title="Follow-ups Today"
              value={followUpCount}
              icon={PhoneIcon}
              tone="success"
              progress={followUpCount > 0 ? Math.min((followUpCount / totalLeads) * 100, 100) : 0}
            />
          </Grid>
          <Grid item xs={6} lg={3}>
            <StatCard
              title="New This Week"
              value={newLeadsCount}
              icon={PersonAddIcon}
              tone="warning"
              progress={newLeadsCount > 0 ? Math.min((newLeadsCount / totalLeads) * 100, 100) : 0}
            />
          </Grid>
          <Grid item xs={6} lg={3}>
            <StatCard
              title="Hot Leads"
              value={getStatusCount('hot')}
              icon={WhatshotIcon}
              tone="error"
              progress={getStatusCount('hot') > 0 ? Math.min((getStatusCount('hot') / totalLeads) * 100, 100) : 0}
            />
          </Grid>
        </Grid>

        {/* Section Title */}
        <Typography variant="h5" component="h2" sx={{ mb: { xs: 2, sm: 2.5 } }}>
          Lead funnel
        </Typography>

        {/* Funnel Cards — 4 per row on large screens */}
        <Grid container spacing={{ xs: 1.5, sm: 2, lg: 3 }}>
          <Grid item xs={6} md={4} lg={3}>
            <FunnelCard
              title="Active Tasks"
              subtitle="Calls scheduled for today"
              count={getStatusCount('Follow-up')}
              tone="info"
              icon={CheckCircleIcon}
              onClick={() => goToLeads('Follow-up')}
              trend="+12%"
            />
          </Grid>

          <Grid item xs={6} md={4} lg={3}>
            <FunnelCard
              title="MFA"
              subtitle="Initiate future activity"
              count={
                getStatusCount('Attempted 1') +
                getStatusCount('Attempted 2') +
                getStatusCount('Attempted 3')
              }
              tone="warning"
              icon={TrendingUpIcon}
              onClick={() => goToLeads('Attempted 1')}
            />
          </Grid>

          <Grid item xs={6} md={4} lg={3}>
            <FunnelCard
              title="Site Visits"
              subtitle="Visits planned soon"
              count={getStatusCount('site visit planned')}
              tone="brass"
              icon={EventIcon}
              onClick={() => goToLeads('site visit planned')}
              trend="Urgent"
            />
          </Grid>

          <Grid item xs={6} md={4} lg={3}>
            <FunnelCard
              title="Lead Merge"
              subtitle="Duplicate entries"
              count={0}
              tone="violet"
              icon={PersonAddIcon}
              onClick={() => goToLeads('')}
            />
          </Grid>

          <Grid item xs={6} md={4} lg={3}>
            <FunnelCard
              title="Hot Leads"
              subtitle="High priority prospects"
              count={getStatusCount('hot')}
              tone="error"
              icon={WhatshotIcon}
              onClick={() => goToLeads('hot')}
              trend="🔥"
            />
          </Grid>

          <Grid item xs={6} md={4} lg={3}>
            <FunnelCard
              title="New Leads"
              subtitle="Fresh opportunities"
              count={getStatusCount('New')}
              tone="success"
              icon={PersonAddIcon}
              onClick={() => goToLeads('New')}
              trend="New"
            />
          </Grid>

          <Grid item xs={6} md={4} lg={3}>
            <FunnelCard
              title="Booked"
              subtitle="Confirmed bookings"
              count={getStatusCount('booked')}
              tone="primary"
              icon={BookIcon}
              onClick={() => goToLeads('booked')}
            />
          </Grid>

          <Grid item xs={6} md={4} lg={3}>
            <FunnelCard
              title="Drop Off"
              subtitle="Closed or lost leads"
              count={getStatusCount('booked somewhere else')}
              tone="slate"
              icon={CancelIcon}
              onClick={() => goToLeads('booked somewhere else')}
            />
          </Grid>
        </Grid>

        {/* Today's random follow-ups (admins) */}
        {admin?.role === 'admin' && <TodayFollowUps />}

        {/* Today's Calls Section */}
        <Box sx={{ mt: { xs: 4, sm: 5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                bgcolor: (t) => softBg(t, 'info'),
                color: 'info.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h5" component="h2" sx={{ lineHeight: 1.2 }}>
                Today's calls
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {todayLabel}
              </Typography>
            </Box>
            {!todayCallsLoading && (
              <Chip
                label={`${todayCalls.length} lead${todayCalls.length !== 1 ? 's' : ''}`}
                size="small"
                color="info"
                sx={{ ml: { xs: 'auto', sm: 1 }, fontWeight: 700 }}
              />
            )}
          </Box>

          <TableContainer component={Paper} variant="outlined" className="responsive-table">
            <Table size="small">
              <TableHead>
                <TableRow>
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
                      <TableCell data-label="#" className="hide-on-cards" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{idx + 1}</TableCell>
                      <TableCell data-label="Name" sx={{ fontWeight: 600 }}>{lead.fullName || '—'}</TableCell>
                      <TableCell data-label="Phone">
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
                              aria-label={`WhatsApp ${lead.fullName || ''}`}
                              style={{ display: 'inline-flex', alignItems: 'center', color: theme.palette.whatsapp.main, textDecoration: 'none', padding: '3px', borderRadius: '50%', lineHeight: 0 }}
                            >
                              <WhatsAppIcon style={{ fontSize: 18 }} />
                            </a>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell data-label="Status">
                        <Chip
                          label={lead.leadStatus || 'N/A'}
                          size="small"
                          sx={{ fontSize: '0.7rem', height: 22 }}
                        />
                      </TableCell>
                      <TableCell data-label="Call Time">
                        <Tooltip title={new Date(lead.nextCallDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}>
                          <Typography variant="body2" className="tabular-nums" sx={{ color: 'info.main', fontWeight: 600 }}>
                            {formatCallTime(lead.nextCallDate)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell data-label="Assigned To" sx={{ color: 'text.secondary' }}>{lead.assignedTo?.name || 'Unassigned'}</TableCell>
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
