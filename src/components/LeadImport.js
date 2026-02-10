import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  Collapse,
  Grid
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import {
  validateImport,
  importLeads,
  clearValidation,
  clearImportResults
} from '../store/slices/leadImportExportSlice';

const LeadImport = ({ open, onClose, onImportComplete }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validatedRows, setValidatedRows] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  
  const { loading, error, validationResults, importResults } = useSelector(
    (state) => state.leadImportExport
  );

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setValidatedRows([]);
      dispatch(clearValidation());
    }
  };

  const handleValidate = () => {
    if (selectedFile) {
      dispatch(validateImport(selectedFile)).then((result) => {
        if (result.payload && result.payload.validationResults) {
          setValidatedRows(result.payload.validationResults);
        }
      });
    }
  };

  const handleDeleteRow = (rowNumber) => {
    setValidatedRows(validatedRows.filter(row => row.rowNumber !== rowNumber));
  };

  const handleImport = () => {
    const validRowsToImport = validatedRows.filter(row => row.isValid);
    dispatch(importLeads(validRowsToImport)).then((result) => {
      if (result.payload) {
        setTimeout(() => {
          handleClose();
          if (onImportComplete) {
            onImportComplete();
          }
        }, 3000);
      }
    });
  };

  const handleClose = () => {
    setSelectedFile(null);
    setValidatedRows([]);
    setExpandedRow(null);
    dispatch(clearValidation());
    dispatch(clearImportResults());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const toggleRowExpand = (rowNumber) => {
    setExpandedRow(expandedRow === rowNumber ? null : rowNumber);
  };

  const validRowsCount = validatedRows.filter(row => row.isValid).length;
  const invalidRowsCount = validatedRows.filter(row => !row.isValid).length;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle>Import Leads from Excel</DialogTitle>
      <DialogContent>
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {importResults && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="h6">Import Successful!</Typography>
            <Typography>Imported {importResults.importedCount} leads</Typography>
            {importResults.newRecordsCreated.propertyCategories.length > 0 && (
              <Typography variant="body2">
                Created Property Categories: {importResults.newRecordsCreated.propertyCategories.join(', ')}
              </Typography>
            )}
            {importResults.newRecordsCreated.propertyConditions.length > 0 && (
              <Typography variant="body2">
                Created Property Conditions: {importResults.newRecordsCreated.propertyConditions.join(', ')}
              </Typography>
            )}
            {importResults.newRecordsCreated.landmarks.length > 0 && (
              <Typography variant="body2">
                Created Landmarks: {importResults.newRecordsCreated.landmarks.join(', ')}
              </Typography>
            )}
          </Alert>
        )}

        {!validationResults && !importResults && (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Step 1: Select an Excel file to import leads
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="contained" component="span">
                Choose File
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {selectedFile.name}
              </Typography>
            )}
            {selectedFile && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleValidate}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                Validate File
              </Button>
            )}
          </Box>
        )}

        {validationResults && !importResults && (
          <Box>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                  <Typography variant="h6" color="success.main">
                    <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Valid Rows: {validRowsCount}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
                  <Typography variant="h6" color="error.main">
                    <ErrorIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Invalid Rows: {invalidRowsCount}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                  <Typography variant="h6" color="info.main">
                    <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Total Rows: {validatedRows.length}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {validationResults.newRecordsToCreate && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">New Records to be Created:</Typography>
                {validationResults.newRecordsToCreate.propertyCategories.length > 0 && (
                  <Typography variant="body2">
                    Property Categories: {validationResults.newRecordsToCreate.propertyCategories.join(', ')}
                  </Typography>
                )}
                {validationResults.newRecordsToCreate.propertyConditions.length > 0 && (
                  <Typography variant="body2">
                    Property Conditions: {validationResults.newRecordsToCreate.propertyConditions.join(', ')}
                  </Typography>
                )}
                {validationResults.newRecordsToCreate.landmarks.length > 0 && (
                  <Typography variant="body2">
                    Landmarks: {validationResults.newRecordsToCreate.landmarks.join(', ')}
                  </Typography>
                )}
              </Alert>
            )}

            <Typography variant="body1" sx={{ mb: 2 }}>
              Step 2: Review validation results and delete unwanted rows
            </Typography>

            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Row</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Lead Type</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {validatedRows.map((row) => (
                    <React.Fragment key={row.rowNumber}>
                      <TableRow
                        sx={{
                          bgcolor: row.isValid ? '#f1f8e9' : '#ffebee'
                        }}
                      >
                        <TableCell>{row.rowNumber}</TableCell>
                        <TableCell>
                          {row.isValid ? (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Valid"
                              color="success"
                              size="small"
                            />
                          ) : (
                            <Chip
                              icon={<ErrorIcon />}
                              label="Invalid"
                              color="error"
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell>{row.fullName}</TableCell>
                        <TableCell>{row.phoneNumber}</TableCell>
                        <TableCell>{row.leadType}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleRowExpand(row.rowNumber)}
                          >
                            {expandedRow === row.rowNumber ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteRow(row.rowNumber)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={7} sx={{ p: 0 }}>
                          <Collapse in={expandedRow === row.rowNumber}>
                            <Box sx={{ p: 2, bgcolor: '#fafafa' }}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2">Data:</Typography>
                                  <Typography variant="body2">Email: {row.email || 'N/A'}</Typography>
                                  <Typography variant="body2">City: {row.city || 'N/A'}</Typography>
                                  <Typography variant="body2">Budget: {row.budget || 'N/A'}</Typography>
                                  <Typography variant="body2">Property Type: {row.propertyType || 'N/A'}</Typography>
                                  <Typography variant="body2">Configuration: {row.propertyCategory || 'N/A'}</Typography>
                                  <Typography variant="body2">Property Condition: {row.propertyCondition || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  {row.errors && row.errors.length > 0 && (
                                    <Box>
                                      <Typography variant="subtitle2" color="error">
                                        Errors:
                                      </Typography>
                                      {row.errors.map((err, idx) => (
                                        <Typography key={idx} variant="body2" color="error">
                                          • {err}
                                        </Typography>
                                      ))}
                                    </Box>
                                  )}
                                  {row.warnings && row.warnings.length > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                      <Typography variant="subtitle2" color="warning.main">
                                        Warnings:
                                      </Typography>
                                      {row.warnings.map((warn, idx) => (
                                        <Typography key={idx} variant="body2" color="warning.main">
                                          • {warn}
                                        </Typography>
                                      ))}
                                    </Box>
                                  )}
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        {validationResults && !importResults && validRowsCount > 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleImport}
            disabled={loading}
          >
            Import {validRowsCount} Valid Rows
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default LeadImport;
