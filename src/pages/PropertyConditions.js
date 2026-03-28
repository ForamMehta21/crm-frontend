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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Layout from '../components/Layout';
import {
  fetchPropertyConditions,
  createPropertyCondition,
  updatePropertyCondition,
  deletePropertyCondition,
} from '../store/slices/propertyConditionSlice';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  description: Yup.string(),
});

const PropertyConditions = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.propertyConditions);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    dispatch(fetchPropertyConditions());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (editMode) {
        await dispatch(updatePropertyCondition({ id: selectedId, propertyCondition: values }));
      } else {
        await dispatch(createPropertyCondition(values));
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
      description: item.description || '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property condition?')) {
      await dispatch(deletePropertyCondition(id));
    }
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
            Property Conditions
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} size="small">
            Add Property Condition
          </Button>
        </Box>

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
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id} className="responsive-row">
                    <TableCell data-label="Name">{item.name}</TableCell>
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
          <DialogTitle>{editMode ? 'Edit Property Condition' : 'Add Property Condition'}</DialogTitle>
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

export default PropertyConditions;
