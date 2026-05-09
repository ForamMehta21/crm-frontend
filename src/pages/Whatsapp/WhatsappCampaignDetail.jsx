import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
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
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import Layout from '../../components/Layout';
import WaStatCards from '../../components/Whatsapp/WaStatCards';
import {
  fetchCampaignDetail,
  fetchCampaignLogs,
  clearCurrentCampaign,
  clearError
} from '../../store/slices/whatsappSlice';
import api from '../../utils/api';

const statusColors = {
  PENDING: 'default',
  SENT: 'info',
  DELIVERED: 'success',
  READ: 'secondary',
  FAILED: 'error',
  REPLIED: 'warning'
};

const funnelColors = ['#6366f1', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b'];

const WhatsappCampaignDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentCampaign, logs, loading, error, logsPagination } = useSelector((state) => state.whatsapp);
  const { admin } = useSelector((state) => state.auth);

  const [logFilter, setLogFilter] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [logPage, setLogPage] = useState(0);

  useEffect(() => {
    dispatch(fetchCampaignDetail(id));
    dispatch(fetchCampaignLogs({ id, params: { page: 1, limit: 20 } }));
    return () => {
      dispatch(clearCurrentCampaign());
      dispatch(clearError());
    };
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(fetchCampaignLogs({
      id,
      params: { page: logPage + 1, limit: 20, status: logFilter, search: logSearch }
    }));
  }, [dispatch, id, logPage, logFilter, logSearch]);

  const handleExport = async () => {
    try {
      const response = await api.get(`/api/whatsapp/campaigns/${id}/export`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${admin?.token}` }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `campaign-report-${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const stats = currentCampaign?.stats || {};
  const funnelData = [
    { name: 'Total', value: stats.total || 0 },
    { name: 'Sent', value: stats.sent || 0 },
    { name: 'Delivered', value: stats.delivered || 0 },
    { name: 'Read', value: stats.read || 0 },
    { name: 'Failed', value: stats.failed || 0 },
    { name: 'Replied', value: stats.replied || 0 }
  ];

  if (loading && !currentCampaign) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {currentCampaign?.name || 'Campaign Detail'}
          </Typography>
          {currentCampaign?.status && (
            <Chip
              label={currentCampaign.status}
              size="small"
              color={
                currentCampaign.status === 'COMPLETED' ? 'success' :
                currentCampaign.status === 'RUNNING' ? 'warning' :
                currentCampaign.status === 'FAILED' ? 'error' : 'default'
              }
              sx={{ mt: 0.5 }}
            />
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          sx={{ borderRadius: 2 }}
        >
          Export Excel
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <WaStatCards stats={stats} />

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.1)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Delivery Funnel</Typography>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis type="number" stroke="#94a3b8" />
            <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {funnelData.map((entry, index) => (
                <Cell key={index} fill={funnelColors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.1)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Message Logs</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search by name/phone"
              value={logSearch}
              onChange={(e) => { setLogSearch(e.target.value); setLogPage(0); }}
              sx={{ width: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={logFilter}
                onChange={(e) => { setLogFilter(e.target.value); setLogPage(0); }}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="SENT">Sent</MenuItem>
                <MenuItem value="DELIVERED">Delivered</MenuItem>
                <MenuItem value="READ">Read</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
                <MenuItem value="REPLIED">Replied</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Lead Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Sent At</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Delivered At</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Read At</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Failed Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No message logs found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id} hover>
                    <TableCell>{log.leadId?.fullName || '—'}</TableCell>
                    <TableCell>{log.phone}</TableCell>
                    <TableCell>
                      <Chip label={log.status} size="small" color={statusColors[log.status] || 'default'} />
                    </TableCell>
                    <TableCell>
                      {log.sentAt ? new Date(log.sentAt).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell>
                      {log.deliveredAt ? new Date(log.deliveredAt).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell>
                      {log.readAt ? new Date(log.readAt).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="error.main" sx={{ fontSize: '0.75rem' }}>
                        {log.failedReason || '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {logsPagination.total > 0 && (
          <TablePagination
            component="div"
            count={logsPagination.total}
            page={logPage}
            onPageChange={(e, newPage) => setLogPage(newPage)}
            rowsPerPage={20}
            rowsPerPageOptions={[20]}
          />
        )}
      </Paper>
    </Layout>
  );
};

export default WhatsappCampaignDetail;
