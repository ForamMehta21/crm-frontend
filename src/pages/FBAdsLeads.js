import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Grid,
  MenuItem,
  Chip,
  TablePagination,
  TableSortLabel,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TodayIcon from "@mui/icons-material/Today";
import Layout from "../components/Layout";
import { fetchFBAdsLeads, deleteLead, updateLead } from "../store/slices/leadSlice";

const buildWaUrl = (phoneNumber) => {
  let phone = phoneNumber.replace(/\D/g, "");
  if (phone.length === 10) phone = `91${phone}`;
  else if (phone.length > 10 && phone.startsWith("0")) phone = `91${phone.substring(1)}`;
  return `https://api.whatsapp.com/send?phone=${phone}`;
};

const leadTypes = ["Buyer", "Broker", "Seller"];
const leadStatuses = [
  "New", "Attempted 1", "Attempted 2", "Attempted 3", "Follow-up",
  "unqualified", "warm", "hot", "site visit planned", "site visit done",
  "booked", "booed someware else",
];

const statusColors = {
  New: "info",
  "Attempted 1": "primary",
  "Attempted 2": "warning",
  "Attempted 3": "success",
  "Follow-up": "error",
};

const propertyPreferenceColors = { New: "success", Old: "warning" };

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d)) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const FBAdsLeads = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, pagination } = useSelector((state) => state.leads);

  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [dateDialog, setDateDialog] = useState({ open: false, leadId: null, value: "" });

  const [filters, setFilters] = useState({
    leadType: "", leadStatus: "", search: "",
    ref: "FB-Ads-Scarlet", page: 1, limit: 10,
    sortBy: "createdAt", sortOrder: "desc",
  });

  useEffect(() => {
    dispatch(fetchFBAdsLeads(filters));
  }, [dispatch, filters]);

  const toLocalDT = (date) => {
    const d = new Date(date);
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  const handleOpenDateDialog = (lead) => {
    const val = lead.nextCallDate ? toLocalDT(lead.nextCallDate) : toLocalDT(new Date());
    setDateDialog({ open: true, leadId: lead._id, value: val });
  };

  const handleSaveCallDate = () => {
    dispatch(updateLead({ id: dateDialog.leadId, lead: { nextCallDate: new Date(dateDialog.value) } })).then(() => {
      setSnack({ open: true, message: "Next call date updated!", severity: "success" });
      dispatch(fetchFBAdsLeads(filters));
      setDateDialog({ open: false, leadId: null, value: "" });
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      dispatch(deleteLead(id)).then(() => dispatch(fetchFBAdsLeads(filters)));
    }
  };

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });

  const handlePageChange = (_, newPage) => setFilters({ ...filters, page: newPage + 1 });
  const handleRowsPerPageChange = (e) =>
    setFilters({ ...filters, limit: parseInt(e.target.value, 10), page: 1 });

  const handleSortChange = (column) => {
    setFilters({
      ...filters, sortBy: column,
      sortOrder: filters.sortBy === column && filters.sortOrder === "asc" ? "desc" : "asc",
      page: 1,
    });
  };

  return (
    <Layout>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            mb: 3,
            gap: 2,
          }}
        >
          <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
            FB-Ads (Scarlet) Leads
          </Typography>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" name="search" label="Search (Name, Phone, Email)"
                value={filters.search} onChange={handleFilterChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth select size="small" name="leadType" label="Lead Type"
                value={filters.leadType} onChange={handleFilterChange}>
                <MenuItem value="">All</MenuItem>
                {leadTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth select size="small" name="leadStatus" label="Status"
                value={filters.leadStatus} onChange={handleFilterChange}>
                <MenuItem value="">All</MenuItem>
                {leadStatuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button fullWidth variant="outlined" startIcon={<SearchIcon />}
                onClick={() => dispatch(fetchFBAdsLeads(filters))}>
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>
        ) : (
          <>
            <TableContainer component={Paper} className="responsive-table">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "action.hover" }}>
                    <TableCell sortDirection={filters.sortBy === "fullName" ? filters.sortOrder : false}>
                      <TableSortLabel
                        active={filters.sortBy === "fullName"}
                        direction={filters.sortBy === "fullName" ? filters.sortOrder : "asc"}
                        onClick={() => handleSortChange("fullName")}
                      >Name</TableSortLabel>
                    </TableCell>
                    <TableCell sortDirection={filters.sortBy === "leadType" ? filters.sortOrder : false}>
                      <TableSortLabel
                        active={filters.sortBy === "leadType"}
                        direction={filters.sortBy === "leadType" ? filters.sortOrder : "asc"}
                        onClick={() => handleSortChange("leadType")}
                      >Type</TableSortLabel>
                    </TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Ref</TableCell>
                    <TableCell>Property Type</TableCell>
                    <TableCell>Configuration</TableCell>
                    <TableCell>Prop. Preference</TableCell>
                    <TableCell sortDirection={filters.sortBy === "leadStatus" ? filters.sortOrder : false}>
                      <TableSortLabel
                        active={filters.sortBy === "leadStatus"}
                        direction={filters.sortBy === "leadStatus" ? filters.sortOrder : "asc"}
                        onClick={() => handleSortChange("leadStatus")}
                      >Status</TableSortLabel>
                    </TableCell>
                    <TableCell sortDirection={filters.sortBy === "createdAt" ? filters.sortOrder : false}>
                      <TableSortLabel
                        active={filters.sortBy === "createdAt"}
                        direction={filters.sortBy === "createdAt" ? filters.sortOrder : "desc"}
                        onClick={() => handleSortChange("createdAt")}
                      >Created At</TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item._id} hover className="responsive-row">
                      <TableCell
                        data-label="Name"
                        sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline", color: "primary.main" } }}
                        onClick={() => navigate(`/leads/edit/${item._id}`)}
                      >
                        {item.fullName}
                      </TableCell>
                      <TableCell data-label="Type">
                        <Chip label={item.leadType} size="small" />
                      </TableCell>
                      <TableCell data-label="Phone">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <a href={`tel:${item.phoneNumber}`} style={{ textDecoration: "none", color: "inherit" }}>
                            {item.phoneNumber}
                          </a>
                          {item.phoneNumber && (
                            <a
                              href={buildWaUrl(item.phoneNumber)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: "inline-flex", alignItems: "center", color: "#25D366", textDecoration: "none", padding: "3px", borderRadius: "50%", lineHeight: 0 }}
                            >
                              <WhatsAppIcon style={{ fontSize: 18 }} />
                            </a>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell data-label="Ref">{item.ref || "-"}</TableCell>
                      <TableCell data-label="Property Type">{item.propertyType || "-"}</TableCell>
                      <TableCell data-label="Configuration">{item.propertyCategory?.name || "-"}</TableCell>
                      <TableCell data-label="Prop. Pref">
                        {item.propertyPreference ? (
                          <Chip
                            label={item.propertyPreference}
                            size="small"
                            color={propertyPreferenceColors[item.propertyPreference] || "default"}
                          />
                        ) : "-"}
                      </TableCell>
                      <TableCell data-label="Status">
                        <Chip
                          label={item.leadStatus}
                          size="small"
                          color={statusColors[item.leadStatus] || "default"}
                        />
                      </TableCell>
                      <TableCell data-label="Created At">
                        <Tooltip title={new Date(item.createdAt).toLocaleString()} placement="top">
                          <span>{formatDate(item.createdAt)}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell data-label="Actions" align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Set Next Call Date">
                          <IconButton color="success" onClick={() => handleOpenDateDialog(item)} size="small">
                            <TodayIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <IconButton color="info" onClick={() => navigate(`/leads/view/${item._id}`)} size="small">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="primary" onClick={() => navigate(`/leads/edit/${item._id}`)} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(item._id)} size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No leads found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={pagination.total}
              page={pagination.page - 1}
              onPageChange={handlePageChange}
              rowsPerPage={filters.limit}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Container>

      <Dialog open={dateDialog.open} onClose={() => setDateDialog({ ...dateDialog, open: false })} maxWidth="xs" fullWidth>
        <DialogTitle>Set Next Call Date & Time</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            type="datetime-local"
            value={dateDialog.value}
            onChange={(e) => setDateDialog({ ...dateDialog, value: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDateDialog({ open: false, leadId: null, value: "" })}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCallDate} disabled={!dateDialog.value}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default FBAdsLeads;
