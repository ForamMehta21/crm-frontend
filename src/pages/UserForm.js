import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import Layout from '../components/Layout';
import { fetchUserById, createUser, updateUser, clearCurrentUser } from '../store/slices/userSlice';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state) => state.users);
  const { admin } = useSelector((state) => state.auth);

  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchUserById(id));
    } else {
      dispatch(clearCurrentUser());
    }
    return () => {
      dispatch(clearCurrentUser());
    };
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        password: '', // Don't show password
        role: currentUser.role || 'agent',
      });
    }
  }, [currentUser, isEdit]);

  // Only admin can access this page
  if (admin?.role !== 'admin') {
    return (
      <Layout>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Typography variant="h6" color="error">
              Access Denied. Only administrators can manage users.
            </Typography>
          </Box>
        </Container>
      </Layout>
    );
  }

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!isEdit && !formData.password) {
      errors.password = 'Password is required for new users';
    } else if (!isEdit && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const userData = { ...formData };
    // Remove empty password on edit
    if (isEdit && !userData.password) {
      delete userData.password;
    }

    if (isEdit) {
      dispatch(updateUser({ id, user: userData })).then((result) => {
        if (!result.error) {
          navigate('/users');
        }
      });
    } else {
      dispatch(createUser(userData)).then((result) => {
        if (!result.error) {
          navigate('/users');
        }
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user types
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <IconButton onClick={() => navigate('/users')} sx={{ mb: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">{isEdit ? 'Edit User' : 'Add User'}</Typography>
        </Box>

        {loading && isEdit ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    error={Boolean(formErrors.name)}
                    helperText={formErrors.name}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={Boolean(formErrors.email)}
                    helperText={formErrors.email}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      label="Role"
                      error={Boolean(formErrors.role)}
                    >
                      <MenuItem value="admin">Administrator</MenuItem>
                      <MenuItem value="agent">Agent</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="password"
                    label={isEdit ? 'New Password (leave empty to keep current)' : 'Password'}
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={Boolean(formErrors.password)}
                    helperText={formErrors.password || (isEdit ? 'Minimum 6 characters' : 'Minimum 6 characters')}
                    required={!isEdit}
                  />
                </Grid>

                {error && (
                  <Grid item xs={12}>
                    <Typography color="error" variant="body2">
                      {error}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/users')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : isEdit ? 'Update User' : 'Create User'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        )}
      </Container>
    </Layout>
  );
};

export default UserForm;
