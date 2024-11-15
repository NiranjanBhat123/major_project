// import React, { useState, useRef, useEffect } from 'react';
// import { Box, Button, CircularProgress, Typography, Alert } from '@mui/material';
// import { Camera, Cameraswitch } from '@mui/icons-material';
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import axios from 'axios';

// const PhotoMatching = ({ formData, setCurrentStep }) => {
//   const [cameraStream, setCameraStream] = useState(null);
//   const [isVerifying, setIsVerifying] = useState(false);
//   const [capturedPhoto, setCapturedPhoto] = useState(null);
//   const [verificationResult, setVerificationResult] = useState(null);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     return () => {
//       // Cleanup: stop camera stream when component unmounts
//       if (cameraStream) {
//         cameraStream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, [cameraStream]);

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: 'user' }
//       });
//       videoRef.current.srcObject = stream;
//       setCameraStream(stream);
//     } catch (err) {
//       console.error('Error accessing camera:', err);
//     }
//   };

//   const capturePhoto = () => {
//     if (!videoRef.current) return;

//     const canvas = canvasRef.current;
//     const video = videoRef.current;
//     const context = canvas.getContext('2d');

//     // Set canvas dimensions to match video
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     // Draw the video frame to canvas
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     // Convert canvas to data URL
//     const photoData = canvas.toDataURL('image/jpeg');
//     setCapturedPhoto(photoData);

//     // Stop the camera stream
//     if (cameraStream) {
//       cameraStream.getTracks().forEach(track => track.stop());
//       setCameraStream(null);
//     }
//   };

//   const retakePhoto = () => {
//     setCapturedPhoto(null);
//     setVerificationResult(null);  // Clear the verification result when retaking photo
//     startCamera();
//   };

//   const dataURLtoBlob = (dataurl) => {
//     const arr = dataurl.split(',');
//     const mime = arr[0].match(/:(.*?);/)[1];
//     const bstr = atob(arr[1]);
//     let n = bstr.length;
//     const u8arr = new Uint8Array(n);
//     while (n--) {
//       u8arr[n] = bstr.charCodeAt(n);
//     }
//     return new Blob([u8arr], { type: mime });
//   };

//   const handleVerify = async () => {
//     setIsVerifying(true);
    
//     try {
//       // Create form data
//       const formDataToSend = new FormData();
      
//       // Convert captured photo data URL to blob and append
//       const capturedPhotoBlob = dataURLtoBlob(capturedPhoto);
//       formDataToSend.append('image1', formData.photo);
//       formDataToSend.append('image2', capturedPhotoBlob);

//       // Make API call using axios
//       const response = await axios.post(
//         'http://127.0.0.1:8000/service_providers/verify/',
//         formDataToSend,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data'
//           }
//         }
//       );
      
//       setVerificationResult(response.data);
      
//     } catch (error) {
//       console.error('Verification error:', error);
//       setVerificationResult({
//         success: false,
//         error: 'Failed to verify photos. Please try again.'
//       });
//     } finally {
//       setIsVerifying(false);
//     }
//   };

//   const getAlertContent = () => {
//     if (!verificationResult) return null;
    
//     if (!verificationResult.success) {
//       return {
//         severity: 'error',
//         message: verificationResult.error || 'Verification failed. Please try again.'
//       };
//     }

//     return {
//       severity: 'success',
//       message: verificationResult.matched ? 'Photos matched!' : 'Photos did not match.'
//     };
//   };

//   const getMiddleButtonProps = () => {
//     if (!cameraStream && !capturedPhoto) {
//       return {
//         onClick: startCamera,
//         children: 'Allow Camera Access',
//         startIcon: <Camera />
//       };
//     }
//     if (cameraStream && !capturedPhoto) {
//       return {
//         onClick: capturePhoto,
//         children: 'Capture Photo',
//         startIcon: <Camera />
//       };
//     }
//     return {
//       onClick: retakePhoto,
//       children: 'Retake Photo',
//       startIcon: <Cameraswitch />
//     };
//   };

//   return (
//     <Box sx={{ width: '100%' }}>
//       <Typography
//         variant="h5"
//         sx={{
//           color: 'text.primary',
//           mb: 2,
//           fontSize: '1.5rem',
//           fontWeight: 300,
//           textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
//         }}
//       >
//         Photo Verification
//       </Typography>

//       <Box sx={{
//         display: 'grid',
//         gridTemplateColumns: capturedPhoto ? '1fr 1fr' : '1fr',
//         gap: 2,
//         mb: 3
//       }}>
//         {/* Submitted Photo */}
//         {capturedPhoto && (
//           <Box sx={{
//             border: '1px solid',
//             borderColor: 'divider',
//             borderRadius: 1,
//             overflow: 'hidden',
//             aspectRatio: '4/3',
//           }}>
//             <img
//               src={formData.photo ? URL.createObjectURL(formData.photo) : ''}
//               alt="Submitted"
//               style={{
//                 width: '100%',
//                 height: '100%',
//                 objectFit: 'cover'
//               }}
//             />
//           </Box>
//         )}

//         {/* Camera/Captured Photo */}
//         <Box sx={{
//           border: '1px solid',
//           borderColor: 'divider',
//           borderRadius: 1,
//           overflow: 'hidden',
//           aspectRatio: capturedPhoto? '4/3': '16/9',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           backgroundColor: 'action.hover'
//         }}>
//           {!cameraStream && !capturedPhoto && (
//             <Typography color="text.secondary">
//               Enable camera access
//             </Typography>
//           )}
//           <video
//             ref={videoRef}
//             autoPlay
//             playsInline
//             style={{
//               width: '100%',
//               height: '100%',
//               objectFit: 'cover',
//               display: cameraStream && !capturedPhoto ? 'block' : 'none'
//             }}
//           />
//           {capturedPhoto && (
//             <img
//               src={capturedPhoto}
//               alt="Captured"
//               style={{
//                 width: '100%',
//                 height: '100%',
//                 objectFit: 'cover'
//               }}
//             />
//           )}
//         </Box>
//       </Box>

//       {/* Verification Alert */}
//       {verificationResult && (
//         <Box sx={{ mb: 3 }}>
//           <Alert 
//             severity={getAlertContent().severity}
//             onClose={() => setVerificationResult(null)}
//           >
//             {getAlertContent().message}
//           </Alert>
//         </Box>
//       )}

//       <canvas ref={canvasRef} style={{ display: 'none' }} />

//       <Box sx={{
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         gap: 2,
//         mt: 3,
//       }}>
//         <ArrowBackIcon
//           onClick={() => setCurrentStep('1')}
//         />

//         <Button
//           variant="contained"
//           {...getMiddleButtonProps()}
//         />

//         <Button
//           variant="contained"
//           color="success"
//           onClick={handleVerify}
//           disabled={!capturedPhoto || isVerifying}
//           sx={{ minWidth: 120 }}
//         >
//           {isVerifying ? (
//             <>
//               <CircularProgress size={24} color="inherit" />
//               <Typography ml={1}>Verifying</Typography>
//             </>
//           ) : (
//             verificationResult?.matched ? 'Verified' : 'Verify'
//           )}
//         </Button>
//       </Box>
//     </Box>
//   );
// };

// export default PhotoMatching;
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography, Alert } from '@mui/material';
import { Camera, Cameraswitch } from '@mui/icons-material';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from 'axios';

const PhotoMatching = ({ formData, setCurrentStep }) => {
  const [cameraStream, setCameraStream] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const navigate = useNavigate();

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
    setVerificationResult(null);
    startCamera();
  };

  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    
    try {
      // Create form data
      const formDataToSend = new FormData();
      
      // Convert captured photo data URL to blob and append
      const capturedPhotoBlob = dataURLtoBlob(capturedPhoto);
      formDataToSend.append('image1', formData.photo);
      formDataToSend.append('image2', capturedPhotoBlob);

      // Make API call using axios
      const response = await axios.post(
        'http://127.0.0.1:8000/service_providers/verify/',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setVerificationResult(response.data);
    } 
    catch(error) {
      console.error('Verification error:', error);
      setVerificationResult({
        success: false,
        error: 'Failed to verify photos. Please try again.'
      });
    } 
    finally {
      setIsVerifying(false);
    }
  };

  const getAlertContent = () => {
    if(!verificationResult) return null;
    
    if(!verificationResult.success) {
      return {
        severity: 'error',
        message: verificationResult.error || 'Verification failed. Please try again.'
      };
    }

    return {
      severity: verificationResult.matched? 'success': 'error',
      message: verificationResult.matched ? 'Photos matched!' : 'Photos did not match.'
    };
  };

  const getMiddleButtonProps = () => {
    if(!cameraStream && !capturedPhoto) {
      return {
        onClick: startCamera,
        children: 'Allow Camera Access',
        startIcon: <Camera />
      };
    }
    if(cameraStream && !capturedPhoto) {
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

      {/* Verification Alert */}
      {verificationResult && (
        <Box sx={{ mb: 3 }}>
          <Alert 
            severity={getAlertContent().severity}
            onClose={() => setVerificationResult(null)}
          >
            {getAlertContent().message}
          </Alert>
        </Box>
      )}

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
          onClick={verificationResult?.matched? (() => navigate("/main")): handleVerify}
          disabled={!capturedPhoto || isVerifying}
          sx={{ minWidth: 120 }}
        >
          {isVerifying ? (
            <>
              <CircularProgress size={24} color="inherit" />
              <Typography ml={1}>Verifying</Typography>
            </>
          ) : (
            verificationResult?.matched? 'Next': 'Verify'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default PhotoMatching;
