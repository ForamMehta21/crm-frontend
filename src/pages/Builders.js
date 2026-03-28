import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Typography,
  Box,
  CircularProgress,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Layout from '../components/Layout';
import {
  fetchBuilders,
  deleteBuilder,
} from '../store/slices/builderSlice';

const Builders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.builders);

  useEffect(() => {
    dispatch(fetchBuilders());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this builder?')) {
      dispatch(deleteBuilder(id));
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 3,
            gap: 2
          }}
        >
          <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            Builders
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/builders/new')}
            size="small"
          >
            Add Builder
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} className="responsive-table">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Company Name</TableCell>
                  <TableCell>Running Projects</TableCell>
                  <TableCell>Upcoming Projects</TableCell>
                  <TableCell>Completed Projects</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id} className="responsive-row">
                    <TableCell data-label="Name">{item.name}</TableCell>
                    <TableCell data-label="Phone Number">{item.number}</TableCell>
                    <TableCell data-label="Company Name">{item.companyName}</TableCell>
                    <TableCell data-label="Running Projects">
                      {item.runningProjects?.map((project, idx) => (
                        <Chip key={idx} label={project} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </TableCell>
                    <TableCell data-label="Upcoming Projects">
                      {item.upcomingProjects?.map((project, idx) => (
                        <Chip key={idx} label={project} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </TableCell>
                    <TableCell data-label="Completed Projects">
                      {item.completedProjects?.map((project, idx) => (
                        <Chip key={idx} label={project} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </TableCell>
                    <TableCell data-label="Actions" align="right">
                      <IconButton onClick={() => navigate(`/builders/edit/${item._id}`)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(item._id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Layout>
  );
};

export default Builders;
