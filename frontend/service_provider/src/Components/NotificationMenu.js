import React, { useState, useEffect, useRef } from 'react';
import { 
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { Notifications as NotificationsIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

const NotificationMenu = () => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const websocket = useRef(null);
  const reconnectTimeout = useRef(null);
  
  const userId = localStorage.getItem('providerId') || localStorage.getItem('userId');

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

  // Rest of the component remains the same...
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          marginRight: 1,
          color: wsConnected ? 'secondary.main' : 'error.main'
        }}
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
          style: {
            maxHeight: 300,
            width: '300px',
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
        {!wsConnected && (
          <MenuItem>
            <Typography color="error">Connection lost. Reconnecting...</Typography>
          </MenuItem>
        )}
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography>No new notifications</Typography>
          </MenuItem>
        ) : (
          <List>
            {notifications.map((notification) => (
              <ListItem key={notification.id} divider>
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.created_at).toLocaleString()}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleDismiss(notification.id)}
                  >
                    <CloseIcon />
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