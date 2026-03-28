import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
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

const FunnelCard = ({ title, subtitle, count, color, icon, onClick }) => (
  <Card
    sx={{
      backgroundColor: color,
      color: 'white',
      height: '100%',
      minHeight: 100,
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      },
    }}
  >
    <CardActionArea onClick={onClick} sx={{ height: '100%', color: 'inherit' }}>
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
    </CardActionArea>
  </Card>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats } = useSelector((state) => state.leads);

  useEffect(() => {
    dispatch(fetchLeadStats());
  }, [dispatch]);

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

  return (
    <Layout>
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Funnel
        </Typography>

        {/* Funnel Cards — 4 per row on large screens */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FunnelCard
              title="Active Tasks"
              subtitle="Calls Today"
              count={getStatusCount('Follow-up')}
              color="#26C6DA"
              icon={<CheckCircleIcon />}
              onClick={() => goToLeads('Follow-up')}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FunnelCard
              title="MFA"
              subtitle="Initiate Future Activity"
              count={
                getStatusCount('Attempted 1') +
                getStatusCount('Attempted 2') +
                getStatusCount('Attempted 3')
              }
              color="#FFA726"
              icon={<TrendingUpIcon />}
              onClick={() => goToLeads('Attempted 1')}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FunnelCard
              title="Visit Expiry"
              subtitle="Soon"
              count={getStatusCount('site visit planned')}
              color="#EC407A"
              icon={<EventIcon />}
              onClick={() => goToLeads('site visit planned')}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FunnelCard
              title="Lead Merge"
              subtitle="Duplicates"
              count={0}
              color="#AB47BC"
              icon={<PersonAddIcon />}
              onClick={() => goToLeads('')}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FunnelCard
              title="Hot Leads"
              subtitle="Priority"
              count={getStatusCount('hot')}
              color="#EF5350"
              icon={<WhatshotIcon />}
              onClick={() => goToLeads('hot')}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FunnelCard
              title="New Leads"
              subtitle="Fresh"
              count={getStatusCount('New')}
              color="#66BB6A"
              icon={<PersonAddIcon />}
              onClick={() => goToLeads('New')}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FunnelCard
              title="Booked Leads"
              subtitle="Confirmed"
              count={getStatusCount('booked')}
              color="#5C6BC0"
              icon={<BookIcon />}
              onClick={() => goToLeads('booked')}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FunnelCard
              title="Drop off Leads"
              subtitle="Closed"
              count={getStatusCount('booed someware else')}
              color="#78909C"
              icon={<CancelIcon />}
              onClick={() => goToLeads('booed someware else')}
            />
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default Dashboard;
