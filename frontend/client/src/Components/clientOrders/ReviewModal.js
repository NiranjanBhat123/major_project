import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box,
  Typography
} from '@mui/material';
import { Star } from 'lucide-react';

const ReviewModal = ({ 
  open, 
  onClose, 
  orderId, 
  providerName, 
  onSubmitReview 
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    onSubmitReview(orderId, rating, review);
    onClose();
  };

  const handleClearRating = () => {
    setRating(0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Review Service from {providerName}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1">Your Rating:</Typography>
            <Rating
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
              precision={1}
              icon={<Star fill="currentColor" />}
              emptyIcon={<Star />}
              sx={{
                '& .MuiRating-iconFilled': {
                  color: 'primary.main',
                },
              }}
            />
            {rating > 0 && (
              <Button 
                size="small" 
                color="secondary" 
                onClick={handleClearRating}
              >
                Clear
              </Button>
            )}
          </Box>
          
          <TextField
            label="Write your review"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={review}
            onChange={(e) => setReview(e.target.value)}
            inputProps={{ maxLength: 500 }}
            helperText={`${review.length}/500`}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={rating === 0}
        >
          Submit Review
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewModal;