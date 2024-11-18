import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  IconButton, 
  Box, 
  TextField,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Fade,
  Chip,
  Typography
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HandymanIcon from '@mui/icons-material/Handyman'; // Added repair icon
import AuthModal from './AuthModal';
import { useWelcomeViewContext } from "../Contexts/WelcomeViewContextProvider";
// Remove Logo import since we're not using it

const StyledAppBar = styled(AppBar)(({ theme, isscrolled }) => ({
  backgroundColor: theme.palette.common.white,
  transition: 'all 0.3s ease',
  boxShadow: isscrolled === 'true' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
  borderBottom: '1px solid',
  borderColor: alpha(theme.palette.grey[300], 0.8),
}));

const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginRight: '32px',
  cursor: 'pointer',
});

const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: 'Righteous, cursive', // Using Righteous font for a stylish look
  fontSize: '2rem',
  fontWeight: 'bold',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '& .icon': {
    color: theme.palette.primary.main,
    fontSize: '1.8rem',
    transform: 'rotate(-15deg)',
  },
  '& .highlight': {
    color: theme.palette.primary.main,
  },
}));

const SearchTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: alpha(theme.palette.grey[100], 0.8),
    borderRadius: '8px',
    width: '400px',
    transition: theme.transitions.create(['background-color', 'box-shadow']),
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.grey[100], 1),
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.common.white,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
      '& fieldset': {
        borderColor: theme.palette.primary.main,
      },
    },
  },
}));

const LocationChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.grey[100], 0.8),
  '&:hover': {
    backgroundColor: alpha(theme.palette.grey[200], 0.8),
  },
  height: '40px',
  padding: '0 8px',
  '& .MuiChip-icon': {
    color: theme.palette.grey[600],
  },
  '& .MuiChip-label': {
    color: theme.palette.grey[700],
    fontWeight: 500,
  },
}));

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationAnchorEl, setLocationAnchorEl] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Load user data and location
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }

    const userLocation = localStorage.getItem('userLocation');
    if (userLocation) {
      try {
        const parsedLocation = JSON.parse(userLocation);
        setLocation(parsedLocation);
      } catch (error) {
        console.error('Error parsing location:', error);
      }
    }
  }, []);

  const formatAddress = (address) => {
    if (!address) return '';
    const parts = address.split(',');
    return parts.slice(0, 2).join(',');
  };

  const { 
    isAuthModalOpen, 
    handleCloseAuthModal, 
    handleOpenAuthModal, 
    isLoggedIn,
    handleLogout,
  } = useWelcomeViewContext();

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLocationClick = (event) => {
    setLocationAnchorEl(event.currentTarget);
  };

  const handleLocationMenuClose = () => {
    setLocationAnchorEl(null);
  };

  return (
    <>
      <StyledAppBar 
        position="sticky" 
        isscrolled={isScrolled.toString()}
        elevation={0}
      >
        <Toolbar sx={{ py: 1.5, gap: 2 }}>
        <LogoContainer>
            <LogoText variant="h1">
              <HandymanIcon className="icon" />
              FixNGo
            </LogoText>
          </LogoContainer>


          {location && (
            <Tooltip title="Click to view full address" arrow placement="bottom">
              <LocationChip
                icon={<LocationOnIcon />}
                label={formatAddress(location.address)}
                onClick={handleLocationClick}
                clickable
              />
            </Tooltip>
          )}

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <SearchTextField
              size="small"
              placeholder="Search for services..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'grey.500', mr: 1 }} />,
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isLoggedIn ? (
              <>
                <IconButton color="primary" sx={{ backgroundColor: alpha('#000', 0.04) }}>
                  <ShoppingCartIcon />
                </IconButton>
                <IconButton 
                  onClick={handleProfileClick}
                  sx={{ 
                    p: 0.5,
                    backgroundColor: alpha('#000', 0.04),
                    '&:hover': {
                      backgroundColor: alpha('#000', 0.08),
                    }
                  }}
                >
                  <Avatar sx={{ 
                    bgcolor: 'primary.main',
                    width: 32,
                    height: 32
                  }}>
                    {userName?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  onClick={handleMenuClose}
                  PaperProps={{
                    elevation: 2,
                    sx: {
                      mt: 1.5,
                      minWidth: 180,
                      borderRadius: '8px',
                      backgroundColor: 'common.white',
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem sx={{ py: 1.5 }}>
                    <PersonIcon sx={{ mr: 2, color: 'grey.600' }} /> Profile
                  </MenuItem>
                  <MenuItem sx={{ py: 1.5 }}>
                    <ReceiptIcon sx={{ mr: 2, color: 'grey.600' }} /> My Orders
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                    <LoginIcon sx={{ mr: 2 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<LoginIcon />} 
                onClick={handleOpenAuthModal}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </StyledAppBar>

      <Menu
        anchorEl={locationAnchorEl}
        open={Boolean(locationAnchorEl)}
        onClose={handleLocationMenuClose}
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 2,
          sx: {
            maxWidth: '400px',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'Poppins, sans-serif', // Add this line to set Poppins as default
          },
        }}
      >
        <Box sx={{ p: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            color: 'grey.700',
            mb: 1,
            fontFamily: 'Poppins, sans-serif' // Add this line
          }}>
            <LocationOnIcon color="primary" fontSize="small" />
            Current Location
          </Box>
          <Box sx={{ 
            color: 'grey.800', 
            fontWeight: 500,
            fontFamily: 'Poppins, sans-serif' // Add this line
          }}>
            {location?.address}
          </Box>
          <Box sx={{ 
            mt: 2,
            pt: 2,
            borderTop: 1,
            borderColor: 'grey.200',
            color: 'grey.600',
            fontSize: '0.75rem',
            fontFamily: 'Poppins, sans-serif' // Add this line
          }}>
            Last updated: {new Date(location?.timestamp).toLocaleString()}
          </Box>
        </Box>
      </Menu>

      <AuthModal open={isAuthModalOpen} onClose={handleCloseAuthModal} />
    </>
  );
};

export default Navbar;