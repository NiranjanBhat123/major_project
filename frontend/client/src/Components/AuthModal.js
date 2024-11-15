// import React, { useState } from 'react';
// import {
//   Modal,
//   Box,
//   Typography,
//   TextField,
//   Button,
//   IconButton,
// } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';

// const AuthModal = ({ open, onClose }) => {
//   const [isSignup, setIsSignup] = useState(false);

//   const handleToggleForm = () => {
//     setIsSignup((prevState) => !prevState);
//   };

//   return (
//     <Modal
//       open={open}
//       onClose={onClose}
//       sx={{
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//       }}
//     >
//       <Box
//         sx={{
//           backgroundColor: 'background.paper',
//           borderRadius: 2,
//           boxShadow: 24,
//           p: 3, // Reduced padding
//           width: '320px', // Fixed smaller width
//           maxHeight: '400px', // Added max height
//           margin: '20px', // Added margin to ensure it doesn't touch screen edges on mobile
//         }}
//       >
//         <Box display="flex" justifyContent="space-between" alignItems="center">
//           <Typography variant="h6"> {/* Reduced from h5 to h6 */}
//             {isSignup ? 'Sign Up' : 'Log In'}
//           </Typography>
//           <IconButton 
//             onClick={onClose}
//             size="small" // Made icon button smaller
//           >
//             <CloseIcon fontSize="small" /> {/* Made close icon smaller */}
//           </IconButton>
//         </Box>
//         <Box mt={2}>
//           <TextField 
//             label="Email" 
//             variant="outlined" 
//             fullWidth
//             size="small" // Made textfield smaller
//             margin="dense" // Reduced margin
//           />
//           <TextField
//             label="Password"
//             type="password"
//             variant="outlined"
//             fullWidth
//             size="small" // Made textfield smaller
//             margin="dense" // Reduced margin
//             sx={{ mt: 1 }} // Reduced top margin
//           />
//           {isSignup && (
//             <TextField
//               label="Confirm Password"
//               type="password"
//               variant="outlined"
//               fullWidth
//               size="small" // Made textfield smaller
//               margin="dense" // Reduced margin
//               sx={{ mt: 1 }} // Reduced top margin
//             />
//           )}
//           <Button
//             variant="contained"
//             color="primary"
//             fullWidth
//             sx={{ mt: 2, py: 1 }} // Adjusted padding
//           >
//             {isSignup ? 'Sign Up' : 'Log In'}
//           </Button>
//           <Button
//             variant="text"
//             color="primary"
//             fullWidth
//             onClick={handleToggleForm}
//             sx={{ mt: 1 }} // Reduced top margin
//           >
//             {isSignup
//               ? 'Already have an account? Log In'
//               : "Don't have an account? Sign Up"}
//           </Button>
//         </Box>
//       </Box>
//     </Modal>
//   );
// };

// export default AuthModal;


import React, { useState } from 'react';
import { useWelcomeViewContext } from "../Contexts/WelcomeViewContextProvider";
import WelcomeContent from "./WelcomeContent";
import SignUp from "./SignUp";
import Login from "./Login";
import VerifyOTP from "./VerifyOTP";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AuthModal = ({ open, onClose }) => {
  const [isSignup, setIsSignup] = useState(false);

  const handleToggleForm = () => {
    setIsSignup((prevState) => !prevState);
  };

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
      <Box className="welcome" data-view={view}
      sx={{
        position: 'relative',
        width: '60%',
        height: '70%',
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
    </Modal>
  );
};

export default AuthModal;