import React from 'react';
import { useWelcomeViewContext } from "../Contexts/WelcomeViewContextProvider";
import { Typography, Button, Box } from '@mui/material';

const WelcomeContent = () => {
  const { showSignUp } = useWelcomeViewContext();

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        bgcolor: 'secondary.main',
        transition: 'width 0.5s ease-in-out',
        padding: '2rem',
        '.welcome[data-view="signup"] &, .welcome[data-view="login"] &, .welcome[data-view="otp"] &': {
          width: '50%'
        }
      }}
    >
      <Typography
        variant="title"
        sx={{
          color: 'background.paper',
          mb: 2,
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)',
        }}
      >
        FixNGo
      </Typography>
      <Typography
        variant="h5"
        sx={{
          color: 'background.paper',
          mb: 4,
          textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
        }}
      >
        A Platform for On-Demand Local Home Services
      </Typography>
      <Typography
        variant="h5"
        sx={{
          position: 'absolute',
          bottom: '2rem',
          color: 'background.paper',
          textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
        }}
      >
        Service Providers
      </Typography>
      <Button variant="outlined" onClick={showSignUp}>
        Join Us
      </Button>
    </Box>
  );
}

export default WelcomeContent;
