import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Button,
  TextField,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Layout from '../components/Layout';
import {
  fetchInvestors,
  createInvestor,
  updateInvestor,
} from '../store/slices/investorSlice';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  number: Yup.string().required('Phone number is required'),
  details: Yup.string(),
});

const InvestorForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { items } = useSelector((state) => state.investors);

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && items.length === 0) {
      dispatch(fetchInvestors());
    }
  }, [dispatch, isEditMode, items.length]);

  const formik = useFormik({
    initialValues: {
      name: '',
      number: '',
      details: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (isEditMode) {
        await dispatch(updateInvestor({ id, investor: values }));
      } else {
        await dispatch(createInvestor(values));
      }
      navigate('/investors');
    },
  });

  useEffect(() => {
    if (isEditMode && items.length > 0) {
      const investor = items.find((item) => item._id === id);
      if (investor) {
        formik.setValues({
          name: investor.name,
          number: investor.number,
          details: investor.details || '',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, id, items]);

  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/investors')}
          >
            Back to Investors
          </Button>
        </Box>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            {isEditMode ? 'Edit Investor' : 'Add New Investor'}
          </Typography>

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
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
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  name="number"
                  label="Phone Number"
                  value={formik.values.number}
                  onChange={formik.handleChange}
                  error={formik.touched.number && Boolean(formik.errors.number)}
                  helperText={formik.touched.number && formik.errors.number}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  name="details"
                  label="Details"
                  multiline
                  rows={4}
                  value={formik.values.details}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/investors')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained">
                    {isEditMode ? 'Update' : 'Create'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Layout>
  );
};

export default InvestorForm;
