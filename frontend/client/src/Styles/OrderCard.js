import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Collapse,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import ChatModal from "../Components/ChatModal";

const OrderCard = ({ order ,onOrderUpdate}) => {
  const [expanded, setExpanded] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleOrderExpand = () => {
    setExpanded(!expanded);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending": return "#FFA500";
      case "completed": return "#4CAF50";
      case "cancelled": return "#F44336";
      case "accepted": return "#42a7f5";
      case "rejected": return "#d742f5";
      default: return "#757575";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending": return <Clock size={16} />;
      case "completed": return <CheckCircle size={16} />;
      case "cancelled": return <XCircle size={16} />;
      case "accepted": return <Truck size={16} />;
      case "rejected": return <AlertTriangle size={16} />;
      default: return null;
    }
  };

  const handleCancelOrder = async () => {
    // Check if order is in a cancellable state
    if (!["pending", "accepted"].includes(order.status.toLowerCase())) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/orders/${order.id}/status/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      const updatedOrder = await response.json();
      
      // If onOrderUpdate callback is provided, call it to update parent component
      if (onOrderUpdate) {
        onOrderUpdate(updatedOrder);
      }

      // Close the dialog
      setCancelDialogOpen(false);
    } catch (error) {
      console.error('Error cancelling order:', error);
      // Optionally show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Grid item xs={12}>
      <Card elevation={3}>
        <CardContent>
          {/* Order Id and status */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="subtitle1">
              Order ID: {order.id.slice(0, 8)}
            </Typography>
            <Chip
              icon={getStatusIcon(order.status)}
              label={order.status.toUpperCase()}
              sx={{
                backgroundColor: getStatusColor(order.status),
                color: "white",
              }}
            />
          </Box>

          {/* Order Details */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box
              component="img"
              src={order.service_image}
              sx={{
                width: 100,
                height: 100,
                objectFit: "cover",
                borderRadius: 2,
              }}
            />

            <Box flex={1}>
              <Typography variant="h6" fontWeight={600} color="primary">
                {order.service_name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                <Calendar size={16} />
                <Typography variant="body2" color="text.secondary">
                  Ordered: {new Date(order.ordered_on).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                <Truck size={16} />
                <Typography variant="body2" color="text.secondary">
                  Scheduled: {new Date(order.scheduled_on).toLocaleString()}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Typography variant="h6" color="primary">
                ₹{parseFloat(order.total_price).toLocaleString("en-IN")}
              </Typography>
            </Box>
          </Box>

          {/* Expand/Collapse Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <IconButton onClick={toggleOrderExpand} size="small">
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </IconButton>
          </Box>

          {/* Expandable Details Section */}
          <Collapse in={expanded}>
            <Box
              sx={{
                mt: 2,
                p: 3,
                bgcolor: "white",
                borderRadius: 3,
                boxShadow: 2,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              {/* Provider & OTP Section */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      bgcolor: "rgba(0,0,0,0.04)",
                      p: 2,
                      borderRadius: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Service Provider
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {order.provider_name}
                      </Typography>
                    </Box>
                    {(order.status==="accepted" || order.status==="pending")&&<Button
                      variant="contained"
                      onClick={() => setChatOpen(true)}
                      sx={{
                        height: "2rem",
                        padding: "0 15px",
                        borderRadius: "15px",
                        bgcolor: "success.main",
                        "&:hover": { bgcolor: "success.dark" },
                      }}
                    >
                      Chat
                    </Button>}
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      bgcolor: "rgba(0,0,0,0.04)",
                      p: 2,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Verification OTP
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight={600}>
                      {order.otp}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Share with service provider
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Sub Services */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Service Details
                </Typography>
                {order.items.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      bgcolor: "rgba(0,0,0,0.02)",
                      p: 1.5,
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      • {item.sub_service_name}
                    </Typography>
                    <Chip
                      label={`₹${parseFloat(item.price).toLocaleString("en-IN")}`}
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Box>

              {/* Scheduling Details */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid rgba(0,0,0,0.1)",
                  pt: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Ordered On
                  </Typography>
                  <Typography variant="body2">
                    {new Date(order.ordered_on).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Scheduled On
                  </Typography>
                  <Typography variant="body2">
                    {new Date(order.scheduled_on).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Price
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="primary">
                    ₹{parseFloat(order.total_price).toLocaleString("en-IN")}
                  </Typography>
                </Box>
              </Box>
              {/* Cancel Order Option */}
              {["pending", "accepted"].includes(order.status.toLowerCase()) && (
                <Box 
                  sx={{ 
                    mt: 3, 
                    display: 'flex', 
                    justifyContent: 'center',
                    borderTop: '1px solid rgba(0,0,0,0.1)',
                    pt: 2 
                  }}
                >
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<X size={16} />}
                    onClick={() => setCancelDialogOpen(true)}
                    sx={{
                      borderRadius: 3,
                    }}
                  >
                    Cancel Order
                  </Button>
                </Box>
              )}
            </Box>
            <ChatModal
              open={chatOpen}
              onClose={() => setChatOpen(false)}
              orderId={order.id}
              providerId={order.provider}
              providerName={order.provider_name}
              clientId={localStorage.getItem("userId")}
              clientName={localStorage.getItem("userName")}
            />
          </Collapse>
        </CardContent>
      </Card>
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        aria-labelledby="cancel-order-dialog-title"
        aria-describedby="cancel-order-dialog-description"
      >
        <DialogTitle id="cancel-order-dialog-title">
          Cancel Order
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-order-dialog-description">
            Are you sure you want to cancel this order? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCancelDialogOpen(false)} 
            color="primary"
          >
            No, Keep Order
          </Button>
          <Button 
            onClick={handleCancelOrder} 
            color="error" 
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? 'Cancelling...' : 'Yes, Cancel Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default OrderCard;