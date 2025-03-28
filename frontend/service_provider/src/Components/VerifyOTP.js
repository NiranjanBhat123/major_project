import React, { useState, useEffect } from 'react';
import { useWelcomeViewContext } from "../Contexts/WelcomeViewContextProvider";
import { useNavigate } from 'react-router-dom';
import emailjs from 'emailjs-com';
import { Typography, Button, Box, TextField, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const VerifyOTP = () => {
  const { setEmpty, showSignUp, showLogin, signUpEmail } = useWelcomeViewContext();
  const navigate = useNavigate();
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => {
    emailjs.init("uesieNfl6p0PM25zY");
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if(timer > 0 && isResendDisabled) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    else if(timer === 0) {
      setIsResendDisabled(false);
      setGeneratedOTP("xxxxxx");
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Format timer display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Generate OTP
  const generateOTP = () => {
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(newOTP);
    return newOTP;
  };

  // Send OTP via EmailJS
  const sendOTP = async (otp) => {
    try {
      const templateParams = {
        to_email: signUpEmail,
        otp: otp,
      };

      await emailjs.send(
        'service_ezamccr',
        'template_jjhau4r',
        templateParams
      );

      setAlert({
        show: true,
        message: 'OTP sent successfully!',
        type: 'success',
      });
    }
    catch(error) {
      console.error('Failed to send OTP:', error);
      setAlert({
        show: true,
        message: 'Failed to send OTP. Please try again.',
        type: 'error'
      });
    }
  };

  // Initialize OTP on component mount
  useEffect(() => {
    const initialOTP = generateOTP();
    sendOTP(initialOTP);
  }, []);

  const handleOtpChange = (index, value) => {
    if(!/^\d*$/.test(value)) return; // Only allow digits
    if(value.length > 1) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    if(value && index < 5) {
      const nextInput = document.querySelector(`input[name=otp-${index + 1}]`);
      if(nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if(e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.querySelector(`input[name=otp-${index - 1}]`);
      if(prevInput) prevInput.focus();
    }
  };

  const handleResendOTP = async () => {
    const newOTP = generateOTP();
    await sendOTP(newOTP);
    setTimer(30);
    setIsResendDisabled(true);
    setOtpValues(['', '', '', '', '', '']);
  };

  const handleSubmit = () => {
    const enteredOTP = otpValues.join('');

    if(enteredOTP === generatedOTP) {
      setAlert({
        show: true,
        message: 'OTP verified successfully! Redirecting to registration...',
        type: 'success'
      });
      setTimeout(() => {
        navigate("/registration");
        showLogin();
      }, 3000);
    }
    else {
      setAlert({
        show: true,
        message: 'Invalid OTP. Please try again.',
        type: 'error'
      });
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (!/^\d+$/.test(pastedData)) return; // Only allow digits

    const pastedOTP = pastedData.slice(0, 6).split('');
    const newOtpValues = [...otpValues];

    pastedOTP.forEach((value, index) => {
      if (index < 6) {
        newOtpValues[index] = value;
      }
    });

    setOtpValues(newOtpValues);
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
      <ArrowBackIcon
        onClick={showSignUp}
        sx={{
          position: 'absolute',
          top: '1.5rem',
          left: '1.5rem',
        }}
      />
      <Typography variant="h4" sx={{mb: 4, color: 'primary.main'}}>
        OTP Verification
      </Typography>

      {alert.show && (
        <Alert
          severity={alert.type}
          sx={{mb: 1, width: '100%'}}
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      )}

      <Typography variant="body1" sx={{mb: 1, color: 'text.muted'}}>
        Enter the OTP sent to {signUpEmail}
      </Typography>

      <Box
        sx={{
          width: '100%',
          maxWidth: '400px',
          mb: 1,
          display: 'flex',
          gap: '8px',
          justifyContent: 'center'
        }}
      >
        {otpValues.map((value, index) => (
          <TextField
            key={index}
            name={`otp-${index}`}
            value={value}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            variant="outlined"
            inputProps={{
              maxLength: 1,
              style: {
                textAlign: 'center',
                fontSize: '1.5rem',
                padding: '8px',
                width: '40px',
                height: '40px',
              }
            }}
          />
        ))}
      </Box>

      <Typography variant="body1" sx={{mb: 2, color: 'text.muted'}}>
        Time remaining: {formatTime(timer)}
      </Typography>
      <Button variant="contained" sx={{mb: 1}} onClick={handleSubmit}>
        Verify
      </Button>
      <Button
        disabled={isResendDisabled}
        onClick={handleResendOTP}
        sx={{color: isResendDisabled ? 'text.disabled' : 'secondary.main'}}
      >
        Resend OTP
      </Button>
    </Box>
  );
};

export default VerifyOTP;
