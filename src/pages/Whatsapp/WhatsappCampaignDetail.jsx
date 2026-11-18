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
import { useTheme } from '@mui/material/styles';
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

const funnelTones = ['primary', 'info', 'success', 'violet', 'error', 'brass'];

const WhatsappCampaignDetail = () => {
  const theme = useTheme();
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
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
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

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Delivery Funnel</Typography>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={funnelData} layout="vertical" margin={{ left: 0, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis type="number" stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
            <YAxis dataKey="name" type="category" stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} width={76} />
            <Tooltip
              cursor={{ fill: theme.palette.action.hover }}
              contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8, color: theme.palette.text.primary }}
              labelStyle={{ color: theme.palette.text.primary, fontWeight: 600 }}
              itemStyle={{ color: theme.palette.text.secondary }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {funnelData.map((entry, index) => (
                <Cell key={index} fill={theme.palette[funnelTones[index]].main} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Message Logs</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2 }, width: { xs: '100%', sm: 'auto' } }}>
            <TextField
              size="small"
              placeholder="Search by name/phone"
              value={logSearch}
              onChange={(e) => { setLogSearch(e.target.value); setLogPage(0); }}
              sx={{ width: { xs: '100%', sm: 200 } }}
            />
            <FormControl size="small" sx={{ minWidth: 140, flex: { xs: 1, sm: 'none' } }}>
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

        <TableContainer className="responsive-table">
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
                    <TableCell data-label="Lead Name">{log.leadId?.fullName || '—'}</TableCell>
                    <TableCell data-label="Phone">{log.phone}</TableCell>
                    <TableCell data-label="Status">
                      <Chip label={log.status} size="small" color={statusColors[log.status] || 'default'} />
                    </TableCell>
                    <TableCell data-label="Sent At">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell data-label="Delivered At">
                      {log.deliveredAt ? new Date(log.deliveredAt).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell data-label="Read At">
                      {log.readAt ? new Date(log.readAt).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell data-label="Failed Reason">
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
