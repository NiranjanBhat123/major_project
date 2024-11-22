import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Container,
  Collapse,
  IconButton,
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
} from "lucide-react";

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
          throw new Error("User ID not found in localStorage");
        }

        const response = await fetch(
          `http://127.0.0.1:8000/orders?client_id=${userId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();

        const sortedOrders = data.sort(
          (a, b) => new Date(b.ordered_on) - new Date(a.ordered_on)
        );

        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    // Status Filter
    if (statusFilter !== "all") {
      result = result.filter(
        (order) => order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Time Filter
    const now = new Date();
    if (timeFilter === "lastWeek") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter((order) => new Date(order.ordered_on) >= weekAgo);
    } else if (timeFilter === "lastMonth") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter((order) => new Date(order.ordered_on) >= monthAgo);
    }

    setFilteredOrders(result);
  }, [statusFilter, timeFilter, orders]);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#FFA500"; // Orange
      case "completed":
        return "#4CAF50"; // Green
      case "cancelled":
        return "#F44336"; // Red
      case "accepted":
        return "#2196F3"; // Blue
      case "rejected":
        return "#9C27B0"; // Purple
      default:
        return "#757575"; // Gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock size={16} />;
      case "completed":
        return <CheckCircle size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      case "accepted":
        return <Truck size={16} />;
      case "rejected":
        return <AlertTriangle size={16} />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* Filters */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Status Filter
            </Typography>
            <RadioGroup
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <FormControlLabel
                value="all"
                control={<Radio />}
                label="All Orders"
              />
              <FormControlLabel
                value="pending"
                control={<Radio />}
                label="Pending"
              />
              <FormControlLabel
                value="accepted"
                control={<Radio />}
                label="Accepted"
              />
              <FormControlLabel
                value="rejected"
                control={<Radio />}
                label="Rejected"
              />
              <FormControlLabel
                value="completed"
                control={<Radio />}
                label="Completed"
              />
              <FormControlLabel
                value="cancelled"
                control={<Radio />}
                label="Cancelled"
              />
            </RadioGroup>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Time Filter
            </Typography>
            <RadioGroup
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <FormControlLabel
                value="all"
                control={<Radio />}
                label="All Time"
              />
              <FormControlLabel
                value="lastWeek"
                control={<Radio />}
                label="Last Week"
              />
              <FormControlLabel
                value="lastMonth"
                control={<Radio />}
                label="Last Month"
              />
            </RadioGroup>
          </Paper>
        </Grid>

        {/* Orders Grid */}
        <Grid item xs={12} md={9}>
          <Grid container spacing={2}>
            {filteredOrders.map((order) => (
              <Grid item xs={12} key={order.id}>
                <Card elevation={3}>
                  <CardContent>
                    {/* Order Id abd status starts here */}
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
                    {/* Order Id and status ends here */}

                    {/*2nd row of card starts here */}
                    <Box sx={{ display: "flex", gap: 2 }}>
                      {/* Placeholder Image */}
                      <Box
                        component="img"
                        src={order.image}
                        sx={{
                          width: 100,
                          height: 100,
                          objectFit: "cover", // Ensures image fills box properly
                        }}
                      />

                      {/* Order Details */}
                      <Box flex={1}>
                      <Typography
                              variant="h6"
                              fontWeight={600}
                              color="primary"
                            >
                              {order.service_name}
                            </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          <Calendar size={16} />
                          <Typography variant="body2" color="text.secondary">
                            Ordered:{" "}
                            {new Date(order.ordered_on).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          <Truck size={16} />
                          <Typography variant="body2" color="text.secondary">
                            Scheduled:{" "}
                            {new Date(order.scheduled_on).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="h6" color="primary">
                          ₹
                          {parseFloat(order.total_price).toLocaleString(
                            "en-IN"
                          )}
                        </Typography>
                      </Box>
                    </Box>
                    {/*2nd row of card starts here */}

                    {/* Expand/Collapse Button */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 1,
                      }}
                    >
                      <IconButton
                        onClick={() => toggleOrderExpand(order.id)}
                        size="small"
                      >
                        {expandedOrders[order.id] ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </IconButton>
                    </Box>

                    {/* Expandable Details Section */}
                    <Collapse in={expandedOrders[order.id]}>
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
                                bgcolor: "rgba(0,0,0,0.04)",
                                p: 2,
                                borderRadius: 2,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                gutterBottom
                              >
                                Service Provider
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {order.provider_name}
                              </Typography>
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
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                gutterBottom
                              >
                                Verification OTP
                              </Typography>
                              <Typography
                                variant="h6"
                                color="primary"
                                fontWeight={600}
                              >
                                {order.otp}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Share with service provider
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Sub Services */}
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            sx={{ mb: 2 }}
                          >
                            Service Details
                          </Typography>
                          {order.items.map((item, index) => (
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
                                label={`₹${parseFloat(
                                  item.price
                                ).toLocaleString("en-IN")}`}
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
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Ordered On
                            </Typography>
                            <Typography variant="body2">
                              {new Date(order.ordered_on).toLocaleString()}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Scheduled On
                            </Typography>
                            <Typography variant="body2">
                              {new Date(order.scheduled_on).toLocaleString()}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Total Price
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="primary"
                            >
                              ₹
                              {parseFloat(order.total_price).toLocaleString(
                                "en-IN"
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {filteredOrders.length === 0 && (
              <Grid item xs={12}>
                <Typography
                  variant="body1"
                  align="center"
                  color="text.secondary"
                >
                  No orders found
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrdersList;
