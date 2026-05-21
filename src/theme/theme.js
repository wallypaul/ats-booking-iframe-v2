import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#B85B2F',
      light: '#D4845E',
      dark: '#8A3F1E',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#2B7A4B',
      light: '#E8F5ED',
      dark: '#1A5C35',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#BF3B30',
    },
    background: {
      default: '#F4F2EE',
      paper: '#FFFEF9',
    },
    text: {
      primary: '#1C1A16',
      secondary: '#888379',
    },
    divider: '#E2DED6',
  },
  typography: {
    fontFamily: "'DM Sans', sans-serif",
    h4: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 800,
    },
    h5: {
      fontWeight: 800,
      fontSize: '1.3rem',
    },
    h6: {
      fontWeight: 700,
      fontSize: '1.05rem',
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: '0.7rem',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.9rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#A04F28',
          },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#FFFEF9',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          '&.Mui-active': { color: '#B85B2F' },
          '&.Mui-completed': { color: '#B85B2F' },
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontWeight: 600,
          fontSize: '0.78rem',
          '&.Mui-active': { fontWeight: 700, color: '#B85B2F' },
        },
      },
    },
  },
});

export default theme;
