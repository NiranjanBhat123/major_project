import { Box, Dialog, Typography, Button, IconButton } from '@mui/material';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderSuccessSplash = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 4,
          maxWidth: '400px',
          m: 2,
          background: 'linear-gradient(to bottom right, #ffffff, #f7fafc)',
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      <IconButton 
        onClick={onClose}
        sx={{ 
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <X size={20} />
      </IconButton>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'success.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Check size={40} color="white" />
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Order Confirmed!
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Your booking has been successfully scheduled.
            <br />
            You will receive a confirmation shortly.
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={onClose}
            sx={{
              minWidth: 200,
              py: 1.5,
            }}
          >
            Done
          </Button>
        </motion.div>
      </Box>
    </Dialog>
  );
};

export default OrderSuccessSplash;