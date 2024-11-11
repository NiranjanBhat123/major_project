import React from 'react';
import { useWelcomeViewContext } from "../Contexts/WelcomeViewContextProvider";
import { Typography, TextField, Button, Box, Link } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Login = () => {
  const { setEmpty, showSignUp } = useWelcomeViewContext();

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100%',
        width: '50%',
        bgcolor: 'background.light',
        padding: '2rem',
        boxSizing: 'border-box',
        overflow: 'hidden',
        boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.1)',
        '@keyframes slideIn': {
          from: {
            transform: 'translateX(100%)',
            opacity: 0,
          },
          to: {
            transform: 'translateX(0)',
            opacity: 1,
          },
        },
        animation: 'slideIn 0.5s ease-out forwards'
      }}
    >
      <CloseIcon
        onClick={setEmpty}
        sx={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem'
        }}
      />

      <Typography variant="h4" sx={{ mb: 2, color: 'primary.main' }}>
        Login
      </Typography>

      <Box sx={{ width: '100%', maxWidth: '400px' }}>
        <TextField
          label="Email Address"
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          type="password"
          sx={{ mb: 3 }}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ mb: 3 }}
        >
          Login
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'text.muted' }}>
            Don't have an account?{' '}
            <Link
              component="button"
              onClick={showSignUp}
              sx={{ color: 'secondary.main' }}
            >
              SignUp
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
