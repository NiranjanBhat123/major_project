import React, { useEffect, useState, useRef } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, TextField, IconButton, 
  Box, Typography, Paper, InputAdornment, Avatar 
} from "@mui/material";
import { X } from 'lucide-react';
import SendIcon from '@mui/icons-material/Send';

const ChatModal = ({ open, onClose, providerId, providerName, clientId, clientName }) => {
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
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          // Add isSentByMe flag when receiving message
          isSentByMe: data.sender === clientId
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
        sender: clientId,
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

  const renderMessage = (msg, index) => {
    const isSentByMe = msg.sender === clientId;
    
    return (
      <Box
        key={index}
        sx={{
            display: 'flex',
            justifyContent: isSentByMe ? 'flex-end' : 'flex-start',
            px: 1,
            maxWidth: '100%',
            position: 'relative'
        }}
      >
        {!isSentByMe && (
          <Avatar 
            sx={{ 
              width: 32,
              height: 32,
              mr: 1,
              bgcolor: 'primary.dark',
              fontSize: '0.875rem'
            }}
          >
            {providerName?.charAt(0)}
          </Avatar>
        )}
        <Paper
          sx={{
            maxWidth: { xs: '85%', sm: '75%' },
            minWidth: '120px',
            p: 1.5,
            borderRadius: isSentByMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
            bgcolor: isSentByMe ? 'primary.main' : 'white',
            color: isSentByMe ? 'white' : 'text.primary',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            hyphens: 'auto'
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              hyphens: 'auto',
              fontSize: '0.9375rem',
              lineHeight: 1.5
            }}
          >
            {msg.text}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block',
              textAlign: 'right',
              mt: 0.5,
              opacity: 0.8,
              fontSize: '0.75rem'
            }}
          >
            {msg.timestamp}
          </Typography>
        </Paper>
        {isSentByMe && (
          <Avatar 
            sx={{ 
              width: 32,
              height: 32,
              ml: 1,
              bgcolor: 'primary.main',
              fontSize: '0.875rem'
            }}
          >
            {clientName?.charAt(0)}
          </Avatar>
        )}
      </Box>
    );
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
            {providerName?.charAt(0)}
          </Avatar>
          <Typography variant="h6">Chat with {providerName}</Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <X />
        </IconButton>
      </DialogTitle>

      <DialogContent 
        sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: '#f5f5f5',
            overflow: 'hidden'
        }}
      >
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
          {messages.map((msg, index) => renderMessage(msg, index))}
          <div ref={messagesEndRef} />
        </Box>

        <TextField
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Message"
          multiline
          maxRows={4}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            endAdornment: (
              <InputAdornment position="end">
                {
                  newMessage.trim() &&
                    <IconButton 
                      onClick={handleSendMessage} 
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: '#1EAC52'
                        },
                        padding: '6px',
                        borderRadius: '50%'
                      }}
                    >
                      <SendIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                }
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiInputBase-root': {
              p: 1,
              pr: 1.5,
              backgroundColor: 'white',
              borderRadius: '30px'
            },
            '& .MuiInputBase-input': {
              padding: '8px 12px'
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
