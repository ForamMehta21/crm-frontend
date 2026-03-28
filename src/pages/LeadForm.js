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
  Autocomplete,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Layout from '../components/Layout';
import {
  fetchLeads,
  fetchLeadById,
  createLead,
  updateLead,
  addComment,
} from '../store/slices/leadSlice';
import { fetchPropertyTypes } from '../store/slices/propertyTypeSlice';
import { fetchPropertyConditions } from '../store/slices/propertyConditionSlice';
import { fetchLandmarks } from '../store/slices/landmarkSlice';

const validationSchema = Yup.object({
  leadType: Yup.string().required('Lead type is required'),
  fullName: Yup.string().required('Full name is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  email: Yup.string().email('Invalid email'),

  budget: Yup.number().min(0),
  ref: Yup.string(),
  propertyType: Yup.string(),
  propertyCondition: Yup.string(),
  preferredLocation: Yup.string(),
  leadStatus: Yup.string(),
  remarks: Yup.string(),
  nextCallDate: Yup.date().nullable(),
  purposeOfBuying: Yup.string(),
  propertyPreference: Yup.string().oneOf(['New', 'Resell', '']),
  ageOfProperty: Yup.string(),
  timelineToBuy: Yup.string(),
});

const leadTypes = ['Buyer', 'Broker', 'Seller'];
const leadStatuses = [
  'New', 'Attempted 1', 'Attempted 2', 'Attempted 3',
  'Follow-up', 'unqualified', 'warm', 'hot',
  'site visit planned', 'site visit done', 'booked', 'booed someware else',
];
const propertyTypeOptions = ['Residential Rent', 'Residential Sell', 'Commercial Rent', 'Commercial Sell'];
const purposeOfBuyingOptions = ['Personal Use', 'Investment', 'Second Home', 'Gift'];
const propertyPreferenceOptions = ['New', 'Resell'];
const ageOfPropertyOptions = ['Under Construction', '01-05', '5-10', '11-15', '15-25', '25+'];
const timelineToBuyOptions = ['0-15 days', '15-25 days', '25-30 days', '30-60 days', '90+ days'];

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return '-';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
};

const LeadForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { items, currentLead, currentLeadLoading } = useSelector((state) => state.leads);
  const { items: propertyTypes } = useSelector((state) => state.propertyTypes);
  const { items: propertyConditions } = useSelector((state) => state.propertyConditions);
  const { items: landmarks } = useSelector((state) => state.landmarks);
  const { admin } = useSelector((state) => state.auth);

  const isEditMode = Boolean(id);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    dispatch(fetchPropertyTypes());
    dispatch(fetchPropertyConditions());
    dispatch(fetchLandmarks({}));
    if (isEditMode) {
      // Always fetch the full lead with comments when editing
      dispatch(fetchLeadById(id));
    }
  }, [dispatch, isEditMode, id]);

  const formik = useFormik({
    initialValues: {
      leadType: '',
      fullName: '',
      phoneNumber: '',
      email: '',

      budget: '',
      ref: '',
      propertyType: '',
      propertyCategory: [],   // multiselect — array of IDs
      propertyCondition: '',
      preferredLocation: '',
      landmark: '',
      leadStatus: 'New',
      remarks: '',
      nextCallDate: null,
      purposeOfBuying: '',
      propertyPreference: '',
      ageOfProperty: '',
      timelineToBuy: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const leadData = {
        ...values,
        // Send array of IDs for propertyCategory
        propertyCategory: values.propertyCategory,
        assignedTo: admin._id,
      };

      if (isEditMode) {
        await dispatch(updateLead({ id, lead: leadData }));
      } else {
        await dispatch(createLead(leadData));
      }
      await dispatch(fetchLeads({}));
      navigate('/leads');
    },
  });

  // Populate form when editing (from currentLead fetched directly)
  useEffect(() => {
    if (isEditMode && currentLead && currentLead._id === id) {
      formik.setValues({
        leadType: currentLead.leadType || '',
        fullName: currentLead.fullName || '',
        phoneNumber: currentLead.phoneNumber || '',
        email: currentLead.email || '',

        budget: currentLead.budget || '',
        ref: currentLead.ref || '',
        propertyType: currentLead.propertyType || '',
        // propertyCategory is array of objects from populate — extract IDs
        propertyCategory: Array.isArray(currentLead.propertyCategory)
          ? currentLead.propertyCategory.map(c => (typeof c === 'object' ? c._id : c))
          : (currentLead.propertyCategory ? [currentLead.propertyCategory] : []),
        propertyCondition: currentLead.propertyCondition?._id || '',
        preferredLocation: currentLead.preferredLocation || '',
        landmark: currentLead.landmark?._id || '',
        leadStatus: currentLead.leadStatus || 'New',
        remarks: currentLead.remarks || '',
        nextCallDate: currentLead.nextCallDate ? dayjs(currentLead.nextCallDate) : null,
        purposeOfBuying: currentLead.purposeOfBuying || '',
        propertyPreference: currentLead.propertyPreference || '',
        ageOfProperty: currentLead.ageOfProperty || '',
        timelineToBuy: currentLead.timelineToBuy || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, id, currentLead]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setCommentSubmitting(true);
    setCommentError('');
    try {
      await dispatch(addComment({ id, text: commentText.trim() }));
      setCommentText('');
    } catch (err) {
      setCommentError('Failed to add comment. Please try again.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Filtered property types for multiselect
  const filteredPropertyTypes = propertyTypes.filter((type) => {
    if (!formik.values.propertyType) return true;
    if (formik.values.propertyType.includes('Residential')) return type.category === 'Residential';
    if (formik.values.propertyType.includes('Commercial')) return type.category === 'Commercial';
    return true;
  });

  const comments = currentLead?.comments || [];

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/leads')}>
            Back to Leads
          </Button>
          {isEditMode && (
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => navigate(`/leads/view/${id}`)}
            >
              View Lead
            </Button>
          )}
        </Box>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            {isEditMode ? 'Edit Lead' : 'Add New Lead'}
          </Typography>

          {isEditMode && currentLeadLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              {/* ── Basic Info ─────────────────────────────── */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} color="primary" sx={{ mb: 1 }}>
                  Basic Information
                </Typography>
                <Divider />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  options={leadTypes}
                  value={formik.values.leadType || null}
                  onChange={(_, newValue) => formik.setFieldValue('leadType', newValue || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      margin="normal"
                      label="Lead Type *"
                      error={formik.touched.leadType && Boolean(formik.errors.leadType)}
                      helperText={formik.touched.leadType && formik.errors.leadType}
                    />
                  )}
                  ListboxProps={{ style: { maxHeight: 200 } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth margin="normal" name="fullName" label="Full Name *"
                  value={formik.values.fullName} onChange={formik.handleChange}
                  error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                  helperText={formik.touched.fullName && formik.errors.fullName}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth margin="normal" name="phoneNumber" label="Phone Number *"
                  value={formik.values.phoneNumber} onChange={formik.handleChange}
                  error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                  helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth margin="normal" name="email" label="Email (Optional)"
                  value={formik.values.email} onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>



              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth margin="normal" name="budget" label="Budget (Optional)" type="number"
                  value={formik.values.budget} onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth margin="normal" name="ref" label="Reference (Optional)"
                  value={formik.values.ref} onChange={formik.handleChange}
                />
              </Grid>

              {/* ── Property Details ────────────────────────── */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary" sx={{ mb: 1 }}>
                  Property Details
                </Typography>
                <Divider />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  options={propertyTypeOptions}
                  value={formik.values.propertyType || null}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('propertyType', newValue || '');
                    formik.setFieldValue('propertyCategory', []);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} margin="normal" label="Property Type (Optional)" />
                  )}
                  ListboxProps={{ style: { maxHeight: 200 } }}
                />
              </Grid>

              {/* MULTISELECT for Configuration */}
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  multiple
                  options={filteredPropertyTypes}
                  getOptionLabel={(option) => option.name || ''}
                  value={propertyTypes.filter(t => formik.values.propertyCategory.includes(t._id))}
                  onChange={(_, newValues) => {
                    formik.setFieldValue('propertyCategory', newValues.map(v => v._id));
                  }}
                  disabled={!formik.values.propertyType}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={option._id}
                        label={option.name}
                        size="small"
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      margin="normal"
                      label="Configuration (Multiselect)"
                      placeholder={formik.values.propertyCategory.length === 0 ? 'Select...' : ''}
                    />
                  )}
                  ListboxProps={{ style: { maxHeight: 200 } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  options={propertyConditions}
                  getOptionLabel={(option) => option.name || ''}
                  value={propertyConditions.find(c => c._id === formik.values.propertyCondition) || null}
                  onChange={(_, newValue) => formik.setFieldValue('propertyCondition', newValue?._id || '')}
                  renderInput={(params) => (
                    <TextField {...params} margin="normal" label="Property Condition (Optional)" />
                  )}
                  ListboxProps={{ style: { maxHeight: 200 } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth margin="normal" name="preferredLocation" label="Preferred Location (Optional)"
                  value={formik.values.preferredLocation} onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  options={landmarks}
                  getOptionLabel={(option) => option.name ? `${option.name} - ${option.city}` : ''}
                  value={landmarks.find(l => l._id === formik.values.landmark) || null}
                  onChange={(_, newValue) => formik.setFieldValue('landmark', newValue?._id || '')}
                  renderInput={(params) => (
                    <TextField {...params} margin="normal" label="Landmark (Optional)" />
                  )}
                  ListboxProps={{ style: { maxHeight: 200 } }}
                />
              </Grid>

              {/* Property Preference */}
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  options={propertyPreferenceOptions}
                  value={formik.values.propertyPreference || null}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('propertyPreference', newValue || '');
                    // Reset ageOfProperty when preference changes
                    formik.setFieldValue('ageOfProperty', '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      margin="normal"
                      label="Property Preference (New / Resell)"
                      error={formik.touched.propertyPreference && Boolean(formik.errors.propertyPreference)}
                      helperText={formik.touched.propertyPreference && formik.errors.propertyPreference}
                    />
                  )}
                  ListboxProps={{ style: { maxHeight: 200 } }}
                />
              </Grid>

              {/* Age of Property */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  margin="normal"
                  name="ageOfProperty"
                  label="Age of Property"
                  value={formik.values.ageOfProperty}
                  onChange={formik.handleChange}
                >
                  <MenuItem value="">— None —</MenuItem>
                  {ageOfPropertyOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Timeline to Buy */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  margin="normal"
                  name="timelineToBuy"
                  label="Timeline to Buy"
                  value={formik.values.timelineToBuy}
                  onChange={formik.handleChange}
                >
                  <MenuItem value="">— None —</MenuItem>
                  {timelineToBuyOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* ── Lead Info ───────────────────────────────── */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary" sx={{ mb: 1 }}>
                  Lead Information
                </Typography>
                <Divider />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  options={leadStatuses}
                  value={formik.values.leadStatus || null}
                  onChange={(_, newValue) => formik.setFieldValue('leadStatus', newValue || 'New')}
                  renderInput={(params) => (
                    <TextField {...params} margin="normal" label="Lead Status" />
                  )}
                  ListboxProps={{ style: { maxHeight: 200 } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Next Call Date (Optional)"
                    value={formik.values.nextCallDate}
                    onChange={(newValue) => formik.setFieldValue('nextCallDate', newValue)}
                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  options={purposeOfBuyingOptions}
                  value={formik.values.purposeOfBuying || null}
                  onChange={(_, newValue) => formik.setFieldValue('purposeOfBuying', newValue || '')}
                  renderInput={(params) => (
                    <TextField {...params} margin="normal" label="Purpose of Buying (Optional)" />
                  )}
                  ListboxProps={{ style: { maxHeight: 200 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth margin="normal" name="remarks" label="Remarks"
                  multiline rows={3}
                  value={formik.values.remarks} onChange={formik.handleChange}
                />
              </Grid>

              {/* ── Action Buttons ──────────────────────────── */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 2, mt: 2 }}>
                  <Button variant="outlined" onClick={() => navigate('/leads')} fullWidth>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" fullWidth>
                    {isEditMode ? 'Update Lead' : 'Create Lead'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>

          {/* ── Comments Section (only in Edit mode) ─────── */}
          {isEditMode && (
            <>
              <Box sx={{ mt: 5 }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary" sx={{ mb: 1 }}>
                  Comments
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {commentError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {commentError}
                  </Alert>
                )}

                {/* Add Comment */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                    multiline
                    maxRows={3}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || commentSubmitting}
                    endIcon={commentSubmitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                    sx={{ minWidth: 100 }}
                  >
                    Add
                  </Button>
                </Box>

                {/* Comments Table */}
                {comments.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'action.hover' }}>
                          <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Comment</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Added By</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[...comments].reverse().map((c, idx) => (
                          <TableRow key={c._id || idx} hover>
                            <TableCell>{comments.length - idx}</TableCell>
                            <TableCell sx={{ maxWidth: 400, wordBreak: 'break-word' }}>{c.text}</TableCell>
                            <TableCell>
                              {c.addedBy?.name || c.addedBy?.email || admin?.name || '—'}
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              {formatDateTime(c.addedAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                    No comments yet. Be the first to add one!
                  </Box>
                )}
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Layout>
  );
};

export default LeadForm;
