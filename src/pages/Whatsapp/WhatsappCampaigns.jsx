import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  TablePagination,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Layout from '../../components/Layout';
import { fetchCampaigns, clearError } from '../../store/slices/whatsappSlice';

const statusConfig = {
  DRAFT: { color: 'default' },
  SCHEDULED: { color: 'info' },
  RUNNING: { color: 'warning' },
  COMPLETED: { color: 'success' },
  FAILED: { color: 'error' }
};

const WhatsappCampaigns = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { campaigns, loading, error, pagination } = useSelector((state) => state.whatsapp);
  const { admin } = useSelector((state) => state.auth);
  const isAdmin = admin?.role === 'admin';

  useEffect(() => {
    dispatch(fetchCampaigns({ page: 1, limit: 20 }));
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const handlePageChange = (event, newPage) => {
    dispatch(fetchCampaigns({ page: newPage + 1, limit: 20 }));
  };

  return (
    <Layout>
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          WhatsApp Campaigns
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/whatsapp/campaigns/new')}
            
          >
            New Campaign
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} variant="outlined" className="responsive-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Campaign Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Template</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Recipients</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Sent / Delivered / Read</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Scheduled</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No campaigns yet. Create your first campaign.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => (
                <TableRow key={campaign._id} hover>
                  <TableCell data-label="Campaign">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{campaign.name}</Typography>
                  </TableCell>
                  <TableCell data-label="Template">
                    <Typography variant="body2">{campaign.templateId?.name || '—'}</Typography>
                  </TableCell>
                  <TableCell data-label="Status">
                    <Chip
                      label={campaign.status}
                      size="small"
                      color={statusConfig[campaign.status]?.color || 'default'}
                    />
                  </TableCell>
                  <TableCell data-label="Recipients">{campaign.stats?.total || 0}</TableCell>
                  <TableCell data-label="Sent / Delivered / Read">
                    <Typography variant="body2">
                      {campaign.stats?.sent || 0} / {campaign.stats?.delivered || 0} / {campaign.stats?.read || 0}
                    </Typography>
                  </TableCell>
                  <TableCell data-label="Scheduled">
                    {campaign.scheduledAt
                      ? new Date(campaign.scheduledAt).toLocaleString()
                      : '—'}
                  </TableCell>
                  <TableCell data-label="Actions">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/whatsapp/campaigns/${campaign._id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {pagination.total > 0 && (
          <TablePagination
            component="div"
            count={pagination.total}
            page={pagination.page - 1}
            onPageChange={handlePageChange}
            rowsPerPage={20}
            rowsPerPageOptions={[20]}
          />
        )}
      </TableContainer>
    </Layout>
  );
};

export default WhatsappCampaigns;
