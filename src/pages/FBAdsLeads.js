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
  Collapse,
  Card,
  CardContent,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Layout from '../components/Layout';
import { fetchFBAdsLeads, deleteLead } from '../store/slices/leadSlice';

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

const Row = ({ item, navigate, handleDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }} className="responsive-row">
        <TableCell data-label="Expand">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell data-label="Name">{item.fullName}</TableCell>
        <TableCell data-label="Phone">
          <a href={`tel:${item.phoneNumber}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {item.phoneNumber}
          </a>
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
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4} className="collapse-cell">
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary"><strong>Type:</strong></Typography>
                  <Chip label={item.leadType} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary"><strong>Status:</strong></Typography>
                  <Chip label={item.leadStatus} size="small" color={statusColors[item.leadStatus] || 'default'} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary"><strong>Property Type:</strong></Typography>
                  <Typography variant="body2">{item.propertyType || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary"><strong>Configuration:</strong></Typography>
                  <Typography variant="body2">{item.propertyCategory?.name || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary"><strong>Prop. Preference:</strong></Typography>
                  {item.propertyPreference ? (
                    <Chip label={item.propertyPreference} size="small" color={propertyPreferenceColors[item.propertyPreference] || 'default'} />
                  ) : <Typography variant="body2">-</Typography>}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary"><strong>Created At:</strong></Typography>
                  <Typography variant="body2">{formatDate(item.createdAt)}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const FBAdsLeads = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, pagination } = useSelector((state) => state.leads);

  const [filters, setFilters] = useState({
    leadType: '',
    leadStatus: '',
    search: '',
    ref: 'FB-Ads(Scarlet)',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    dispatch(fetchFBAdsLeads(filters));
  }, [dispatch, filters]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      dispatch(deleteLead(id)).then(() => {
        dispatch(fetchFBAdsLeads(filters));
      });
    }
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
        <Typography variant="h4" sx={{ mb: 3, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          FB-Ads(Scarlet) Leads
        </Typography>

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
                onClick={() => dispatch(fetchFBAdsLeads(filters))}
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
                    <TableCell width="50px" />
                    <TableCell sortDirection={filters.sortBy === 'fullName' ? filters.sortOrder : false}>
                      <TableSortLabel
                        active={filters.sortBy === 'fullName'}
                        direction={filters.sortBy === 'fullName' ? filters.sortOrder : 'asc'}
                        onClick={() => handleSortChange('fullName')}
                      >
                        Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <Row key={item._id} item={item} navigate={navigate} handleDelete={handleDelete} />
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
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
      </Container>
    </Layout>
  );
};

export default FBAdsLeads;
