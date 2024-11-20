import React, { useEffect, useState } from 'react';
import { 
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Divider,
  FormControl,
  FormLabel,
  FormGroup,
  Checkbox,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import { Search } from 'lucide-react';
import { format } from 'date-fns';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found in localStorage');
        }

        const response = await fetch(
          `http://127.0.0.1:8000/orders?client_id=${userId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);



  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FFA500';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px' 
        }}
      >
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      {/* Search and Filter Section */}
      <Box sx={{ display: 'flex', gap: 3, marginBottom: 4 }}>
        <Box sx={{ width: 250, flexShrink: 0 }}>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Filters
          </Typography>
          
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend" sx={{ marginBottom: 1 }}>
              ORDER STATUS
            </FormLabel>
            <FormGroup>
              <FormControlLabel control={<Checkbox />} label="Pending" />
              <FormControlLabel control={<Checkbox />} label="Completed" />
              <FormControlLabel control={<Checkbox />} label="Cancelled" />
            </FormGroup>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend" sx={{ marginBottom: 1 }}>
              ORDER TIME
            </FormLabel>
            <FormGroup>
              <FormControlLabel control={<Checkbox />} label="Last 30 days" />
              <FormControlLabel control={<Checkbox />} label="2024" />
              <FormControlLabel control={<Checkbox />} label="2023" />
            </FormGroup>
          </FormControl>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', gap: 2, marginBottom: 3 }}>
            <TextField
              fullWidth
              placeholder="Search your orders here"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button variant="contained" startIcon={<Search />}>
                      Search Orders
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Orders List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {orders.map((order) => (
              <Card key={order.id} sx={{ width: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <Typography variant="subtitle1" component="div">
                      Order ID: {order.id.slice(0, 8)}
                    </Typography>
                    <Chip
                      label={order.status.toUpperCase()}
                      sx={{
                        backgroundColor: getStatusColor(order.status),
                        color: 'white',
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <Box sx={{ width: 100, height: 100, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Service Image
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" component="div">
                        Service #{order.items[0]?.provider_service}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ordered on: {format(new Date(order.ordered_on), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Scheduled for: {format(new Date(order.scheduled_on), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </Box>
                    <Box sx={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <Typography variant="h6" component="div">
                        ₹{parseFloat(order.total_price).toLocaleString('en-IN')}
                      </Typography>
                      {order.status === 'completed' && (
                        <Button variant="outlined" size="small" sx={{ marginTop: 1 }}>
                          Rate & Review
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginTop: 2 }}>
                    <Button variant="outlined" size="small">
                      View Details
                    </Button>
                    {order.status === 'pending' && (
                      <Button variant="outlined" color="error" size="small">
                        Cancel Order
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OrdersList;