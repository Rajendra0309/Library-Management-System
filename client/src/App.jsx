import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box, 
  CssBaseline, 
  ThemeProvider, 
  createTheme 
} from '@mui/material';
import MemberList from './pages/Members/MemberList';
import MemberProfile from './pages/Members/MemberProfile';
import MemberHistory from './pages/Members/MemberHistory';
import ReservationList from './pages/Reservations/ReservationList';

// Create a modern theme with HSL-tailored colors for premium aesthetics
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Sleek indigo
    },
    secondary: {
      main: '#ec4899', // Pink
    },
    background: {
      default: '#0f172a', // Slate 900
      paper: '#1e293b', // Slate 800
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    }
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none'
        }
      }
    }
  }
});

// A simple navigation layout component
const Layout = ({ children }) => {
  // Mock login/logout handlers for testing
  const handleMockLogin = async (role) => {
    try {
      // Import api directly or use fetch, but we can just use fetch for simplicity to avoid import issues
      const response = await fetch('http://localhost:5000/api/mock-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.reload();
      } else {
        alert('Mock login failed: ' + data.message);
      }
    } catch (err) {
      alert('Mock login network error. Is the backend running on port 5000?');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
            📚 LMS Capstone (Member 3)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button component={Link} to="/members" color="inherit">Members</Button>
            <Button component={Link} to="/reservations" color="inherit">Reservations</Button>
            
            {currentUser ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mr: 1 }}>
                  {currentUser.name} ({currentUser.role})
                </Typography>
                <Button variant="outlined" color="secondary" size="small" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={() => handleMockLogin('admin')}>
                  Mock Admin
                </Button>
                <Button variant="outlined" size="small" onClick={() => handleMockLogin('librarian')}>
                  Mock Librarian
                </Button>
                <Button variant="outlined" size="small" onClick={() => handleMockLogin('member')}>
                  Mock Member
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {children}
      </Container>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/members" element={<MemberList />} />
            <Route path="/members/:id" element={<MemberProfile />} />
            <Route path="/members/:id/history" element={<MemberHistory />} />
            <Route path="/reservations" element={<ReservationList />} />
            <Route path="*" element={
              <Box sx={{ textAlign: 'center', mt: 8 }}>
                <Typography variant="h5" color="text.secondary">
                  Welcome to the Library Management System!
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  Navigate using the top bar to view Members or Reservations.
                </Typography>
              </Box>
            } />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
