import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Box,
  Typography,
  Paper,
  InputAdornment,
  Avatar
} from "@mui/material";
import { Send, X } from 'lucide-react';

const ChatModal = ({ open, onClose, providerId, clientId, clientName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [wsInstance, setWsInstance] = useState(null);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if(open) {
      const roomId = `${providerId}-${clientId}`;
      const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomId}/`);
      
      ws.onopen = () => {
        console.log('Connected to chat server');
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, {
          text: data.message,
          sender: data.sender,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      };
      
      ws.onclose = () => {
        console.log('Disconnected from chat server');
      };
      
      setWsInstance(ws);
      
      return () => {
        ws.close();
      };
    }
  }, [open, providerId, clientId]);

  const handleSendMessage = () => {
    if(newMessage.trim() && wsInstance) {
      const messageData = {
        message: newMessage,
        sender: providerId,
      };
      
      wsInstance.send(JSON.stringify(messageData));
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if(e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '600px',
          borderRadius: '12px',
          margin: '16px',
          border: (theme) => `1px solid ${theme.palette.text.disabled}`,
        }
      }}
    >
      {/* Header */}
      <DialogTitle 
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          p: 1.5,
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
        }}>
        <Avatar 
          sx={{ 
            bgcolor: 'primary.dark',
            width: 40,
            height: 40
          }}
        >
          {clientName?.charAt(0)}
        </Avatar>
          <Typography variant="h6">Chat with {clientName}</Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <X />
        </IconButton>
      </DialogTitle>

      {/* Chat Content */}
      <DialogContent 
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: '#f5f5f5'
        }}
      >
        {/* Messages Container */}
        <Box 
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            pb: 2,
            mt: 2,
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
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: msg.sender === providerId ? 'flex-end' : 'flex-start',
                px: 1
              }}
            >
              <Paper
                sx={{
                  maxWidth: '75%',
                  p: 1.5,
                  borderRadius: msg.sender === providerId ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  bgcolor: msg.sender === providerId ? 'primary.main' : 'white',
                  color: msg.sender === providerId ? 'white' : 'text.primary',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    textAlign: 'right',
                    mt: 0.5,
                    opacity: 0.8
                  }}
                >
                  {msg.timestamp}
                </Typography>
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input */}
        <Paper
          sx={{
            p: 1,
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <TextField
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            multiline
            maxRows={4}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim()}
                    color="primary"
                  >
                    <Send className="h-5 w-5" />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiInputBase-root': {
                p: 1
              }
            }}
          />
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
