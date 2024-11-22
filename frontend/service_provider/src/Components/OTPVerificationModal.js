import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, Dialog, DialogContent, 
  DialogTitle, TextField, Button 
} from "@mui/material";
import { CheckCircle } from 'lucide-react';
import { keyframes } from '@emotion/react';

const vibrate = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const scaleUp = keyframes`
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const OTPVerificationModal = ({ 
  open, 
  onClose, 
  onVerify, 
  client,
  updateStatus,
  maxTries = 3, 
  otpLength = 6,
}) => {
  const [otpValues, setOtpValues] = useState(Array(otpLength).fill(''));
  const [otpError, setOtpError] = useState(false);
  const [otpTries, setOtpTries] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if(!open) resetOTPState();
  }, [open]);

  const resetOTPState = () => {
    setOtpValues(Array(otpLength).fill(''));
    setOtpError(false);
    setOtpTries(1);
    setErrorMessage('');
    setIsSuccess(false);
  };

  const handleOtpChange = (index, value) => {
    if(!/^\d*$/.test(value)) return;
    if(value.length > 1) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    
    if(otpError) {
      setOtpError(false);
      setErrorMessage('');
    }

    if(value && index < otpLength - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if(e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    if(!/^\d+$/.test(pastedData)) return;

    const pastedOTP = pastedData.slice(0, otpLength).split('');
    const newOtpValues = [...otpValues];

    pastedOTP.forEach((value, index) => {
      if(index < otpLength) {
        newOtpValues[index] = value;
      }
    });

    setOtpValues(newOtpValues);
  };

  const handleOTPVerify = async () => {
    const otpValue = otpValues.join('');

    try {
      const isValid = await onVerify(otpValue);

      if(isValid) {
        setIsSuccess(true);
        setTimeout(async () => {
          await updateStatus();
          onClose();
          resetOTPState();
        }, 2000);
      } 
      else {
        setOtpError(true);
        if(otpTries === maxTries) {
          setErrorMessage('Maximum attempts reached. Try again later.');  
          setTimeout(() => {
            onClose();
            resetOTPState();
          }, 2000);
        }
        else {
          setErrorMessage(`Incorrect PIN. Attempt ${otpTries} of ${maxTries}`);
          setOtpTries(otpTries + 1);
        }
      }
    } 
    catch(err) {
      console.error('OTP Verification Error:', err);
      setErrorMessage('Verification failed. Please try again.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          textAlign: 'center',
          padding: '16px'
        }
      }}
    >
      {isSuccess ? (
        <Box 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            animation: `${scaleUp} 0.5s ease-out`
          }}
        >
          <CheckCircle 
            size={80} 
            color="green" 
            strokeWidth={1.5}
            style={{ marginBottom: '16px' }}
          />
          <Typography variant="h6" color="success.main">
            Verification Successful!
          </Typography>
        </Box>
      ) : (
        <>
          <DialogTitle sx={{ textAlign: 'center' }}>
            Enter {client}'s PIN
          </DialogTitle>
          <DialogContent 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: '8px',
                mb: 2,
                animation: otpError ? `${vibrate} 0.5s` : 'none'
              }}
            >
              {otpValues.map((value, index) => (
                <TextField
                  key={index}
                  inputRef={(el) => inputRefs.current[index] = el}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  variant="outlined"
                  error={otpError}
                  inputProps={{
                    maxLength: 1,
                    autoComplete: 'off',
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

            {errorMessage && (
              <Typography 
                color="error" 
                variant="body2" 
                sx={{ mb: 2, textAlign: 'center' }}
              >
                {errorMessage}
              </Typography>
            )}

            <Button 
              variant="contained"
              onClick={handleOTPVerify} 
              disabled={otpValues.some(value => value === '')}
              sx={{
                borderRadius: '20px',
                px: 4,
                textTransform: 'none'
              }}
            >
              Verify PIN
            </Button>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

export default OTPVerificationModal;
