import React from 'react';
import { useWelcomeViewContext } from "../Contexts/WelcomeViewContextProvider";
import WelcomeContent from "./WelcomeContent";
import SignUp from "./SignUp";
import Login from "./Login";
import VerifyOTP from "./VerifyOTP";
import { Box } from '@mui/material';

const WelcomePage = () => {
  const { view = "welcome" } = useWelcomeViewContext() || {};

  // Debug logging
  React.useEffect(() => {
    console.log("Current Welcome View:", view);
  }, [view]);

  return (
    <Box 
      className="welcome" 
      data-view={view}
      sx={{
        position: 'relative',
        width: '80%',
        height: '90vh',
        margin: 'auto',
        marginTop:"2rem",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '20px',
        boxSizing: 'border-box',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
      }}
    >
      <WelcomeContent />
      {view === "signup" && <SignUp />}
      {view === "login" && <Login />}
      {view === "otp" && <VerifyOTP />}
    </Box>
  );
}

export default WelcomePage;