import React, { useEffect, useState } from 'react';
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
  fetchBuilders,
  createBuilder,
  updateBuilder,
} from '../store/slices/builderSlice';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  number: Yup.string().required('Phone number is required'),
  companyName: Yup.string().required('Company name is required'),
  remarks: Yup.string(),
});

const BuilderForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { items } = useSelector((state) => state.builders);
  const [runningProjects, setRunningProjects] = useState(['']);
  const [upcomingProjects, setUpcomingProjects] = useState(['']);
  const [completedProjects, setCompletedProjects] = useState(['']);

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && items.length === 0) {
      dispatch(fetchBuilders());
    }
  }, [dispatch, isEditMode, items.length]);

  useEffect(() => {
    if (isEditMode && items.length > 0) {
      const builder = items.find((item) => item._id === id);
      if (builder) {
        formik.setValues({
          name: builder.name,
          number: builder.number,
          companyName: builder.companyName,
          remarks: builder.remarks || '',
        });
        setRunningProjects(builder.runningProjects?.length > 0 ? builder.runningProjects : ['']);
        setUpcomingProjects(builder.upcomingProjects?.length > 0 ? builder.upcomingProjects : ['']);
        setCompletedProjects(builder.completedProjects?.length > 0 ? builder.completedProjects : ['']);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, id, items]);

  const formik = useFormik({
    initialValues: {
      name: '',
      number: '',
      companyName: '',
      remarks: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const builderData = {
        ...values,
        runningProjects: runningProjects.filter(p => p.trim() !== ''),
        upcomingProjects: upcomingProjects.filter(p => p.trim() !== ''),
        completedProjects: completedProjects.filter(p => p.trim() !== ''),
      };

      if (isEditMode) {
        await dispatch(updateBuilder({ id, builder: builderData }));
      } else {
        await dispatch(createBuilder(builderData));
      }
      navigate('/builders');
    },
  });

  const handleProjectChange = (index, value, type) => {
    if (type === 'running') {
      const newProjects = [...runningProjects];
      newProjects[index] = value;
      setRunningProjects(newProjects);
    } else if (type === 'upcoming') {
      const newProjects = [...upcomingProjects];
      newProjects[index] = value;
      setUpcomingProjects(newProjects);
    } else if (type === 'completed') {
      const newProjects = [...completedProjects];
      newProjects[index] = value;
      setCompletedProjects(newProjects);
    }
  };

  const addProjectField = (type) => {
    if (type === 'running') {
      setRunningProjects([...runningProjects, '']);
    } else if (type === 'upcoming') {
      setUpcomingProjects([...upcomingProjects, '']);
    } else if (type === 'completed') {
      setCompletedProjects([...completedProjects, '']);
    }
  };

  const removeProjectField = (index, type) => {
    if (type === 'running') {
      setRunningProjects(runningProjects.filter((_, i) => i !== index));
    } else if (type === 'upcoming') {
      setUpcomingProjects(upcomingProjects.filter((_, i) => i !== index));
    } else if (type === 'completed') {
      setCompletedProjects(completedProjects.filter((_, i) => i !== index));
    }
  };

  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/builders')}
          >
            Back to Builders
          </Button>
        </Box>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            {isEditMode ? 'Edit Builder' : 'Add New Builder'}
          </Typography>

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
                  name="companyName"
                  label="Company Name"
                  value={formik.values.companyName}
                  onChange={formik.handleChange}
                  error={formik.touched.companyName && Boolean(formik.errors.companyName)}
                  helperText={formik.touched.companyName && formik.errors.companyName}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Running Projects</Typography>
                {runningProjects.map((project, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={project}
                      onChange={(e) => handleProjectChange(index, e.target.value, 'running')}
                      placeholder="Project name"
                    />
                    <Button onClick={() => removeProjectField(index, 'running')} color="error">
                      Remove
                    </Button>
                  </Box>
                ))}
                <Button onClick={() => addProjectField('running')} size="small">
                  + Add Running Project
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Upcoming Projects</Typography>
                {upcomingProjects.map((project, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={project}
                      onChange={(e) => handleProjectChange(index, e.target.value, 'upcoming')}
                      placeholder="Project name"
                    />
                    <Button onClick={() => removeProjectField(index, 'upcoming')} color="error">
                      Remove
                    </Button>
                  </Box>
                ))}
                <Button onClick={() => addProjectField('upcoming')} size="small">
                  + Add Upcoming Project
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Completed Projects</Typography>
                {completedProjects.map((project, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={project}
                      onChange={(e) => handleProjectChange(index, e.target.value, 'completed')}
                      placeholder="Project name"
                    />
                    <Button onClick={() => removeProjectField(index, 'completed')} color="error">
                      Remove
                    </Button>
                  </Box>
                ))}
                <Button onClick={() => addProjectField('completed')} size="small">
                  + Add Completed Project
                </Button>
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

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/builders')}
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

export default BuilderForm;
