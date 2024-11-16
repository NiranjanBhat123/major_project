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
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import AuthModal from './AuthModal';

import { useWelcomeViewContext } from "../Contexts/WelcomeViewContextProvider";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

  return (
    <>
      <AppBar position={isScrolled ? 'fixed' : 'static'} color="primary" elevation={isScrolled ? 4 : 0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            FixNGo
          </Typography>
          <Box display="flex" alignItems="center">
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
                marginRight: 2,
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
                  <MenuItem 
                  onClick={() => {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    handleLogout();
                    }}
                  >Logout</MenuItem>
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