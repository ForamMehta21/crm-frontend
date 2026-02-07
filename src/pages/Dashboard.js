import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BusinessIcon from '@mui/icons-material/Business';
import HomeIcon from '@mui/icons-material/Home';
import Layout from '../components/Layout';
import { fetchLeadStats } from '../store/slices/leadSlice';

const StatCard = ({ title, value, icon, color }) => (
  <Paper
    sx={{
      p: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '100%',
    }}
  >
    <Box>
      <Typography color="textSecondary" gutterBottom variant="h6">
        {title}
      </Typography>
      <Typography variant="h3" component="div">
        {value}
      </Typography>
    </Box>
    <Box
      sx={{
        backgroundColor: color,
        borderRadius: '50%',
        width: 60,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
      }}
    >
      {icon}
    </Box>
  </Paper>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats } = useSelector((state) => state.leads);

  useEffect(() => {
    dispatch(fetchLeadStats());
  }, [dispatch]);

  return (
    <Layout>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Dashboard Overview
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Leads"
              value={stats?.total || 0}
              icon={<PeopleIcon fontSize="large" />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Buyers"
              value={stats?.buyers || 0}
              icon={<HomeIcon fontSize="large" />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Brokers"
              value={stats?.brokers || 0}
              icon={<BusinessIcon fontSize="large" />}
              color="#ed6c02"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Sellers"
              value={stats?.sellers || 0}
              icon={<TrendingUpIcon fontSize="large" />}
              color="#9c27b0"
            />
          </Grid>
        </Grid>
        
        {stats?.byStatus && stats.byStatus.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Leads by Status
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {stats.byStatus.map((status) => (
                <Grid item xs={12} sm={6} md={4} key={status._id}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" color="textSecondary">
                      {status._id}
                    </Typography>
                    <Typography variant="h4">
                      {status.count}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Layout>
  );
};

export default Dashboard;
