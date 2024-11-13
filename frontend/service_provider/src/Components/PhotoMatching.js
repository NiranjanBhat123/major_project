import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { Camera, Cameraswitch } from '@mui/icons-material';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const PhotoMatching = ({ formData, setCurrentStep }) => {
  const [cameraStream, setCameraStream] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup: stop camera stream when component unmounts
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      videoRef.current.srcObject = stream;
      setCameraStream(stream);
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to data URL
    const photoData = canvas.toDataURL('image/jpeg');
    setCapturedPhoto(photoData);

    // Stop the camera stream
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate API call
    setTimeout(() => {
      setIsVerifying(false);
      // Handle verification result here
    }, 2000);
  };

  const getMiddleButtonProps = () => {
    if (!cameraStream && !capturedPhoto) {
      return {
        onClick: startCamera,
        children: 'Allow Camera Access',
        startIcon: <Camera />
      };
    }
    if (cameraStream && !capturedPhoto) {
      return {
        onClick: capturePhoto,
        children: 'Capture Photo',
        startIcon: <Camera />
      };
    }
    return {
      onClick: retakePhoto,
      children: 'Retake Photo',
      startIcon: <Cameraswitch />
    };
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        variant="h5"
        sx={{
          color: 'text.primary',
          mb: 2,
          fontSize: '1.5rem',
          fontWeight: 300,
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
        }}
      >
        Photo Verification
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: capturedPhoto ? '1fr 1fr' : '1fr',
        gap: 2,
        mb: 3
      }}>
        {/* Submitted Photo */}
        {capturedPhoto && (
          <Box sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
            aspectRatio: '4/3',
          }}>
            <img
              src={formData.photo ? URL.createObjectURL(formData.photo) : ''}
              alt="Submitted"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>
        )}

        {/* Camera/Captured Photo */}
        <Box sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          aspectRatio: capturedPhoto? '4/3': '16/9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'action.hover'
        }}>
          {!cameraStream && !capturedPhoto && (
            <Typography color="text.secondary">
              Enable camera access
            </Typography>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: cameraStream && !capturedPhoto ? 'block' : 'none'
            }}
          />
          {capturedPhoto && (
            <img
              src={capturedPhoto}
              alt="Captured"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          )}
        </Box>
      </Box>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        mt: 3,
      }}>
        <ArrowBackIcon
          onClick={() => setCurrentStep('1')}
        />

        <Button
          variant="contained"
          {...getMiddleButtonProps()}
        />

        <Button
          variant="contained"
          color="success"
          onClick={handleVerify}
          disabled={!capturedPhoto || isVerifying}
          sx={{ minWidth: 120 }}
        >
          {isVerifying ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Verify'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default PhotoMatching;
