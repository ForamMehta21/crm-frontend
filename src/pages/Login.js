import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { login, clearError } from '../store/slices/authSlice';
import ThemeModeToggle from '../components/ThemeModeToggle';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { admin, loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = React.useState(false);

  useEffect(() => {
    if (admin) {
      navigate('/');
    }
  }, [admin, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(login(values));
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '5fr 6fr' },
        bgcolor: 'background.default',
      }}
    >
      {/* Brand panel: tablet landscape and up */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { md: 5, lg: 7 },
          bgcolor: 'surface.brand',
          color: 'surface.brandText',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle floor-plan grid */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.12,
            backgroundImage: (t) =>
              `linear-gradient(${t.palette.surface.brandText} 1px, transparent 1px), linear-gradient(90deg, ${t.palette.surface.brandText} 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            maskImage: 'linear-gradient(160deg, black 10%, transparent 75%)',
            WebkitMaskImage: 'linear-gradient(160deg, black 10%, transparent 75%)',
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: (t) => alpha(t.palette.surface.brandText, 0.14),
              color: (t) => (t.palette.mode === 'dark' ? t.palette.primary.main : 'inherit'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogoMark size={26} />
          </Box>
          <Typography variant="h6" sx={{ color: 'inherit' }}>RealEstate CRM</Typography>
        </Box>
        <Box sx={{ position: 'relative', maxWidth: 460 }}>
          <Typography variant="h3" component="p" sx={{ color: 'inherit', mb: 2, lineHeight: 1.15 }}>
            Every lead, site visit and booking in one place.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85 }}>
            Track follow-ups, plan site visits and run WhatsApp campaigns for your projects.
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.7, position: 'relative' }}>
          © {new Date().getFullYear()} Real Estate CRM
        </Typography>
      </Box>

      {/* Form panel */}
      <Box
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          px: { xs: 2, sm: 4 },
          py: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ThemeModeToggle />
        </Box>

        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 3, sm: 5 } }}>
          <Paper
            variant="outlined"
            sx={{
              width: '100%',
              maxWidth: 440,
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              boxShadow: { xs: 0, sm: 4 },
            }}
          >
            {/* Logo: shown when the brand panel is hidden */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 3,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LogoMark size={36} />
              </Box>
            </Box>

            <Typography component="h1" variant="h4" sx={{ mb: 1, textAlign: { xs: 'center', md: 'left' } }}>
              Welcome back
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}>
              Sign in to your Real Estate CRM account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={formik.handleSubmit} noValidate>
              <TextField
                margin="normal"
                fullWidth
                id="email"
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'text.secondary' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
              <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
              </Button>
            </Box>
          </Paper>
        </Box>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ display: { md: 'none' } }}>
          © {new Date().getFullYear()} Real Estate CRM
        </Typography>
      </Box>
    </Box>
  );
};

const LogoMark = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <path
      d="M55 15C35 15 20 30 20 50C20 70 35 85 55 85C70 85 80 75 85 65H65C60 65 55 60 55 55H95V50C95 28 78 15 55 15ZM55 30C45 30 40 38 40 50C40 62 45 70 55 70C62 70 67 65 70 60H55V45H80C78 35 68 30 55 30Z"
      fill="currentColor"
    />
  </svg>
);

export default Login;
