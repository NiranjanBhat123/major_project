import React from 'react';
import { useWelcomeViewContext } from "../Contexts/WelcomeViewContextProvider";
import WelcomeContent from "./WelcomeContent";
import SignUp from "./SignUp";
import Login from "./Login";
import VerifyOTP from "./VerifyOTP";
import { Modal, Box,IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AuthModal = ({ open, onClose }) => {
  const { view } = useWelcomeViewContext();
  
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box 
        className="welcome" 
        data-view={view}
        sx={{
          position: 'relative',
          width: '80%',
          maxWidth: '1200px',
          height: '90vh',
          maxHeight: '800px',
          borderRadius: '20px',
          boxSizing: 'border-box',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 2000,
            color: view === 'signup' || view === 'login' ? 'text.primary' : 'background.paper',
          }}
        >
          <CloseIcon />
        </IconButton>
        <WelcomeContent />
        {view === "signup" && <SignUp />}
        {view === "login" && <Login />}
        {view === "otp" && <VerifyOTP />}
      </Box>
    </Modal>
  );
};

export default AuthModal;