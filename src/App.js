import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalErrorSnackbar from './components/GlobalErrorSnackbar';
import { ColorModeProvider } from './theme/ColorModeContext';
import { checkAuth, setInitialized } from './store/slices/authSlice';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PropertyTypes = lazy(() => import('./pages/PropertyTypes'));
const PropertyConditions = lazy(() => import('./pages/PropertyConditions'));
const Landmarks = lazy(() => import('./pages/Landmarks'));
const Leads = lazy(() => import('./pages/Leads'));
const LeadForm = lazy(() => import('./pages/LeadForm'));
const LeadView = lazy(() => import('./pages/LeadView'));
const Builders = lazy(() => import('./pages/Builders'));
const BuilderForm = lazy(() => import('./pages/BuilderForm'));
const Investors = lazy(() => import('./pages/Investors'));
const InvestorForm = lazy(() => import('./pages/InvestorForm'));
const FBAdsLeads = lazy(() => import('./pages/FBAdsLeads'));
const Users = lazy(() => import('./pages/Users'));
const UserForm = lazy(() => import('./pages/UserForm'));
const WhatsappTemplates = lazy(() => import('./pages/Whatsapp/WhatsappTemplates'));
const WhatsappCampaigns = lazy(() => import('./pages/Whatsapp/WhatsappCampaigns'));
const WhatsappCampaignNew = lazy(() => import('./pages/Whatsapp/WhatsappCampaignNew'));
const WhatsappCampaignDetail = lazy(() => import('./pages/Whatsapp/WhatsappCampaignDetail'));
const Notifications = lazy(() => import('./pages/Notifications'));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
    <CircularProgress />
  </Box>
);

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
    <ColorModeProvider>
      <GlobalErrorSnackbar />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </ColorModeProvider>
  );
}

export default App;
