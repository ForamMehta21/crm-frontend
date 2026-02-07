import React, { useEffect, useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Grid,
  MenuItem,
  Chip,
  TablePagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import DescriptionIcon from '@mui/icons-material/Description';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Layout from '../components/Layout';
import LeadImport from '../components/LeadImport';
import {
  fetchLeads,
  createLead,
  updateLead,
  deleteLead,
} from '../store/slices/leadSlice';
import { fetchPropertyTypes } from '../store/slices/propertyTypeSlice';
import { fetchPropertyConditions } from '../store/slices/propertyConditionSlice';
import { fetchLandmarks } from '../store/slices/landmarkSlice';
import { exportLeads, downloadTemplate } from '../store/slices/leadImportExportSlice';

const validationSchema = Yup.object({
  leadType: Yup.string().required('Lead type is required'),
  fullName: Yup.string().required('Full name is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  email: Yup.string().email('Invalid email'),
  city: Yup.string(),
  budget: Yup.number().min(0),
  ref: Yup.string(),
  propertyType: Yup.string(),
  propertyCategory: Yup.string(),
  propertyCondition: Yup.string(),
  preferredLocation: Yup.string(),
  leadStatus: Yup.string(),
  remarks: Yup.string(),
});

const leadTypes = ['Buyer', 'Broker', 'Seller'];
const leadStatuses = ['New', 'Contacted', 'Follow-up', 'Closed', 'Lost'];
const propertyTypeOptions = ['Residential Rent', 'Residential Sell', 'Commercial Rent', 'Commercial Sell'];

const statusColors = {
  New: 'info',
  Contacted: 'primary',
  'Follow-up': 'warning',
  Closed: 'success',
  Lost: 'error',
};

const Leads = () => {
  const dispatch = useDispatch();
  const { items, loading, pagination } = useSelector((state) => state.leads);
  const { items: propertyTypes } = useSelector((state) => state.propertyTypes);
  const { items: propertyConditions } = useSelector((state) => state.propertyConditions);
  const { items: landmarks } = useSelector((state) => state.landmarks);
  const { admin } = useSelector((state) => state.auth);
  
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [filters, setFilters] = useState({
    leadType: '',
    city: '',
    leadStatus: '',
    search: '',
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    dispatch(fetchPropertyTypes());
    dispatch(fetchPropertyConditions());
    dispatch(fetchLandmarks({}));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchLeads(filters));
  }, [dispatch, filters]);

  const formik = useFormik({
    initialValues: {
      leadType: '',
      fullName: '',
      phoneNumber: '',
      email: '',
      city: '',
      budget: '',
      ref: '',
      propertyType: '',
      propertyCategory: '',
      propertyCondition: '',
      preferredLocation: '',
      landmark: '',
      leadStatus: 'New',
      remarks: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const leadData = {
        ...values,
        assignedTo: admin._id,
      };
      
      if (editMode) {
        await dispatch(updateLead({ id: selectedId, lead: leadData }));
      } else {
        await dispatch(createLead(leadData));
      }
      resetForm();
      handleClose();
    },
  });

  const handleOpen = () => {
    setEditMode(false);
    setSelectedId(null);
    formik.resetForm();
    setOpen(true);
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setSelectedId(item._id);
    formik.setValues({
      leadType: item.leadType,
      fullName: item.fullName,
      phoneNumber: item.phoneNumber,
      email: item.email || '',
      city: item.city,
      budget: item.budget,
      ref: item.ref || '',
      propertyType: item.propertyType || '',
      propertyCategory: item.propertyCategory?._id || '',
      propertyCondition: item.propertyCondition?._id || '',
      preferredLocation: item.preferredLocation,
      landmark: item.landmark?._id || '',
      leadStatus: item.leadStatus,
      remarks: item.remarks || '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
  };

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

  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Leads Management</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DescriptionIcon />}
              onClick={handleDownloadTemplate}
            >
              Template
            </Button>
            <Button
              variant="outlined"
              color="success"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              color="info"
              startIcon={<UploadIcon />}
              onClick={() => setImportOpen(true)}
            >
              Import
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpen}
            >
              Add Lead
            </Button>
          </Box>
        </Box>

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
                size="small"
                name="city"
                label="City"
                value={filters.city}
                onChange={handleFilterChange}
              />
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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>Ref</TableCell>
                    <TableCell>Property Type</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.fullName}</TableCell>
                      <TableCell>
                        <Chip label={item.leadType} size="small" />
                      </TableCell>
                      <TableCell>{item.phoneNumber}</TableCell>
                      <TableCell>{item.city}</TableCell>
                      <TableCell>{item.ref || '-'}</TableCell>
                      <TableCell>{item.propertyType}</TableCell>
                      <TableCell>{item.propertyCategory?.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.leadStatus} 
                          size="small" 
                          color={statusColors[item.leadStatus]}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => handleEdit(item)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(item._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
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

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>{editMode ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
          <form onSubmit={formik.handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    margin="normal"
                    name="leadType"
                    label="Lead Type"
                    value={formik.values.leadType}
                    onChange={formik.handleChange}
                    error={formik.touched.leadType && Boolean(formik.errors.leadType)}
                    helperText={formik.touched.leadType && formik.errors.leadType}
                  >
                    {leadTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="fullName"
                    label="Full Name"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                    helperText={formik.touched.fullName && formik.errors.fullName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="phoneNumber"
                    label="Phone Number"
                    value={formik.values.phoneNumber}
                    onChange={formik.handleChange}
                    error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                    helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="email"
                    label="Email (Optional)"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="city"
                    label="City (Optional)"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    error={formik.touched.city && Boolean(formik.errors.city)}
                    helperText={formik.touched.city && formik.errors.city}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="budget"
                    label="Budget (Optional)"
                    type="number"
                    value={formik.values.budget}
                    onChange={formik.handleChange}
                    error={formik.touched.budget && Boolean(formik.errors.budget)}
                    helperText={formik.touched.budget && formik.errors.budget}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="ref"
                    label="Reference (Optional)"
                    value={formik.values.ref}
                    onChange={formik.handleChange}
                    error={formik.touched.ref && Boolean(formik.errors.ref)}
                    helperText={formik.touched.ref && formik.errors.ref}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    margin="normal"
                    name="propertyType"
                    label="Property Type (Optional)"
                    value={formik.values.propertyType}
                    onChange={formik.handleChange}
                    error={formik.touched.propertyType && Boolean(formik.errors.propertyType)}
                    helperText={formik.touched.propertyType && formik.errors.propertyType}
                  >
                    <MenuItem value="">None</MenuItem>
                    {propertyTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    margin="normal"
                    name="propertyCategory"
                    label="Property Category (Optional)"
                    value={formik.values.propertyCategory}
                    onChange={formik.handleChange}
                    error={formik.touched.propertyCategory && Boolean(formik.errors.propertyCategory)}
                    helperText={formik.touched.propertyCategory && formik.errors.propertyCategory}
                  >
                    <MenuItem value="">None</MenuItem>
                    {propertyTypes.map((type) => (
                      <MenuItem key={type._id} value={type._id}>{type.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    margin="normal"
                    name="propertyCondition"
                    label="Property Condition (Optional)"
                    value={formik.values.propertyCondition}
                    onChange={formik.handleChange}
                    error={formik.touched.propertyCondition && Boolean(formik.errors.propertyCondition)}
                    helperText={formik.touched.propertyCondition && formik.errors.propertyCondition}
                  >
                    <MenuItem value="">None</MenuItem>
                    {propertyConditions.map((condition) => (
                      <MenuItem key={condition._id} value={condition._id}>{condition.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="preferredLocation"
                    label="Preferred Location (Optional)"
                    value={formik.values.preferredLocation}
                    onChange={formik.handleChange}
                    error={formik.touched.preferredLocation && Boolean(formik.errors.preferredLocation)}
                    helperText={formik.touched.preferredLocation && formik.errors.preferredLocation}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    margin="normal"
                    name="landmark"
                    label="Landmark (Optional)"
                    value={formik.values.landmark}
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="">None</MenuItem>
                    {landmarks.map((landmark) => (
                      <MenuItem key={landmark._id} value={landmark._id}>
                        {landmark.name} - {landmark.city}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    margin="normal"
                    name="leadStatus"
                    label="Lead Status"
                    value={formik.values.leadStatus}
                    onChange={formik.handleChange}
                    error={formik.touched.leadStatus && Boolean(formik.errors.leadStatus)}
                    helperText={formik.touched.leadStatus && formik.errors.leadStatus}
                  >
                    {leadStatuses.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="remarks"
                    label="Remarks"
                    multiline
                    rows={3}
                    value={formik.values.remarks}
                    onChange={formik.handleChange}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editMode ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

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
