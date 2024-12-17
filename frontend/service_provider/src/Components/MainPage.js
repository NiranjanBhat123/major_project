import React, { useState, useEffect } from "react";
import {
  Box, Typography, Divider, Button, Alert, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@mui/material";
import { LocationOn, Call } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import OTPVerificationModal from "./OTPVerificationModal";
import ChatModal from "./ChatModal";

const OrderCard = ({ order, client, services, updateStatus, isNewOrder }) => {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [otpDialogOpen, setOTPDialogOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [clientAddress, setClientAddress] = useState("Loading address...");

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

    const a =
      Math.sin(dlat / 2) * Math.sin(dlat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const r = 6371; // Radius of earth in kilometers

    return (c * r).toFixed(1);
  };

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${order.client_latitude}&lon=${order.client_longitude}`,
          {
            headers: {
              'Accept-Language': 'en', // Enforce English as the response language
            },
          }
        );

        if (response.data && response.data.display_name) {
          setClientAddress(response.data.display_name);
        }
      } 
      catch(error) {
        console.error("Failed to fetch address:", error);
        setClientAddress("Address not available");
      }
    };

    fetchAddress();
  }, [order.client_latitude, order.client_longitude]);

  const handleRejectConfirm = () => {
    updateStatus(order.id, "rejected");
    setRejectDialogOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          p: 2,
          border: (theme) => `1px solid ${theme.palette.primary.main}`,
          borderRadius: "1rem",
          m: 2,
          mb: 3,
          backdropFilter: "blur(10px)",
          transition: "all 0.5s ease-in-out",
          "&:hover": {
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          },
          
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              color="primary.main"
              sx={{ textTransform: "uppercase" }}
            >
              Order {order.id.slice(0, 8)}
            </Typography>
            <Typography variant="body2">
              Scheduled for: {formatDate(order.scheduled_on)}
            </Typography>
          </Box>
          <Typography
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              fontSize: "0.875rem",
            }}
          >
            ₹ {order.total_price}
          </Typography>
        </Box>

        <Divider sx={{ my: 2, borderColor: "text.disabled" }} />

        <Box>
          <Typography variant="subtitle1" color="primary.main" sx={{ mb: 1 }}>
            Order placed by {client.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Call sx={{ color: "text.secondary", fontSize: "small" }} />
            <Typography variant="body2">{client.mobile_number}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <LocationOn sx={{ color: "text.secondary", fontSize: "small" }} />
            <Typography variant="body2">{clientAddress}</Typography>
          </Box>
          <Typography variant="body2" fontSize="0.9rem">
            Distance:{" "}
            {haversineDistance(
              parseFloat(order.client_latitude),
              parseFloat(order.client_longitude),
              parseFloat(
                JSON.parse(localStorage.getItem("userLocation")).latitude
              ),
              parseFloat(
                JSON.parse(localStorage.getItem("userLocation")).longitude
              )
            )}{" "}
            KM
          </Typography>
        </Box>

        <Divider sx={{ my: 2, borderColor: "text.disabled" }} />

        <Typography variant="subtitle1" color="primary.main">
          Services Requested:
        </Typography>
        {order.items.map((item) => (
          <Typography key={item.id} variant="body2" sx={{ pl: 1 }}>
            •{" "}
            {services[item.provider_service]?.sub_service.name || "Loading..."}
          </Typography>
        ))}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            {!isNewOrder && (
              <Button
                variant="contained"
                onClick={() => setChatOpen(true)}
                sx={{
                  height: "2rem",
                  padding: "0 15px",
                  borderRadius: "15px",
                  bgcolor: "success.main",
                  "&:hover": {
                    bgcolor: "success.dark",
                  },
                }}
              >
                Chat
              </Button>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            {isNewOrder ? (
              <Button
                variant="contained"
                onClick={() => updateStatus(order.id, "accepted")}
                sx={{
                  height: "2rem",
                  padding: "0 15px",
                  borderRadius: "15px",
                  bgcolor: "success.main",
                  "&:hover": {
                    bgcolor: "success.dark",
                  },
                }}
              >
                Accept
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => setOTPDialogOpen(true)}
                sx={{
                  height: "2rem",
                  padding: "0 15px",
                  borderRadius: "15px",
                  bgcolor: "success.main",
                  "&:hover": {
                    bgcolor: "success.dark",
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
                bgcolor: "error.main",
                "&:hover": {
                  bgcolor: "error.dark",
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

      <OTPVerificationModal
        open={otpDialogOpen}
        onClose={() => setOTPDialogOpen(false)}
        onVerify={async (otpValue) => otpValue === order.otp}
        client={client.name}
        updateStatus={() => updateStatus(order.id, "completed")}
      />

      <ChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        orderId={order.id}
        providerId={localStorage.getItem("providerId")}
        providerName={localStorage.getItem("providerName")}
        clientId={client.id}
        clientName={client.name}
      />
    </>
  );
};

const MainPage = () => {
  const [newOrders, setNewOrders] = useState([]);
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [clients, setClients] = useState({});
  const [services, setServices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const providerId = localStorage.getItem("providerId");
      const response = await axios.get(
        `http://127.0.0.1:8000/orders/?provider_id=${providerId}`
      );

      const pending = [];
      const accepted = [];

      for (const order of response.data) {
        if (order.status === "pending") pending.push(order);
        else if (order.status === "accepted") {
          const scheduledDate = new Date(order.scheduled_on);
          if (scheduledDate > new Date()) accepted.push(order);
        }
      }

      setNewOrders(pending);
      setUpcomingOrders(accepted);

      // Fetch client and service details
      await Promise.all([
        ...pending.map((order) => fetchClientDetails(order.user)),
        ...accepted.map((order) => fetchClientDetails(order.user)),
        ...pending.map((order) => fetchServiceDetails(order.provider)),
        ...accepted.map((order) => fetchServiceDetails(order.provider)),
      ]);

      setLoading(false);
    } catch (err) {
      setError("Failed to fetch orders");
      setLoading(false);
    }
  };

  const fetchClientDetails = async (clientId) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/client/${clientId}/`
      );
      setClients((prev) => ({ ...prev, [clientId]: response.data }));
    } catch (err) {
      console.error("Failed to fetch client details:", err);
    }
  };

  const fetchServiceDetails = async (providerId) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/service_providers/${providerId}/`
      );
      const serviceMap = {};
      response.data.provider_services.forEach((service) => {
        serviceMap[service.id] = service;
      });
      setServices((prev) => ({ ...prev, ...serviceMap }));
    } catch (err) {
      console.error("Failed to fetch service details:", err);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/orders/${orderId}/status/`,
        { status }
      );

      if (response.status === 200) {
        // Show success message
        setError(null);
        // Refresh orders list
        await fetchOrders();
      }
    } catch (err) {
      setError(
        `Failed to update ${status} status: ` +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const Section = ({ sectionName, orders, newOrder }) => {
    return (
      <Box
        sx={{
          flex: 1,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
        }}
      >
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            p: 2,
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="h6" color="primary.dark" textAlign="left">
            {sectionName}
          </Typography>
        </Box>

        <Box
          sx={{
            textAlign: "left",
            height: "32rem",
            overflowY: "scroll",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(0, 0, 0, 0.2)",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "rgba(0, 0, 0, 0.3)",
            },
          }}
        >
          {orders.length === 0 ? (
            <Alert
              severity="info"
              sx={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              {`No ${sectionName.toLowerCase()} available`}
            </Alert>
          ) : (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                client={clients[order.user]}
                services={services}
                updateStatus={handleUpdateStatus}
                isNewOrder={newOrder}
              />
            ))
          )}
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          background: `linear-gradient(135deg, rgba(100, 149, 237, 0.1), rgba(255, 105, 180, 0.1))`,
        }}
      >
        {/* Body */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            pt: "120px",
            px: 3,
            pb: 3,
            mb: 2,
            textAlign: "center",
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                gap: 3,
                flexDirection: { xs: "column", md: "row" },
                pl: 3,
                pr: 3,
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
        </Box>
      </Box>
    </>
  );
};

export default MainPage;
