import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  TextField,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Fade,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AuthModal from './AuthModal';
import { useWelcomeViewContext } from "../Contexts/WelcomeViewContextProvider";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationAnchorEl, setLocationAnchorEl] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Load and format location data
  useEffect(() => {
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
    // Return first 2 parts of the address for compact display
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
      <AppBar position={isScrolled ? 'fixed' : 'static'} color="primary" elevation={isScrolled ? 4 : 0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 0 }}>
            FixNGo
          </Typography>

          {isLoggedIn && location && (
            <Box sx={{ flexGrow: 0, ml: 3, display: 'flex', alignItems: 'center' }}>
              <Tooltip 
                title="Click to view full address"
                arrow
                placement="bottom"
              >
                <Chip
                  icon={<LocationOnIcon />}
                  label={formatAddress(location.address)}
                  onClick={handleLocationClick}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                    },
                    maxWidth: '250px',
                  }}
                />
              </Tooltip>
              <Menu
                anchorEl={locationAnchorEl}
                open={Boolean(locationAnchorEl)}
                onClose={handleLocationMenuClose}
                TransitionComponent={Fade}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    maxWidth: '400px',
                    padding: '16px',
                  },
                }}
              >
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Current Location
                  </Typography>
                  <Typography variant="body2">
                    {location?.address}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Last updated: {new Date(location?.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </Menu>
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search Services..."
              InputProps={{
                endAdornment: (
                  <IconButton color="primary">
                    <SearchIcon />
                  </IconButton>
                ),
              }}
              sx={{
                backgroundColor: (theme) => theme.palette.background.default,
                borderRadius: 1,
              }}
            />
            {isLoggedIn ? (
              <>
                <IconButton 
                  onClick={handleProfileClick}
                  sx={{ p: 0 }}
                >
                  <Avatar sx={{ 
                    bgcolor: 'secondary.main',
                    width: 35,
                    height: 35
                  }}>
                    <PersonIcon />
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  onClick={handleMenuClose}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem>Profile</MenuItem>
                  <MenuItem>My Orders</MenuItem>
                  <MenuItem>Settings</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Button 
                color="inherit" 
                startIcon={<LoginIcon />} 
                onClick={handleOpenAuthModal}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <AuthModal open={isAuthModalOpen} onClose={handleCloseAuthModal} />
    </>
  );
};

export default Navbar;