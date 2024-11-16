import React, { useState } from 'react';
import { Box, Typography, Menu, MenuItem } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const MainPage = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          background: `linear-gradient(135deg, ${theme => theme.palette.primary.light}22, ${theme => theme.palette.secondary.light}33)`,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            height: '70px',
            zIndex: 1100,
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
              width: '100%',
            }}
          >
            <Typography
              variant="title"
              sx={{
                color: 'secondary.main',
                fontSize: '2rem',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              FixNGo
            </Typography>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              gap: '4px',
              boxSizing: 'border-box',
            }}>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.muted',
                  fontSize: '1.2rem',
                }}
              >
                Hi, Srinidhi V
              </Typography>
              <AccountCircleIcon
                onClick={handleProfileClick}
                sx={{
                  fontSize: 30,
                  color: 'text.muted',
                  mb: 0.25,
                  cursor: 'pointer',
                  // '&:hover': {
                  //   transform: 'scale(1.1)',
                  // },
                }}
              />

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
                <MenuItem>Orders</MenuItem>
                <MenuItem>Logout</MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MainPage;
