import React, { useEffect, useState, useRef } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, TextField, IconButton, 
  Box, Typography, Paper, InputAdornment, Avatar,
  CircularProgress
} from "@mui/material";
import { X, Image as ImageIcon } from 'lucide-react';
import SendIcon from '@mui/icons-material/Send';
import chatBg from '../images/chat_bg.jpg';


const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const ChatModal = ({open, onClose, orderId, providerId, providerName, clientId, clientName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [wsInstance, setWsInstance] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if(open) {
      const roomId = `${orderId}`;
      const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomId}/`);
      
      ws.onopen = () => {
        console.log('Connected to chat server');
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat_history') {
          setMessages(data.messages.map(msg => ({
            type: msg.message_type,
            content: msg.message_type === 'TEXT' ? 
              msg.message : 
              `data:image/jpeg;base64,${msg.image_data}`,  // Convert hex to base64
            sender: msg.sender,
            sender_type: msg.sender_type,
            timestamp: msg.timestamp,
            isSentByMe: msg.sender_type === 'PROVIDER'
          })));
        } else {
          setMessages(prev => [...prev, {
            type: data.message_type,
            content: data.message_type === 'TEXT' ? 
              data.message : 
              `data:image/jpeg;base64,${data.image_data}`,  // Convert hex to base64
            sender: data.sender,
            sender_type: data.sender_type,
            timestamp: data.timestamp,
            isSentByMe: data.sender_type === 'PROVIDER'
          }]);
        }
      };
      setWsInstance(ws);
      
      return () => {
        ws.close();
      };
    }
  }, [open, orderId]);

  const handleSendMessage = () => {
    if(newMessage.trim() && wsInstance) {
      const messageData = {
        message_type: 'TEXT',
        message: newMessage,
        sender: providerId,
        is_client: false
      };
      
      wsInstance.send(JSON.stringify(messageData));
      setNewMessage('');
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }

    setIsUploading(true);

    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      const messageData = {
        message_type: 'IMAGE',
        image: base64,
        sender: providerId,
        is_client: false
      };

      wsInstance.send(JSON.stringify(messageData));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e) => {
    if(e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (msg, index) => {
    const isSentByMe = msg.isSentByMe;
    
    return (
      
      <Box
        key={index}
        sx={{
          display: 'flex',
          justifyContent: isSentByMe ? 'flex-end' : 'flex-start',
          px: 1,
          maxWidth: '100%',
          position: 'relative',
          mb: 2
        }}
      >
        {!isSentByMe && (
          <Avatar 
            sx={{ 
              width: 32,
              height: 32,
              mr: 1,
              bgcolor: 'primary.dark',
              fontSize: '0.875rem',
              flexShrink: 0
            }}
          >
            {clientName?.charAt(0)}
          </Avatar>
        )}
        <Paper
          sx={{
            maxWidth: { xs: '85%', sm: '75%' },
            p: 1.5,
            borderRadius: isSentByMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
            bgcolor: isSentByMe ? 'primary.main' : 'white',
            color: isSentByMe ? 'white' : 'text.primary',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            hyphens: 'auto'
          }}
        >
          {msg.type === 'TEXT' ? (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </Typography>
          ) : (
            <Box
            sx={{
              '& img': {
                maxWidth: '100%',
                maxHeight: '300px',
                borderRadius: '8px',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto'
              }
            }}
          >
            <img 
              src={msg.content} 
              alt="Chat attachment" 
              loading="lazy"
              onClick={(e) => {
                // Optional: Implement image preview/zoom functionality
                e.stopPropagation();
                // You can add image preview logic here
              }}
            />
          </Box>
          )}
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
        {isSentByMe && (
          <Avatar 
            sx={{ 
              width: 32,
              height: 32,
              ml: 1,
              bgcolor: 'primary.main',
              fontSize: '0.875rem',
              flexShrink: 0
            }}
          >
            {providerName?.charAt(0)}
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
          height: '90vh',
          maxHeight: '600px',
          borderRadius: '12px'
        }
      }}
    >
      <DialogTitle 
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.dark' }}>
            {clientName?.charAt(0)}
          </Avatar>
          <Typography variant="h6">Chat with {clientName}</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
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
          backgroundImage: `url(${chatBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
          }
        }}
      >
        <Box 
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {messages.map((message, index) => renderMessage(message, index))}
          <div ref={messagesEndRef} />
        </Box>
        
        <Box
          component="form"
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'flex-end',
            mt: 'auto'
          }}
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            sx={{ color: 'primary.main' }}
          >
            {isUploading ? (
              <CircularProgress size={24} />
            ) : (
              <ImageIcon />
            )}
          </IconButton>

          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                borderRadius: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    sx={{ color: 'primary.main' }}
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;