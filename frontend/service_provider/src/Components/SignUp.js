import React, { useState } from 'react';
import { useWelcomeViewContext } from "../Contexts/WelcomeViewContextProvider";
import { Typography, TextField, Button, Box, Link } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const SignUp = () => {
  const { setEmpty, showOTP, showLogin, signUpEmail, updateSignUpEmail } = useWelcomeViewContext();
  const [emailError, setEmailError] = useState('');

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  const validateEmail = (email) => {
    if(!email) return 'Email is required';
    if(!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const handleEmailChange = (event) => {
    const newEmail = event.target.value;
    setEmailError(validateEmail(newEmail));
    updateSignUpEmail(newEmail);
  };

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
        Sign Up
      </Typography>

      <Box sx={{ width: '100%', maxWidth: '400px' }}>
        <TextField
          label="Email Address"
          value={signUpEmail}
          onChange={handleEmailChange}
          error={!!emailError}
          helperText={emailError}
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={() => showOTP()}
          disabled={!!emailError || !signUpEmail}
          sx={{
            mb: 3,
            '&.Mui-disabled': {
              bgcolor: 'text.secondary'
            }
          }}
        >
          Send OTP
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'text.muted' }}>
            Already have an account?{' '}
            <Link
              component="button"
              onClick={showLogin}
              sx={{ color: 'secondary.main' }}
            >
              Login
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SignUp;
