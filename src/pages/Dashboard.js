import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventIcon from '@mui/icons-material/Event';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BookIcon from '@mui/icons-material/Book';
import CancelIcon from '@mui/icons-material/Cancel';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import Layout from '../components/Layout';
import { fetchLeadStats } from '../store/slices/leadSlice';

const FunnelCard = ({ title, subtitle, count, color, icon }) => (
  <Card
    sx={{
      backgroundColor: color,
      color: 'white',
      height: '100%',
      minHeight: 100,
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {subtitle}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 48,
            height: 48,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {count}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats } = useSelector((state) => state.leads);

  useEffect(() => {
    dispatch(fetchLeadStats());
  }, [dispatch]);

  const getStatusCount = (statusName) => {
    if (!stats?.byStatus) return 0;
    const status = stats.byStatus.find(s => s._id === statusName);
    return status ? status.count : 0;
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Funnel
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FunnelCard
              title="Active Tasks"
              subtitle="Calls Today"
              count={getStatusCount('Follow-up')}
              color="#26C6DA"
              icon={<CheckCircleIcon />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FunnelCard
              title="MFA"
              subtitle="Initiate Future Activity"
              count={getStatusCount('Attempted 1') + getStatusCount('Attempted 2') + getStatusCount('Attempted 3')}
              color="#FFA726"
              icon={<TrendingUpIcon />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FunnelCard
              title="Visit Expiry"
              subtitle="Soon"
              count={getStatusCount('site visit planned')}
              color="#EC407A"
              icon={<EventIcon />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FunnelCard
              title="Lead Merge"
              subtitle="Duplicates"
              count={0}
              color="#AB47BC"
              icon={<PersonAddIcon />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FunnelCard
              title="Hot Leads"
              subtitle="Priority"
              count={getStatusCount('hot')}
              color="#EF5350"
              icon={<WhatshotIcon />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FunnelCard
              title="New Leads"
              subtitle="Fresh"
              count={getStatusCount('New')}
              color="#66BB6A"
              icon={<PersonAddIcon />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FunnelCard
              title="Booked Leads"
              subtitle="Confirmed"
              count={getStatusCount('booked')}
              color="#5C6BC0"
              icon={<BookIcon />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FunnelCard
              title="Drop off Leads"
              subtitle="Closed"
              count={getStatusCount('booed someware else')}
              color="#78909C"
              icon={<CancelIcon />}
            />
          </Grid>
        </Grid>

        {stats?.byStatus && stats.byStatus.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              All Lead Statistics
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="textSecondary">
                    Total Leads
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    {stats?.total || 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="textSecondary">
                    Buyers
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                    {stats?.buyers || 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="textSecondary">
                    Brokers
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#ed6c02' }}>
                    {stats?.brokers || 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="textSecondary">
                    Sellers
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                    {stats?.sellers || 0}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </Layout>
  );
};

export default Dashboard;
