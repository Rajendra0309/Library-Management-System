import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5B4FE8', // --primary_container
      light: '#8B5CF6',
      dark: '#4231cf', // --primary
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#F59E0B', // Warm Amber (from DESIGN.md)
      light: '#fea619', // --secondary_container
      dark: '#855300', // --secondary
      contrastText: '#ffffff',
    },
    error: {
      main: '#EF4444',
      container: '#ffdad6',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#F59E0B',
    },
    info: {
      main: '#3B82F6',
    },
    success: {
      main: '#10B981',
    },
    background: {
      default: '#F7F8FC', // --bg-page
      paper: '#FFFFFF', // --bg-surface
      sidebar: '#FAFBFE', // --bg-sidebar
    },
    text: {
      primary: '#141b2b', // --on_surface
      secondary: '#6B7280', // --text-secondary
      disabled: '#9CA3AF', // --text-tertiary
    },
    divider: 'rgba(0, 0, 0, 0.08)', // --border-default
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h4: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 600,
    },
    subtitle2: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    overline: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 10, // --radius-md
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 16px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #5B4FE8 0%, #8B5CF6 50%, #A78BFA 100%)', // --brand-gradient
          boxShadow: '0 4px 12px rgba(91, 79, 232, 0.15)',
          '&:hover': {
            boxShadow: '0 0 0 1px rgba(91, 79, 232, 0.2), 0 4px 16px rgba(91, 79, 232, 0.15)', // --brand-glow
            transform: 'scale(1.02)',
          },
          transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14, // --radius-lg
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)', // --shadow-sm
          border: '1px solid rgba(0, 0, 0, 0.04)', // --border-subtle
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
        },
        elevation3: {
          boxShadow: '0 10px 24px rgba(0, 0, 0, 0.10), 0 4px 8px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6, // --radius-sm
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#5B4FE8',
            borderWidth: '2px',
            boxShadow: '0 0 0 3px rgba(91, 79, 232, 0.4)', // --focus-ring
          },
        },
      },
    },
  },
});

export default theme;
