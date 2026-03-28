import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import Layout from '../components/Layout';
import { fetchLeadById } from '../store/slices/leadSlice';

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return '-';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const hh12 = hh % 12 || 12;
  return `${dd}/${mm}/${yyyy} ${hh12}:${min} ${ampm}`;
};

const formatDateOnly = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return '-';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const InfoRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', mb: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
    <Typography variant="subtitle2" color="text.secondary" sx={{ width: { sm: '40%' }, fontWeight: 600 }}>
      {label}:
    </Typography>
    <Typography variant="body1" sx={{ flex: 1, wordBreak: 'break-word' }}>
      {value || '-'}
    </Typography>
  </Box>
);

const LeadView = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentLead, currentLeadLoading } = useSelector((state) => state.leads);

  useEffect(() => {
    dispatch(fetchLeadById(id));
  }, [dispatch, id]);

  if (currentLeadLoading || !currentLead) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </Layout>
    );
  }

  const {
    leadType, fullName, phoneNumber, email, budget, ref,
    propertyType, propertyCategory, propertyCondition, preferredLocation,
    landmark, leadStatus, remarks, nextCallDate, purposeOfBuying,
    propertyPreference, ageOfProperty, timelineToBuy, comments, createdAt
  } = currentLead;

  // Render Multiselect property categories
  const renderCategories = () => {
    if (!propertyCategory || propertyCategory.length === 0) return '-';
    return propertyCategory.map((cat, idx) => (
      <Chip key={cat._id || idx} label={cat.name} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
    ));
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/leads')}>
            Back to Leads
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/leads/edit/${id}`)}
          >
            Edit Lead
          </Button>
        </Box>

        <Paper sx={{ p: { xs: 2, sm: 4 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              {fullName}
              <Chip
                label={leadStatus}
                color="primary"
                sx={{ ml: 2, verticalAlign: 'middle' }}
              />
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Added on: {formatDateTime(createdAt)}
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Basic Info */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color="primary" gutterBottom>Basic Information</Typography>
              <Divider sx={{ mb: 2 }} />
              <InfoRow label="Lead Type" value={leadType} />
              <InfoRow label="Phone Number" value={phoneNumber} />
              <InfoRow label="Email" value={email} />

              <InfoRow label="Budget" value={budget} />
              <InfoRow label="Reference" value={ref} />
              <InfoRow label="Purpose of Buying" value={purposeOfBuying} />
            </Grid>

            {/* Property Details */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color="primary" gutterBottom>Property Details</Typography>
              <Divider sx={{ mb: 2 }} />
              <InfoRow label="Property Type" value={propertyType} />
              <Box sx={{ display: 'flex', mb: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ width: { sm: '40%' }, fontWeight: 600 }}>
                  Configuration:
                </Typography>
                <Box sx={{ flex: 1 }}>{renderCategories()}</Box>
              </Box>
              <InfoRow label="Property Condition" value={propertyCondition?.name} />
              <InfoRow label="Preferred Location" value={preferredLocation} />
              <InfoRow label="Landmark" value={landmark?.name ? `${landmark.name} - ${landmark.city}` : ''} />
              <InfoRow label="Property Preference" value={propertyPreference} />
              <InfoRow label="Age of Property" value={ageOfProperty} />
              <InfoRow label="Timeline to Buy" value={timelineToBuy} />
            </Grid>

            {/* Other Information */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>Tracking Information</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container>
                <Grid item xs={12} md={6}>
                  <InfoRow label="Next Call Date" value={formatDateOnly(nextCallDate)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoRow label="Remarks" value={remarks} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Comments Section */}
          <Box sx={{ mt: 5 }}>
            <Typography variant="h6" color="primary" gutterBottom>Comments</Typography>
            <Divider sx={{ mb: 2 }} />
            {comments && comments.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 600, width: '5%' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: '50%' }}>Comment</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: '25%' }}>Added By</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: '20%' }}>Date & Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...comments].reverse().map((c, idx) => (
                      <TableRow key={c._id || idx} hover>
                        <TableCell>{comments.length - idx}</TableCell>
                        <TableCell sx={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{c.text}</TableCell>
                        <TableCell>{c.addedBy?.name || c.addedBy?.email || '—'}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(c.addedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary', border: '1px dashed grey', borderRadius: 1 }}>
                No comments available for this lead.
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default LeadView;
