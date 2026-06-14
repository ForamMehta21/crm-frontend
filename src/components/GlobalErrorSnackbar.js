import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert } from '@mui/material';
import { clearError as clearLeadError } from '../store/slices/leadSlice';
import { clearError as clearAuthError } from '../store/slices/authSlice';

const GlobalErrorSnackbar = () => {
  const dispatch = useDispatch();
  const leadError = useSelector((state) => state.leads.error);
  const authError = useSelector((state) => state.auth.error);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [source, setSource] = useState(null);

  useEffect(() => {
    if (leadError) {
      setMessage(leadError);
      setSource('lead');
      setOpen(true);
    }
  }, [leadError]);

  useEffect(() => {
    if (authError) {
      setMessage(authError);
      setSource('auth');
      setOpen(true);
    }
  }, [authError]);

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
    if (source === 'lead') dispatch(clearLeadError());
    if (source === 'auth') dispatch(clearAuthError());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalErrorSnackbar;
