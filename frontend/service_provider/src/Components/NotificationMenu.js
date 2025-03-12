import React, { useState, useEffect, useRef } from 'react';
import { 
  Badge,
  IconButton,
  Menu,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Avatar,
  Tooltip
} from '@mui/material';
import { 
  Notifications as NotificationsIcon, 
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import axios from 'axios';

const NotificationMenu = () => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const websocket = useRef(null);
  const reconnectTimeout = useRef(null);
  
  // Get the provider's user ID from localStorage
  const userId = localStorage.getItem('providerId') || localStorage.getItem('userId');

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'new_order':
        return <ShoppingCartIcon sx={{ color: '#fff' }} />;
      case 'order_cancelled':
        return <CancelIcon sx={{ color: '#fff' }} />;
      case 'order_completed':
        return <CheckCircleIcon sx={{ color: '#fff' }} />;
      case 'payment_received':
        return <InfoIcon sx={{ color: '#fff' }} />;
      default:
        return <NotificationsIcon sx={{ color: '#fff' }} />;
    }
  };

  const getNotificationBgColor = (type) => {
    switch(type) {
      case 'new_order':
        return '#ff9800'; // Orange
      case 'order_cancelled':
        return '#f44336'; // Red
      case 'order_completed':
        return '#4caf50'; // Green
      case 'payment_received':
        return '#2196f3'; // Blue
      default:
        return '#9e9e9e'; // Grey
    }
  };

  const connectWebSocket = () => {
    if (!userId) return;

    const wsUrl = `ws://127.0.0.1:8000/ws/notifications/${userId}/`;
    console.log('Connecting to WebSocket:', wsUrl);
    
    websocket.current = new WebSocket(wsUrl);

    websocket.current.onopen = () => {
      console.log('WebSocket connected successfully');
      setWsConnected(true);
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
    };

    websocket.current.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        console.log('Parsed WebSocket data:', data);
        
        // Handle connection message
        if (data.type === 'connection_established') {
          console.log('WebSocket connection verified');
          return;
        }
        
        // Handle notification
        setNotifications(prev => {
          const exists = prev.some(n => n.id === data.id);
          if (exists) {
            console.log('Duplicate notification ignored:', data.id);
            return prev;
          }
          console.log('Adding new notification to state:', data);
          return [data, ...prev].slice(0, 5);
        });
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        console.error('Raw message:', event.data);
      }
    };

    websocket.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsConnected(false);
    };

    websocket.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setWsConnected(false);
      
      reconnectTimeout.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connectWebSocket();
      }, 3000);
    };
  };

  useEffect(() => {
    const fetchInitialNotifications = async () => {
      if (!userId) return;
      
      try {
        console.log('Fetching initial notifications for user:', userId);
        const response = await axios.get(`http://localhost:8000/notifications?user_id=${userId}`);
        console.log('Initial notifications received:', response.data);
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchInitialNotifications();
    connectWebSocket();

    return () => {
      console.log('Cleaning up WebSocket connection');
      if (websocket.current) {
        websocket.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [userId]);

  const handleDismiss = async (notificationId) => {
    try {
      // Try WebSocket first
      if (wsConnected && websocket.current) {
        websocket.current.send(JSON.stringify({
          type: 'mark_read',
          notification_id: notificationId
        }));
        
        // Update local state immediately for better UX
        setNotifications(prevNotifications => 
          prevNotifications.filter(n => n.id !== notificationId)
        );
      } else {
        // Fallback to HTTP if WebSocket isn't connected
        console.log('WebSocket not connected, using HTTP fallback');
        await axios.put(`http://localhost:8000/notifications/${notificationId}/`);
        
        // Update local state after successful HTTP request
        setNotifications(prevNotifications => 
          prevNotifications.filter(n => n.id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOrderClick = (orderId) => {
    // Navigate to order details page
    window.location.href = `/orders/${orderId}`;
    handleClose();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
      >
        <Badge 
          badgeContent={notifications.length} 
          color="error"
          max={99}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            maxHeight: 350,
            width: '380px',
            overflow: 'visible',
            mt: 1.5,
            borderRadius: 2,
            '&:before': {
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
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
        </Box>
        
        {!wsConnected && (
          <Paper elevation={0} sx={{ 
            m: 2, 
            p: 1.5, 
            backgroundColor: 'rgba(244, 67, 54, 0.1)', 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            <Box sx={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              backgroundColor: '#f44336',
              mr: 1.5
            }}/>
            <Typography variant="body2">Connection lost. Reconnecting...</Typography>
          </Paper>
        )}
        
        {notifications.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
            <Typography color="text.secondary">No new notifications</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem 
                key={notification.id}
                sx={{ 
                  px: 2,
                  py: 1.5,
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  cursor: notification.order_id ? 'pointer' : 'default',
                  '&:hover': {
                    backgroundColor: notification.order_id ? 'rgba(0,0,0,0.04)' : 'transparent',
                  }
                }}
                onClick={notification.order_id ? () => handleOrderClick(notification.order_id) : null}
              >
                <Avatar 
                  sx={{ 
                    mr: 2,
                    bgcolor: getNotificationBgColor(notification.notification_type),
                    width: 40,
                    height: 40
                  }}
                >
                  {getNotificationIcon(notification.notification_type)}
                </Avatar>
                
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                      {notification.message}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(notification.created_at)}
                    </Typography>
                  }
                />
                
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss(notification.id);
                    }}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.05)',
                      }
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationMenu;