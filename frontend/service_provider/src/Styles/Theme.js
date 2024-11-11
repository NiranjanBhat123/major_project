import { createTheme } from '@mui/material/styles';

const Theme = createTheme({
  palette: {
    primary: {
      light: '#64b5f6',
      main: '#1e88e5',
      dark: '#1565c0',
      contrastText: '#fff'
    },
    secondary: {
      light: '#69b7ff',
      main: '#4299e1',
      dark: '#2d6cb5',
      contrastText: '#fff'
    },
    background: {
      default: '#F0F0F0',
      light: '#f7fafc',
      muted: '#dde1e8',
      paper: '#fff'
    },
    text: {
      primary: '#000000',
      secondary: '#b3b2b2',
      muted: '#666',
      disabled: '#999'
    },
    error: {
      main: '#ff1744',
      light: '#ff4569',
      dark: '#cc0033'
    },
    success: {
      main: '#4caf50',
      light: '#80e27e',
      dark: '#087f23'
    },
    warning: {
      main: '#ff9800',
      light: '#ffc947',
      dark: '#c66900'
    }
  },

  typography: {
    fontFamily: '"Poppins", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      textAlign: "center",
    },
    h4: {
      fontWeight: 600,
      fontSize: '2rem',
      textAlign: "center",
    },
    h5: {
      fontWeight: 400,
      textAlign: "center",
    },
    body1: {
      fontWeight: 400,
    }
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 30px',
          borderRadius: '25px',
          fontSize: '1rem',
          textTransform: 'none',
          boxSizing: 'border-box',
        },
        contained: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.background.paper,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        }),
        outlined: ({ theme }) => ({
          border: `2px solid ${theme.palette.background.paper}`,
          color: theme.palette.background.paper,
          borderRadius: '25px',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        })
      }
    },

    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        required: true,
        variant: "outlined",
        margin: "normal"
      },
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: theme.palette.text.secondary,
            },
            '&:hover fieldset': {
              borderColor: theme.palette.text.primary
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.secondary.main
            }
          },
          '& .MuiFormLabel-root': {
            color: theme.palette.text.muted,
            '&.Mui-focused': {
              color: theme.palette.secondary.main
            }
          },
          '& .Mui-error': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.error.main
            },
            '&.MuiFormLabel-root': {
              color: theme.palette.error.main
            }
          }
        })
      }
    },

    MuiSvgIcon: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&[data-testid="CloseIcon"], &[data-testid="ArrowBackIcon"]': {
            cursor: 'pointer',
            backgroundColor: theme.palette.background.muted,
            color: theme.palette.secondary.main,
            padding: '0.5rem',
            borderRadius: '50%',
            fontSize: '1.2rem',
            transition: 'all 0.2s ease-in-out'
          },
          '&[data-testid="CloseIcon"]:hover': {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            transform: 'rotate(90deg)'
          },
          '&[data-testid="ArrowBackIcon"]:hover': {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            transform: 'translateX(-5px)'
          },
          '.MuiAlert-root &[data-testid="CloseIcon"]': {
            padding: 0,
            backgroundColor: 'transparent',
            color: 'inherit',
            fontSize: '1.25rem',
            transition: 'opacity 0.2s ease-in-out',
            '&:hover': {
              opacity: 0.7
            }
          }
        })
      }
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
          }
        }
      }
    },
  }
});

export default Theme;
