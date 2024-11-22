import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Menu, MenuItem, Avatar, Tooltip, IconButton, 
  Divider, ListItemIcon, Button, Alert, CircularProgress, 
  Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, TextField
} from "@mui/material";
import { 
  AccountCircle, EventNote, Logout, LocationOn, Call 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle } from 'lucide-react';
import { keyframes } from '@emotion/react';
import ChatModal from './ChatModal';

const vibrate = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const OrderCard = ({ order, client, services, updateStatus, isNewOrder }) => {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [otpDialogOpen, setOTPDialogOpen] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [otpTries, setOtpTries] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const MAX_OTP_TRIES = 3;
  const [chatOpen, setChatOpen] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degree) => degree * (Math.PI / 180);
    
    lat1 = toRadians(parseFloat(lat1));
    lon1 = toRadians(parseFloat(lon1));
    lat2 = toRadians(parseFloat(lat2));
    lon2 = toRadians(parseFloat(lon2));

    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;
    
    const a = Math.sin(dlat/2) * Math.sin(dlat/2) + 
              Math.cos(lat1) * Math.cos(lat2) * 
              Math.sin(dlon/2) * Math.sin(dlon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const r = 6371; // Radius of earth in kilometers
    
    return (c * r).toFixed(1);
  };

  const handleRejectConfirm = () => {
    updateStatus(order.id, "rejected");
    setRejectDialogOpen(false);
  };

  const handleOtpChange = (index, value) => {
    if(!/^\d*$/.test(value)) return;
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

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (!/^\d+$/.test(pastedData)) return;

    const pastedOTP = pastedData.slice(0, 6).split('');
    const newOtpValues = [...otpValues];

    pastedOTP.forEach((value, index) => {
      if (index < 6) {
        newOtpValues[index] = value;
      }
    });

    setOtpValues(newOtpValues);
  };

  const handleOTPVerify = async () => {
    try {
      const otpValue = otpValues.join('');
      const expectedOTP = order.otp;

      if (otpValue === expectedOTP) {
        await updateStatus(order.id, "completed");
        setAlert({
          show: true,
          message: 'Order completed successfully!',
          type: 'success'
        });
        setTimeout(() => {
          setOTPDialogOpen(false);
          resetOTPState();
        }, 2000);
      } else {
        setOtpError(true);
        setOtpTries((prevTries) => {
          const newTries = prevTries + 1;
          if (newTries >= MAX_OTP_TRIES) {
            setAlert({
              show: true,
              message: 'Maximum OTP attempts reached. Please try again later.',
              type: 'error'
            });
            setOTPDialogOpen(false);
            resetOTPState();
          }
          return newTries;
        });
        setAlert({
          show: true,
          message: 'Invalid OTP. Please try again.',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Failed to verify OTP:', err);
    }
  };

  const resetOTPState = () => {
    setOtpValues(['', '', '', '', '', '']);
    setOtpError(false);
    setOtpTries(0);
  };

  return (
    <>
      <Box 
        sx={{
          p: 2,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.5s ease-in-out',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2 
        }}>
          <Box>
            <Typography variant="h6" color="primary.main" sx={{ textTransform: 'uppercase' }}>
              Order {order.id.slice(0, 8)}
            </Typography>
            <Typography variant="body2">
              Scheduled for: {formatDate(order.scheduled_on)}
            </Typography>
          </Box>
          <Typography
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: 2,
              fontSize: '0.875rem',
            }}
          >
            ₹ {order.total_price}
          </Typography>
        </Box>

        <Divider sx={{ my: 2, borderColor: 'text.disabled' }} />

        <Box>
          <Typography variant="subtitle1" color="primary.main" sx={{ mb: 1 }}>
            Order placed by {client.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Call sx={{ color: 'text.secondary', fontSize: 'small' }} />
            <Typography variant="body2">{client.mobile_number}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationOn sx={{ color: 'text.secondary', fontSize: 'small' }} />
            <Typography variant="body2">{client.full_address}</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" fontSize='0.9rem'>
            Distance: {haversineDistance(
              parseFloat(client.latitude), parseFloat(client.longitude),
              parseFloat(JSON.parse(localStorage.getItem("userLocation")).latitude),
              parseFloat((JSON.parse(localStorage.getItem("userLocation")).longitude))
            )} KM
          </Typography>
        </Box>

        <Divider sx={{ my: 2, borderColor: 'text.disabled' }} />

        <Typography variant="subtitle1" color="primary.main">
          Services Requested:
        </Typography>
        {order.items.map((item) => (
          <Typography key={item.id} variant="body2" sx={{ pl: 1 }}>
          • {services[item.provider_service]?.sub_service.name || 'Loading...'}
          </Typography>
        ))}

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 2 
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start'
          }}>
            {!isNewOrder && 
              <Button
                variant="contained"
                onClick={() => setChatOpen(true)}
                sx={{
                  height: "2rem",
                  padding: "0 15px",
                  borderRadius: "15px",
                  bgcolor: 'success.main',
                  '&:hover': {
                    bgcolor: 'success.dark',
                  },
                }}
              >
                Chat
              </Button>
            }
          </Box>
          <Box sx={{
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'flex-end', 
            gap: 1, 
          }}>
            {isNewOrder ? (
              <Button
                variant="contained"
                onClick={() => updateStatus(order.id, "accepted")}
                sx={{
                  height: "2rem",
                  padding: "0 15px",
                  borderRadius: "15px",
                  bgcolor: 'success.main',
                  '&:hover': {
                    bgcolor: 'success.dark',
                  },
                }}
              >
                Accept
              </Button>
            ): (
              <Button
                variant="contained"
                onClick={() => setOTPDialogOpen(true)}
                sx={{
                  height: "2rem",
                  padding: "0 15px",
                  borderRadius: "15px",
                  bgcolor: 'success.main',
                  '&:hover': {
                    bgcolor: 'success.dark',
                  },
                }}
              >
                Mark as completed
              </Button>
            )}
            <Button
              variant="contained"
              onClick={() => setRejectDialogOpen(true)}
              sx={{
                height: "2rem",
                padding: "0 15px",
                borderRadius: "15px",
                bgcolor: 'error.main',
                '&:hover': {
                  bgcolor: 'error.dark',
                },
              }}
            >
              Reject
            </Button>
          </Box>
          
        </Box>
      </Box>

      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
      >
        <DialogTitle>Order Rejection</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject this order?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRejectConfirm} color="error" autoFocus>
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={otpDialogOpen}
        onClose={() => setOTPDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>OTP Verification</DialogTitle>
        <DialogContent>
          {alert.show && (
            <Alert
              severity={alert.type}
              sx={{mb: 2, width: '100%'}}
              onClose={() => setAlert({ ...alert, show: false })}
            >
              {alert.message}
            </Alert>
          )}

          <DialogContentText sx={{mb: 2}}>
            Enter the OTP to complete the order
          </DialogContentText>

          <Box
            sx={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              mb: 2,
              animation: otpError ? `${vibrate} 0.5s` : 'none'
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
                error={otpError}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOTPDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleOTPVerify} 
            color="primary" 
            disabled={otpValues.some(value => value === '')}
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>

      <ChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        providerId={localStorage.getItem("providerId")} // Adjust based on how you store provider ID
        clientId={client.id}
        clientName={client.name}
      />
    </>
  );
};

const MainPage = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userName, setUserName] = useState('');
  const [location, setLocation] = useState(null);
  const [newOrders, setNewOrders] = useState([]);
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [clients, setClients] = useState({});
  const [services, setServices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const open = Boolean(anchorEl);

  useEffect(() => {
    const name = localStorage.getItem('providerName');
    if(name) setUserName(name);

    const storedLocation = localStorage.getItem('userLocation');
    if(storedLocation) {
      const locationData = JSON.parse(storedLocation);
      setLocation(locationData);
    }

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const providerId = localStorage.getItem('providerId');
      const response = await axios.get(`http://127.0.0.1:8000/orders/?provider_id=${providerId}`);
      
      const pending = [];
      const accepted = [];
      
      for(const order of response.data) {
        if(order.status === 'pending') pending.push(order);
        else if(order.status === 'accepted') {
          const scheduledDate = new Date(order.scheduled_on);
          if(scheduledDate > new Date()) accepted.push(order);
        }
      }

      setNewOrders(pending);
      setUpcomingOrders(accepted);

      // Fetch client and service details
      await Promise.all([
        ...pending.map(order => fetchClientDetails(order.user)),
        ...accepted.map(order => fetchClientDetails(order.user)),
        ...pending.map(order => fetchServiceDetails(order.provider)),
        ...accepted.map(order => fetchServiceDetails(order.provider))
      ]);

      setLoading(false);
    } 
    catch(err) {
      setError('Failed to fetch orders');
      setLoading(false);
    }
  };

  const fetchClientDetails = async (clientId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/client/${clientId}/`);
      setClients(prev => ({ ...prev, [clientId]: response.data }));
    } 
    catch(err) {
      console.error('Failed to fetch client details:', err);
    }
  };

  const fetchServiceDetails = async (providerId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/service_providers/${providerId}/`);
      const serviceMap = {};
      response.data.provider_services.forEach(service => {
        serviceMap[service.id] = service;
      });
      setServices(prev => ({ ...prev, ...serviceMap }));
    } 
    catch (err) {
      console.error('Failed to fetch service details:', err);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/orders/${orderId}/status/`,
        { status }
      );

      if(response.status === 200) {
        // Show success message
        setError(null);
        // Refresh orders list
        await fetchOrders();
      }
    } catch (err) {
      setError(`Failed to update ${status} status: ` + (err.response?.data?.message || err.message));
    }
  };

  const getFormattedLocation = () => {
    if (!location?.address) return 'Location not available';
    const addressParts = location.address.split(',');
    
    // Take last 2-3 parts of the address (usually city and state)
    // Log addressParts to see what to display
    return [addressParts[2], addressParts[5]].join(', ').trim();
  };

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

  const Section = ({sectionName, orders, newOrder}) => {
    return (
      <Box
        sx={{
          flex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        }}
      >
        <Box 
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            p: 2,
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="h6" color="primary.dark">
            {sectionName}
          </Typography>
        </Box>
        
        <Box 
          sx={{
            maxHeight: 'calc(100vh - 400px)',
            overflowY: 'scroll',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(0, 0, 0, 0.3)',
            },
          }}
        >
          {
            orders.length === 0 ? (
              <Alert severity="info" sx={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                {`No ${sectionName.toLowerCase()} available`}
              </Alert>
            ) : (
              orders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    client={clients[order.user]}
                    services={services}
                    updateStatus={handleUpdateStatus}
                    isNewOrder={newOrder}
                  />
              ))
            )
          }
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          width: '100%',
          background: `linear-gradient(135deg, rgba(100, 149, 237, 0.1), rgba(255, 105, 180, 0.1))`,
        }}
      >
        {/* Header */}
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
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                color: 'background.paper',
                borderRadius: '1.5rem',
                bgcolor: 'secondary.main',
                padding: '0.5rem',
              }}>
                <LocationOn sx={{ fontSize: '1.2rem' }} />
                <Typography sx={{ fontSize: '1rem' }}>
                  {getFormattedLocation()}
                </Typography>
              </Box>
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

        {/* Body */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            pt: '120px',
            px: 3,
            pb: 3,
            mb: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ color: 'primary.main', }}>
            Welcome, {userName.split(' ')[0]}!!
          </Typography>
          <Typography color="text.secondary">
            Manage your orders and stay updated with your schedule
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexDirection: { xs: 'column', md: 'row' },
              pl: 3,
              pr: 3,
              mb: { xs: '25px' },
            }}
          >
            {/* New Orders Card */}
            <Section 
              key="1" 
              sectionName="New Orders"
              orders={newOrders}
              newOrder={true}
            />

            {/* Upcoming Orders Card */}
            <Section 
              key="2"
              sectionName="Upcoming Orders"
              orders={upcomingOrders}
              newOrder={false}
            />
          </Box>
        )}

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