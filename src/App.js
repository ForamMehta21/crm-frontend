import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PropertyTypes from './pages/PropertyTypes';
import PropertyConditions from './pages/PropertyConditions';
import Landmarks from './pages/Landmarks';
import Leads from './pages/Leads';
import LeadForm from './pages/LeadForm';
import LeadView from './pages/LeadView';
import Builders from './pages/Builders';
import BuilderForm from './pages/BuilderForm';
import Investors from './pages/Investors';
import InvestorForm from './pages/InvestorForm';
import FBAdsLeads from './pages/FBAdsLeads';
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/property-types" element={<PrivateRoute><PropertyTypes /></PrivateRoute>} />
        <Route path="/property-conditions" element={<PrivateRoute><PropertyConditions /></PrivateRoute>} />
        <Route path="/landmarks" element={<PrivateRoute><Landmarks /></PrivateRoute>} />
        <Route path="/leads" element={<PrivateRoute><Leads /></PrivateRoute>} />
        <Route path="/leads/new" element={<PrivateRoute><LeadForm /></PrivateRoute>} />
        <Route path="/leads/edit/:id" element={<PrivateRoute><LeadForm /></PrivateRoute>} />
        <Route path="/leads/view/:id" element={<PrivateRoute><LeadView /></PrivateRoute>} />
        <Route path="/fb-ads-leads" element={<PrivateRoute><FBAdsLeads /></PrivateRoute>} />
        <Route path="/builders" element={<PrivateRoute><Builders /></PrivateRoute>} />
        <Route path="/builders/new" element={<PrivateRoute><BuilderForm /></PrivateRoute>} />
        <Route path="/builders/edit/:id" element={<PrivateRoute><BuilderForm /></PrivateRoute>} />
        <Route path="/investors" element={<PrivateRoute><Investors /></PrivateRoute>} />
        <Route path="/investors/new" element={<PrivateRoute><InvestorForm /></PrivateRoute>} />
        <Route path="/investors/edit/:id" element={<PrivateRoute><InvestorForm /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
