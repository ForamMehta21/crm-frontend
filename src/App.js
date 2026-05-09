import React, { useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useDispatch, useSelector } from 'react-redux';
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
import Users from './pages/Users';
import UserForm from './pages/UserForm';
import WhatsappTemplates from './pages/Whatsapp/WhatsappTemplates';
import WhatsappCampaigns from './pages/Whatsapp/WhatsappCampaigns';
import WhatsappCampaignNew from './pages/Whatsapp/WhatsappCampaignNew';
import WhatsappCampaignDetail from './pages/Whatsapp/WhatsappCampaignDetail';
import PrivateRoute from './components/PrivateRoute';
import modernTheme from './theme/modernTheme';
import { checkAuth, setInitialized } from './store/slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const { admin, isInitialized } = useSelector((state) => state.auth);
  const initAttempted = useRef(false);

  useEffect(() => {
    if (!isInitialized && !initAttempted.current) {
      initAttempted.current = true;
      if (admin?.token) {
        dispatch(checkAuth()).finally(() => {
          // Safety: ensure isInitialized is set even if something goes wrong
          setTimeout(() => {
            dispatch(setInitialized());
          }, 0);
        });
      } else {
        dispatch(setInitialized());
      }
    }
  }, [dispatch, admin, isInitialized]);

  return (
    <ThemeProvider theme={modernTheme}>
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
        <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
        <Route path="/users/new" element={<PrivateRoute><UserForm /></PrivateRoute>} />
        <Route path="/users/edit/:id" element={<PrivateRoute><UserForm /></PrivateRoute>} />
        <Route path="/whatsapp/templates" element={<PrivateRoute><WhatsappTemplates /></PrivateRoute>} />
        <Route path="/whatsapp/campaigns" element={<PrivateRoute><WhatsappCampaigns /></PrivateRoute>} />
        <Route path="/whatsapp/campaigns/new" element={<PrivateRoute><WhatsappCampaignNew /></PrivateRoute>} />
        <Route path="/whatsapp/campaigns/:id" element={<PrivateRoute><WhatsappCampaignDetail /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
