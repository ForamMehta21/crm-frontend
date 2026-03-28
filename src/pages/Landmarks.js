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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Layout from '../components/Layout';
import {
  fetchLandmarks,
  createLandmark,
  updateLandmark,
  deleteLandmark,
} from '../store/slices/landmarkSlice';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  city: Yup.string().required('City is required'),
  area: Yup.string().required('Area is required'),
  description: Yup.string(),
});

const Landmarks = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.landmarks);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [filters, setFilters] = useState({ city: '', area: '' });

  useEffect(() => {
    dispatch(fetchLandmarks(filters));
  }, [dispatch, filters]);

  const formik = useFormik({
    initialValues: {
      name: '',
      city: '',
      area: '',
      description: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (editMode) {
        await dispatch(updateLandmark({ id: selectedId, landmark: values }));
      } else {
        await dispatch(createLandmark(values));
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
      name: item.name,
      city: item.city,
      area: item.area,
      description: item.description || '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this landmark?')) {
      await dispatch(deleteLandmark(id));
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      <Container maxWidth="lg">
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
            Landmarks
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} size="small">
            Add Landmark
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                size="small"
                name="city"
                label="Filter by City"
                value={filters.city}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                size="small"
                name="area"
                label="Filter by Area"
                value={filters.area}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={() => dispatch(fetchLandmarks(filters))}
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
          <TableContainer component={Paper} className="responsive-table">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Area</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id} className="responsive-row">
                    <TableCell data-label="Name">{item.name}</TableCell>
                    <TableCell data-label="City">{item.city}</TableCell>
                    <TableCell data-label="Area">{item.area}</TableCell>
                    <TableCell data-label="Description">{item.description}</TableCell>
                    <TableCell data-label="Actions" align="right">
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
        )}

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editMode ? 'Edit Landmark' : 'Add Landmark'}</DialogTitle>
          <form onSubmit={formik.handleSubmit}>
            <DialogContent>
              <TextField
                fullWidth
                margin="normal"
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <TextField
                fullWidth
                margin="normal"
                name="city"
                label="City"
                value={formik.values.city}
                onChange={formik.handleChange}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
              />
              <TextField
                fullWidth
                margin="normal"
                name="area"
                label="Area"
                value={formik.values.area}
                onChange={formik.handleChange}
                error={formik.touched.area && Boolean(formik.errors.area)}
                helperText={formik.touched.area && formik.errors.area}
              />
              <TextField
                fullWidth
                margin="normal"
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editMode ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Landmarks;
