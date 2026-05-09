import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Alert
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import Layout from '../../components/Layout';
import { fetchTemplates, syncTemplates, clearError } from '../../store/slices/whatsappSlice';

const statusColors = {
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'error'
};

const categoryColors = {
  MARKETING: '#8b5cf6',
  UTILITY: '#3b82f6',
  AUTHENTICATION: '#f59e0b'
};

const WhatsappTemplates = () => {
  const dispatch = useDispatch();
  const { templates, loading, syncLoading, error } = useSelector((state) => state.whatsapp);
  const { admin } = useSelector((state) => state.auth);
  const isAdmin = admin?.role === 'admin';

  useEffect(() => {
    dispatch(fetchTemplates());
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const handleSync = () => {
    dispatch(syncTemplates());
  };

  return (
    <Layout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          WhatsApp Templates
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={syncLoading ? <CircularProgress size={18} color="inherit" /> : <SyncIcon />}
            onClick={handleSync}
            disabled={syncLoading}
            sx={{ borderRadius: 2 }}
          >
            Sync from Meta
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.1)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Language</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Variables</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Body Preview</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No templates found. Click "Sync from Meta" to import.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              templates.map((tpl) => {
                const bodyComp = tpl.components?.find(c => c.type === 'BODY');
                return (
                  <TableRow key={tpl._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{tpl.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tpl.category}
                        size="small"
                        sx={{ backgroundColor: categoryColors[tpl.category] || '#6366f1', color: '#fff', fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>{tpl.language}</TableCell>
                    <TableCell>
                      <Chip label={tpl.status} size="small" color={statusColors[tpl.status] || 'default'} />
                    </TableCell>
                    <TableCell>
                      {tpl.variables?.length > 0 ? (
                        tpl.variables.map((v, i) => (
                          <Chip key={i} label={`{{${v}}}`} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">None</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {bodyComp?.text || '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Layout>
  );
};

export default WhatsappTemplates;
