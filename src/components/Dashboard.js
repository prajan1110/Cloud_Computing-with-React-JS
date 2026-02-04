import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  LinearProgress,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  School,
  Grade,
  TrendingUp,
  AccountCircle,
  Logout,
  MoreVert,
  BarChart,
  Timeline,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: 16,
        },
      },
    },
  },
});

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/');
      return;
    }

    setUser(JSON.parse(userData));
    fetchResults();
  }, [navigate]);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const [resultsResponse, summaryResponse] = await Promise.all([
        fetch('http://localhost:5001/api/results', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:5001/api/results/summary', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (resultsResponse.ok && summaryResponse.ok) {
        const resultsData = await resultsResponse.json();
        const summaryData = await summaryResponse.json();
        setResults(resultsData);
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getGradeColor = (marks) => {
    if (marks >= 90) return 'success';
    if (marks >= 80) return 'primary';
    if (marks >= 70) return 'warning';
    return 'error';
  };

  const getCGPAColor = (cgpa) => {
    if (cgpa >= 9) return '#4caf50';
    if (cgpa >= 8) return '#2196f3';
    if (cgpa >= 7) return '#ff9800';
    return '#f44336';
  };

  const overallCGPA = summary.length > 0
    ? (summary.reduce((sum, sem) => sum + sem.cgpa, 0) / summary.length).toFixed(2)
    : 0;

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <LinearProgress />
            <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading your results...</Typography>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <School sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Student Results Portal
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ mr: 1, bgcolor: 'secondary.main' }}>
                <AccountCircle />
              </Avatar>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {user?.username}
              </Typography>
              <IconButton color="inherit" onClick={handleMenuClick}>
                <MoreVert />
              </IconButton>
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {/* Welcome Section */}
          <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.username}!
            </Typography>
            <Typography variant="h6">
              Here's your academic performance overview
            </Typography>
          </Paper>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Grade sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: getCGPAColor(overallCGPA) }}>
                    {overallCGPA}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall CGPA
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <BarChart sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {summary.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Semesters Completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Timeline sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {results.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Subjects
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Semester Summary */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Semester-wise Performance
            </Typography>
            <Grid container spacing={2}>
              {summary.map((sem) => (
                <Grid item xs={12} md={6} key={sem.semester}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}
                    onClick={() => {
                      setSelectedSemester(sem.semester);
                      setDialogOpen(true);
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Semester {sem.semester}
                        </Typography>
                        <Chip
                          label={`${sem.subjects} Subjects`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          CGPA:
                        </Typography>
                        <Typography variant="h6" sx={{ color: getCGPAColor(sem.cgpa), fontWeight: 'bold' }}>
                          {sem.cgpa}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(sem.cgpa / 10) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getCGPAColor(sem.cgpa),
                          },
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Detailed Results Table */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Detailed Results
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Semester</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Marks</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>CGPA</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Chip
                          label={`Sem ${result.semester}`}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{result.subject}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography sx={{ mr: 1 }}>{result.marks}</Typography>
                          <Chip
                            label={result.grade}
                            color={getGradeColor(result.marks)}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{result.grade}</TableCell>
                      <TableCell>
                        <Typography sx={{ color: getCGPAColor(result.cgpa), fontWeight: 'bold' }}>
                          {result.cgpa}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>

        {/* Semester Details Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Semester {selectedSemester} Details
          </DialogTitle>
          <DialogContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Marks</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results
                    .filter(result => result.semester === selectedSemester)
                    .map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{result.subject}</TableCell>
                        <TableCell>{result.marks}</TableCell>
                        <TableCell>
                          <Chip
                            label={result.grade}
                            color={getGradeColor(result.marks)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;