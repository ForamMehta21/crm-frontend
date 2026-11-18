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
import { softBg } from '../../theme/createAppTheme';
import { fetchTemplates, syncTemplates, clearError } from '../../store/slices/whatsappSlice';

const statusColors = {
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'error'
};

const categoryTones = {
  MARKETING: 'violet',
  UTILITY: 'info',
  AUTHENTICATION: 'brass'
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
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
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

      <TableContainer component={Paper} variant="outlined" className="responsive-table">
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
                    <TableCell data-label="Name">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{tpl.name}</Typography>
                    </TableCell>
                    <TableCell data-label="Category">
                      <Chip
                        label={tpl.category}
                        size="small"
                        sx={{ bgcolor: (t) => softBg(t, categoryTones[tpl.category] || 'primary'), color: `${categoryTones[tpl.category] || 'primary'}.main`, fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell data-label="Language">{tpl.language}</TableCell>
                    <TableCell data-label="Status">
                      <Chip label={tpl.status} size="small" color={statusColors[tpl.status] || 'default'} />
                    </TableCell>
                    <TableCell data-label="Variables">
                      {tpl.variables?.length > 0 ? (
                        tpl.variables.map((v, i) => (
                          <Chip key={i} label={`{{${v}}}`} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">None</Typography>
                      )}
                    </TableCell>
                    <TableCell data-label="Body Preview">
                      <Typography variant="body2" sx={{ maxWidth: { xs: '100%', md: 300 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
