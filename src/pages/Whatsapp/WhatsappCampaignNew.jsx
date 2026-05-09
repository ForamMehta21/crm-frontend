import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Slider,
  Alert,
  CircularProgress,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Layout from '../../components/Layout';
import {
  fetchTemplates,
  createCampaign,
  previewAudience,
  sendCampaign,
  clearError,
  clearAudiencePreview
} from '../../store/slices/whatsappSlice';

const steps = ['Choose Template', 'Set Audience', 'Map Variables', 'Schedule & Send'];

const leadStatusOptions = [
  'New', 'Attempted 1', 'Attempted 2', 'Attempted 3', 'Follow-up',
  'unqualified', 'warm', 'hot', 'site visit planned', 'site visit done', 'booked'
];

const propertyTypeOptions = [
  'Residential Rent', 'Residential Sell', 'Commercial Rent', 'Commercial Sell'
];

const variableFieldOptions = [
  { value: 'lead.fullName', label: 'Lead Name' },
  { value: 'lead.phoneNumber', label: 'Lead Phone' },
  { value: 'lead.email', label: 'Lead Email' },
  { value: 'lead.propertyType', label: 'Property Type' },
  { value: 'lead.budget', label: 'Lead Budget' },
  { value: 'lead.preferredLocation', label: 'Preferred Location' },
  { value: 'assignedUser.name', label: 'Assigned Agent Name' },
];

const WhatsappCampaignNew = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { templates, audiencePreview, loading, error } = useSelector((state) => state.whatsapp);
  const users = useSelector((state) => state.users?.items || []);

  const [activeStep, setActiveStep] = useState(0);
  const [campaignName, setCampaignName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [filters, setFilters] = useState({
    status: [],
    propertyType: [],
    budgetMin: 0,
    budgetMax: 10000000,
    assignedTo: '',
    dateFrom: '',
    dateTo: ''
  });
  const [variableMapping, setVariableMapping] = useState({});
  const [customValues, setCustomValues] = useState({});
  const [sendMode, setSendMode] = useState('now');
  const [scheduledAt, setScheduledAt] = useState(null);
  const [createdCampaignId, setCreatedCampaignId] = useState(null);

  useEffect(() => {
    dispatch(fetchTemplates());
    return () => {
      dispatch(clearError());
      dispatch(clearAudiencePreview());
    };
  }, [dispatch]);

  const approvedTemplates = templates.filter(t => t.status === 'APPROVED');

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    const mapping = {};
    (tpl.variables || []).forEach(v => { mapping[v] = ''; });
    setVariableMapping(mapping);
  };

  const handlePreviewAudience = async () => {
    if (createdCampaignId) {
      dispatch(previewAudience({ id: createdCampaignId, filters }));
    } else {
      const result = await dispatch(createCampaign({
        name: campaignName || `Campaign ${new Date().toLocaleDateString()}`,
        templateId: selectedTemplate._id,
        variableMapping,
        filters
      }));
      if (result.payload?._id) {
        setCreatedCampaignId(result.payload._id);
        dispatch(previewAudience({ id: result.payload._id, filters }));
      }
    }
  };

  const handleNext = () => {
    if (activeStep === 1 && !createdCampaignId) {
      handlePreviewAudience();
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleLaunch = async () => {
    let campId = createdCampaignId;

    if (!campId) {
      const result = await dispatch(createCampaign({
        name: campaignName || `Campaign ${new Date().toLocaleDateString()}`,
        templateId: selectedTemplate._id,
        variableMapping,
        filters
      }));
      if (result.payload?._id) {
        campId = result.payload._id;
        setCreatedCampaignId(campId);
      } else {
        return;
      }
    }

    const sendPayload = {
      id: campId,
      scheduledAt: sendMode === 'schedule' && scheduledAt ? scheduledAt.toISOString() : null
    };

    const sendResult = await dispatch(sendCampaign(sendPayload));
    if (!sendResult.error) {
      navigate('/whatsapp/campaigns');
    }
  };

  const handleVariableChange = (position, value) => {
    setVariableMapping(prev => ({ ...prev, [position]: value }));
  };

  const handleCustomValueChange = (position, value) => {
    setCustomValues(prev => ({ ...prev, [position]: value }));
    setVariableMapping(prev => ({ ...prev, [position]: value }));
  };

  const getRenderedPreview = () => {
    if (!selectedTemplate) return '';
    const bodyComp = selectedTemplate.components?.find(c => c.type === 'BODY');
    if (!bodyComp?.text) return '';
    let msg = bodyComp.text;
    for (const [pos, field] of Object.entries(variableMapping)) {
      let display = field;
      const opt = variableFieldOptions.find(o => o.value === field);
      if (opt) display = `[${opt.label}]`;
      msg = msg.replace(`{{${pos}}}`, display || `{{${pos}}}`);
    }
    return msg;
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0: return selectedTemplate !== null;
      case 1: return true;
      case 2: return Object.values(variableMapping).every(v => v !== '');
      case 3: return sendMode === 'now' || (sendMode === 'schedule' && scheduledAt);
      default: return true;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              label="Campaign Name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              sx={{ mb: 3 }}
              placeholder="e.g. Diwali Property Offers"
            />
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Select a Template ({approvedTemplates.length} approved)
            </Typography>
            <Grid container spacing={2}>
              {approvedTemplates.map((tpl) => {
                const bodyComp = tpl.components?.find(c => c.type === 'BODY');
                const isSelected = selectedTemplate?._id === tpl._id;
                return (
                  <Grid item xs={12} sm={6} md={4} key={tpl._id}>
                    <Card
                      sx={{
                        border: isSelected ? '2px solid #6366f1' : '1px solid rgba(148,163,184,0.1)',
                        backgroundColor: isSelected ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
                        borderRadius: 3
                      }}
                    >
                      <CardActionArea onClick={() => handleSelectTemplate(tpl)} sx={{ p: 2 }}>
                        <CardContent sx={{ p: 0 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {tpl.name}
                          </Typography>
                          <Chip label={tpl.category} size="small" sx={{ mb: 1 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                            {bodyComp?.text?.slice(0, 120) || 'No body'}
                            {bodyComp?.text?.length > 120 ? '...' : ''}
                          </Typography>
                          {tpl.variables?.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {tpl.variables.map((v, i) => (
                                <Chip key={i} label={`{{${v}}}`} size="small" variant="outlined" sx={{ mr: 0.5, mt: 0.5 }} />
                              ))}
                            </Box>
                          )}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            {approvedTemplates.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>No approved templates found. Sync templates from Meta first.</Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Filter Audience</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Lead Status</InputLabel>
                  <Select
                    multiple
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    input={<OutlinedInput label="Lead Status" />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {leadStatusOptions.map(s => (
                      <MenuItem key={s} value={s}>
                        <Checkbox checked={filters.status.includes(s)} />
                        <ListItemText primary={s} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Property Type</InputLabel>
                  <Select
                    multiple
                    value={filters.propertyType}
                    onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                    input={<OutlinedInput label="Property Type" />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {propertyTypeOptions.map(pt => (
                      <MenuItem key={pt} value={pt}>
                        <Checkbox checked={filters.propertyType.includes(pt)} />
                        <ListItemText primary={pt} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>Budget Range</Typography>
                <Slider
                  value={[filters.budgetMin, filters.budgetMax]}
                  onChange={(e, newVal) => setFilters(prev => ({ ...prev, budgetMin: newVal[0], budgetMax: newVal[1] }))}
                  min={0}
                  max={10000000}
                  step={100000}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `₹${(v / 100000).toFixed(1)}L`}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Assigned To</InputLabel>
                  <Select
                    value={filters.assignedTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
                    label="Assigned To"
                  >
                    <MenuItem value="">All</MenuItem>
                    {users.map(u => (
                      <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="From Date"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="To Date"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handlePreviewAudience}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Preview Audience'}
              </Button>
            </Box>

            {audiencePreview && (
              <Paper sx={{ mt: 2, p: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.1)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: audiencePreview.count === 0 ? 'error.main' : 'success.main' }}>
                  {audiencePreview.count} eligible leads
                </Typography>
                {audiencePreview.count === 0 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>No leads match your filters. Adjust and try again.</Alert>
                )}
                {audiencePreview.sample?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Sample leads:</Typography>
                    {audiencePreview.sample.map((lead, idx) => (
                      <Typography key={idx} variant="body2">
                        • {lead.fullName} ({lead.phoneNumber}) — {lead.leadStatus}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Paper>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Map Template Variables</Typography>
            {selectedTemplate?.variables?.length > 0 ? (
              <Grid container spacing={2}>
                {selectedTemplate.variables.map((varName) => (
                  <Grid item xs={12} sm={6} key={varName}>
                    <FormControl fullWidth>
                      <InputLabel>{`Variable {{${varName}}}`}</InputLabel>
                      <Select
                        value={variableMapping[varName] || ''}
                        onChange={(e) => handleVariableChange(varName, e.target.value)}
                        label={`Variable {{${varName}}}`}
                      >
                        {variableFieldOptions.map(opt => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                        <MenuItem value="__custom__">Custom Text</MenuItem>
                      </Select>
                    </FormControl>
                    {variableMapping[varName] === '__custom__' && (
                      <TextField
                        fullWidth
                        label="Custom Value"
                        value={customValues[varName] || ''}
                        onChange={(e) => handleCustomValueChange(varName, e.target.value)}
                        sx={{ mt: 1 }}
                        placeholder="Type your custom text"
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">This template has no variables to map.</Alert>
            )}

            <Paper sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Live Preview</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {getRenderedPreview()}
              </Typography>
            </Paper>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Schedule & Send</Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Send Mode</InputLabel>
              <Select
                value={sendMode}
                onChange={(e) => setSendMode(e.target.value)}
                label="Send Mode"
              >
                <MenuItem value="now">Send Now</MenuItem>
                <MenuItem value="schedule">Schedule for Later</MenuItem>
              </Select>
            </FormControl>

            {sendMode === 'schedule' && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Scheduled Date & Time"
                  value={scheduledAt}
                  onChange={(val) => setScheduledAt(val)}
                  minDateTime={dayjs()}
                  sx={{ width: '100%', mb: 3 }}
                />
              </LocalizationProvider>
            )}

            <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.1)' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Campaign Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Template</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedTemplate?.name || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Audience</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{audiencePreview?.count || 0} leads</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Send Mode</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {sendMode === 'now' ? 'Immediately' : scheduledAt?.format('DD MMM YYYY, hh:mm A') || 'Not set'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Campaign Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{campaignName || 'Untitled'}</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleLaunch}
                disabled={loading || !canProceed()}
                sx={{
                  px: 6,
                  py: 1.5,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  fontWeight: 700,
                  fontSize: '1rem'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Launch Campaign'}
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          New WhatsApp Campaign
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.1)' }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}

        {activeStep < 3 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
            </Button>
          </Box>
        )}
      </Paper>
    </Layout>
  );
};

export default WhatsappCampaignNew;
