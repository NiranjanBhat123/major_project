import React, { useState } from 'react';
import { useWelcomeViewContext } from "../Contexts/WelcomeViewContextProvider";
import { Typography, TextField, Button, Box, Link } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Login = () => {
  const { setEmpty, showSignUp ,handleCloseAuthModal,handleLogin} = useWelcomeViewContext();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/client/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        const errorMessage = data.detail || data.email || data.password || data.non_field_errors || 'Login failed';
        throw new Error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
      }

      // Store tokens in localStorage
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);

      // // Clear form
      // setFormData({
      //   email: '',
      //   password: ''
      // });

      // // Close login modal
      handleLogin();
      handleCloseAuthModal();

    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
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
          right: '1.5rem',
          cursor: 'pointer'
        }}
      />

      <Typography variant="h4" sx={{ mb: 2, color: 'primary.main' }}>
        Login
      </Typography>

      <Box sx={{ width: '100%', maxWidth: '400px' }}>
        <TextField
          label="Email Address"
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          required
          type="email"
          error={!!error}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          required
          type="password"
          error={!!error}
          sx={{ mb: error ? 1 : 3 }}
        />
        
        {error && (
          <Typography 
            color="error" 
            variant="body2"
            sx={{ mb: 2, textAlign: 'center' }}
          >
            {error}
          </Typography>
        )}

        <Button
          type="submit"
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