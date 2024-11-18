import React, { useState, useEffect } from 'react';
import { Box, Typography, Menu, MenuItem, Avatar, Tooltip, IconButton, Divider, ListItemIcon } from "@mui/material";
import { AccountCircle, EventNote, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userName, setUserName] = useState('');
  const open = Boolean(anchorEl);

  useEffect(() => {
    const name = localStorage.getItem('providerName');
    if(name) setUserName(name);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('providerId');
    localStorage.removeItem('providerName');
    localStorage.removeItem('providerEmail');
    navigate('/');
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
              gap: 1,
            }}>
              <Typography
                sx={{
                  color: 'text.muted',
                  fontSize: '1.2rem',
                }}
              >
                Hi, {userName}
              </Typography>
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleClick}
                  size="small"
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: 'secondary.main',
                      color: 'background.paper',
                    }}
                  >
                    {userName.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                bgcolor: 'background.paper',
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem>
            <ListItemIcon>
              <AccountCircle fontSize="small" sx={{ color: 'text.muted' }} />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <EventNote fontSize="small" sx={{ color: 'text.muted' }} />
            </ListItemIcon>
            Orders
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" sx={{ color: 'text.muted' }} />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </>
  );
};

export default MainPage;
