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
  Button,
} from "@mui/material";

import OrderCard from "../Styles/OrderCard";

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");


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

  const handleOrderUpdate = (updatedOrder) => {
    // Update the orders state with the new order status
    const updatedOrders = orders.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    );
    setOrders(updatedOrders);
  };

 

  return (
    <>
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
                <OrderCard key={order.id} order={order}  onOrderUpdate={handleOrderUpdate}/>
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
    </>
  );
};

export default OrdersList;
