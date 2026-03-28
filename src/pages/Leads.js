import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Grid,
  MenuItem,
  Chip,
  TablePagination,
  TableSortLabel,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Layout from '../components/Layout';
import LeadImport from '../components/LeadImport';
import {
  fetchLeads,
  deleteLead,
} from '../store/slices/leadSlice';
import { exportLeads, downloadTemplate } from '../store/slices/leadImportExportSlice';

const leadTypes = ['Buyer', 'Broker', 'Seller'];
const leadStatuses = [
  'New', 'Attempted 1', 'Attempted 2', 'Attempted 3',
  'Follow-up', 'unqualified', 'warm', 'hot',
  'site visit planned', 'site visit done', 'booked', 'booed someware else',
];

const statusColors = {
  'New': 'info',
  'Attempted 1': 'primary',
  'Attempted 2': 'warning',
  'Attempted 3': 'success',
  'Follow-up': 'error',
};

const propertyPreferenceColors = {
  'New': 'success',
  'Old': 'warning',
};

// Columns that are sortable server-side
const SORTABLE_COLUMNS = {
  fullName:    'Name',
  leadType:    'Type',

  leadStatus:  'Status',
  createdAt:   'Created At',
};

/**
 * Format an ISO date string to dd/MM/yyyy HH:mm
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return '-';
  const dd   = String(d.getDate()).padStart(2, '0');
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh   = String(d.getHours()).padStart(2, '0');
  const min  = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
};

const Leads = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, loading, pagination } = useSelector((state) => state.leads);

  const [importOpen, setImportOpen] = useState(false);

  // Read ?status and ?type from URL (set by Dashboard card clicks)
  const queryParams = new URLSearchParams(location.search);
  const urlStatus = queryParams.get('status') || '';
  const urlType = queryParams.get('type') || '';

  const [filters, setFilters] = useState({
    leadType: urlType,

    leadStatus: urlStatus,
    search: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    dispatch(fetchLeads(filters));
  }, [dispatch, filters]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      dispatch(deleteLead(id)).then(() => {
        dispatch(fetchLeads(filters));
      });
    }
  };

  const handleExport = () => {
    dispatch(exportLeads());
  };

  const handleDownloadTemplate = () => {
    dispatch(downloadTemplate());
  };

  const handleImportComplete = () => {
    dispatch(fetchLeads(filters));
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handlePageChange = (event, newPage) => {
    setFilters({ ...filters, page: newPage + 1 });
  };

  const handleRowsPerPageChange = (event) => {
    setFilters({ ...filters, limit: parseInt(event.target.value, 10), page: 1 });
  };

  const handleSortChange = (column) => {
    const isCurrentColumn = filters.sortBy === column;
    setFilters({
      ...filters,
      sortBy: column,
      sortOrder: isCurrentColumn && filters.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    });
  };

  return (
    <Layout>
      <Container maxWidth="xl">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 3,
            gap: 2
          }}
        >
          <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            Leads Management
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DescriptionIcon />}
              onClick={handleDownloadTemplate}
              size="small"
            >
              Template
            </Button>
            <Button
              variant="outlined"
              color="success"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              size="small"
            >
              Export
            </Button>
            <Button
              variant="outlined"
              color="info"
              startIcon={<UploadIcon />}
              onClick={() => setImportOpen(true)}
              size="small"
            >
              Import
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/leads/new')}
              size="small"
            >
              Add Lead
            </Button>
          </Box>
        </Box>

        {/* Filter Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                name="search"
                label="Search (Name, Phone, Email)"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                size="small"
                name="leadType"
                label="Lead Type"
                value={filters.leadType}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                {leadTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                size="small"
                name="leadStatus"
                label="Status"
                value={filters.leadStatus}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                {leadStatuses.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={() => dispatch(fetchLeads(filters))}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} className="responsive-table">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    {/* Sortable: Name */}
                    <TableCell sortDirection={filters.sortBy === 'fullName' ? filters.sortOrder : false}>
                      <TableSortLabel
                        active={filters.sortBy === 'fullName'}
                        direction={filters.sortBy === 'fullName' ? filters.sortOrder : 'asc'}
                        onClick={() => handleSortChange('fullName')}
                      >
                        Name
                      </TableSortLabel>
                    </TableCell>

                    {/* Sortable: Type */}
                    <TableCell sortDirection={filters.sortBy === 'leadType' ? filters.sortOrder : false}>
                      <TableSortLabel
                        active={filters.sortBy === 'leadType'}
                        direction={filters.sortBy === 'leadType' ? filters.sortOrder : 'asc'}
                        onClick={() => handleSortChange('leadType')}
                      >
                        Type
                      </TableSortLabel>
                    </TableCell>

                    <TableCell>Phone</TableCell>



                    <TableCell>Ref</TableCell>
                    <TableCell>Property Type</TableCell>
                    <TableCell>Configuration</TableCell>
                    <TableCell>Prop. Preference</TableCell>

                    {/* Sortable: Status */}
                    <TableCell sortDirection={filters.sortBy === 'leadStatus' ? filters.sortOrder : false}>
                      <TableSortLabel
                        active={filters.sortBy === 'leadStatus'}
                        direction={filters.sortBy === 'leadStatus' ? filters.sortOrder : 'asc'}
                        onClick={() => handleSortChange('leadStatus')}
                      >
                        Status
                      </TableSortLabel>
                    </TableCell>

                    {/* Sortable: Created At */}
                    <TableCell sortDirection={filters.sortBy === 'createdAt' ? filters.sortOrder : false}>
                      <TableSortLabel
                        active={filters.sortBy === 'createdAt'}
                        direction={filters.sortBy === 'createdAt' ? filters.sortOrder : 'desc'}
                        onClick={() => handleSortChange('createdAt')}
                      >
                        Created At
                      </TableSortLabel>
                    </TableCell>

                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item._id} hover className="responsive-row">
                      <TableCell data-label="Name">{item.fullName}</TableCell>
                      <TableCell data-label="Type">
                        <Chip label={item.leadType} size="small" />
                      </TableCell>
                      <TableCell data-label="Phone">
                        <a href={`tel:${item.phoneNumber}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {item.phoneNumber}
                        </a>
                      </TableCell>

                      <TableCell data-label="Ref">{item.ref || '-'}</TableCell>
                      <TableCell data-label="Property Type">{item.propertyType || '-'}</TableCell>
                      <TableCell data-label="Configuration">{item.propertyCategory?.name || '-'}</TableCell>
                      <TableCell data-label="Prop. Pref">
                        {item.propertyPreference ? (
                          <Chip
                            label={item.propertyPreference}
                            size="small"
                            color={propertyPreferenceColors[item.propertyPreference] || 'default'}
                          />
                        ) : '-'}
                      </TableCell>
                      <TableCell data-label="Status">
                        <Chip
                          label={item.leadStatus}
                          size="small"
                          color={statusColors[item.leadStatus] || 'default'}
                        />
                      </TableCell>
                      <TableCell data-label="Created At">
                        <Tooltip title={new Date(item.createdAt).toLocaleString()} placement="top">
                          <span>{formatDate(item.createdAt)}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell data-label="Actions" align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton color="info" onClick={() => navigate(`/leads/view/${item._id}`)} size="small">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="primary" onClick={() => navigate(`/leads/edit/${item._id}`)} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(item._id)} size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No leads found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={pagination.total}
              page={pagination.page - 1}
              onPageChange={handlePageChange}
              rowsPerPage={filters.limit}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}

        <LeadImport
          open={importOpen}
          onClose={() => setImportOpen(false)}
          onImportComplete={handleImportComplete}
        />
      </Container>
    </Layout>
  );
};

export default Leads;
