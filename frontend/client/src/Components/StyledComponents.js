import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Rating,
  Popover,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Stack,
  Backdrop,
  Avatar,
  CardMedia,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  LinearProgress,
} from "@mui/material";

import {
  Clock,
  Calendar,
  Star,
  MapPin,
  ChevronRight,
  Phone,
  Bike,
  X,
  Check,
} from "lucide-react";

import { motion } from "framer-motion";
// import { Star, MapPin, Clock, ChevronRight, Phone, Bike , X} from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { Calendar, Check } from "lucide-react";
import Spashscreen from "../pages/Spashscreen";

export const ServiceProviderImage = ({ provider, providerName }) => {
  const theme = useTheme();
  const [imageError, setImageError] = useState(false);

  return (
    <Box position="relative">
      <Avatar
        src={
          imageError
            ? "/api/placeholder/64/64"
            : provider.provider_photo || "/api/placeholder/64/64"
        }
        alt={providerName}
        sx={{
          width: 64,
          height: 64,
          border: `2px solid ${theme.palette.primary.main}`,
          boxShadow: theme.shadows[3],
        }}
        onError={() => setImageError(true)}
      />
    </Box>
  );
};

export const ServiceProviderCard = ({ provider, index }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showSuccessSplash, setShowSuccessSplash] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  //const [orderCompleted, setOrderCompleted] = useState(false);

  const handleBookNowClick = (event) => {
    setAnchorEl(event.currentTarget);
    setSelectedServices([]);
    fetchAvailableServices();
  };

  const createOrder = async () => {
    const userId = localStorage.getItem("userId");
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(selectedTime.getHours());
    scheduledDateTime.setMinutes(selectedTime.getMinutes());
    const serviceId = window.location.pathname.split("/").pop();
    const { latitude: client_latitude, longitude: client_longitude } =
      JSON.parse(localStorage.getItem("userLocation") || "{}") || {};

    const orderData = {
      user: userId,
      provider: provider.provider_id,
      service: serviceId,
      scheduled_on: scheduledDateTime.toISOString(),
      total_price: calculateTotal(),
      client_latitude: parseFloat(client_latitude).toFixed(6),
      client_longitude: parseFloat(client_longitude).toFixed(6),
      items: selectedServices.map((service) => ({
        provider_service: service.id,
      })),
    };

    try {
      console.log(orderData);
      const response = await fetch(`http://127.0.0.1:8000/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      setAnchorEl(null);
      setShowOrderSummary(false);
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedServices([]);

      // Use a small timeout to ensure state updates are processed
      setTimeout(() => {
        setShowSuccessSplash(true);
      }, 100);
    } catch (error) {
      console.error("Error creating order:", error);
      // You might want to add error handling UI here
    }
  };

  const fetchAvailableServices = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/service_providers/provider_services/?provider_id=${provider.provider_id}`
      );
      const data = await response.json();
      // Create a Set of IDs to avoid duplicates
      const seenIds = new Set();
      const uniqueServices = [
        // Only add the main service if it's not in the fetched data
        ...(data.some((service) => service.id === provider.id)
          ? []
          : [
              {
                id: provider.id,
                sub_service_name: provider.service_name,
                price: provider.price,
              },
            ]),
        ...data.filter((service) => {
          if (seenIds.has(service.id)) {
            return false;
          }
          seenIds.add(service.id);
          return true;
        }),
      ];
      setAvailableServices(uniqueServices);
    } catch (error) {
      console.error("Error fetching available services:", error);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowOrderSummary(false);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedServices([]);
  };

  const handleServiceToggle = (service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const calculateTotal = () => {
    return selectedServices.reduce(
      (sum, service) => sum + parseFloat(service.price),
      0
    );
  };

  const handleScheduleBook = () => {
    if (selectedDate && selectedTime) {
      setShowOrderSummary(true);
    }
  };

  const open = Boolean(anchorEl);

  const ReviewsDialog = ({ open, onClose, provider }) => {
    const theme = useTheme();
    const totalReviews = provider.provider_reviews?.length || 0;

    const getReviewCountPercentage = (count, total) => {
      if (!total) return 0;
      return (count / total) * 100;
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
          },
        }}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" fontWeight={600}>
              {totalReviews} Reviews
            </Typography>
            <IconButton onClick={onClose}>
              <X size={20} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h4" gutterBottom>
               {provider.provider_rating?.toFixed(2)} / 5
            </Typography>

            {[5, 4, 3, 2, 1].map((rating) => (
              <Box
                key={rating}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 1,
                }}
              >
                <Typography sx={{ minWidth: 30 }}>{rating}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={getReviewCountPercentage(
                    provider.rating_counts?.[rating] || 0,
                    totalReviews
                  )}
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: theme.palette.grey[200],
                    "& .MuiLinearProgress-bar": {
                      bgcolor: theme.palette.success.main,
                    },
                  }}
                />
                <Typography sx={{ minWidth: 50 }}>
                  {provider.rating_counts?.[rating] || 0}
                </Typography>
              </Box>
            ))}

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Recent Reviews
              </Typography>
              {provider.provider_reviews?.map((review) => (
                <Box
                  key={review.order_id}
                  sx={{
                    py: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      by {review.client_name}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{review.review}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(review.date).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  const PartialStar = ({ value, color = "#FF9800" }) => {
    // Calculate the fill percentage (0-100)
    const percentage = Math.min(
      Math.max((value - Math.floor(value)) * 100, 0),
      100
    );

    return (
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
          width: 24,
          height: 24,
        }}
      >
        {/* Empty star outline */}
        <Star
          size={24}
          stroke={color}
          fill="transparent"
          style={{ position: "absolute" }}
        />
        {/* Partially filled star using SVG clip-path */}
        <svg width="24" height="24" style={{ position: "absolute" }}>
          <defs>
            <clipPath id={`clip-${percentage}`}>
              <rect x="0" y="0" width={`${percentage}%`} height="100%" />
            </clipPath>
          </defs>
          <g clipPath={`url(#clip-${percentage})`}>
            <Star
              size={24}
              stroke={color}
              fill={color}
              style={{ display: "block" }}
            />
          </g>
        </svg>
      </Box>
    );
  };

  // Custom rating component that shows partial fills
  const PartialRating = ({ value, color = "#FF9800" }) => {
    return (
      <Box sx={{ display: "inline-flex", alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const diff = value - star + 1;
          return (
            <Box key={star} sx={{ display: "inline-flex" }}>
              {diff >= 1 ? (
                // Full star
                <Star size={24} stroke={color} fill={color} />
              ) : diff > 0 ? (
                // Partial star
                <PartialStar value={value - Math.floor(value)} color={color} />
              ) : (
                // Empty star
                <Star size={24} stroke={color} fill="transparent" />
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card
        sx={{
          mb: 2,
          borderRadius: 3,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows[10],
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <ServiceProviderImage
                provider={provider}
                providerName={provider.provider_name}
              />
            </Grid>
            <Grid item xs>
              <Typography variant="h6" gutterBottom>
                {provider.provider_name}
              </Typography>

              <Box display="flex" alignItems="center"  gap={2} mb={1}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    cursor: "pointer",
                  }}
                  onClick={() => setReviewsOpen(true)}
                >
                  <PartialRating value={provider.provider_rating || 0} />
                  <Box display="flex" alignItems="center"  justifyContent="center" gap={1} mt={0.5}   width="100%">
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ fontWeight: 700 }}
                      
                    >
                      {provider.provider_rating?.toFixed(1)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      ({provider.provider_reviews?.length || 0} reviews)
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" color="text.secondary">
                  <MapPin size={16} />
                  <Typography variant="body2" ml={0.5}>
                    {provider.provider_address}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={3}>
                <Box display="flex" alignItems="center" color="text.secondary">
                  <Phone size={16} />
                  <Typography variant="body2" ml={1}>
                    {provider.provider_mobile_number}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" color="text.secondary">
                  <Bike size={16} />
                  <Typography variant="body2" ml={1}>
                    {`${provider.distance} KM away`}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item>
              <Typography
                variant="h5"
                color="primary"
                gutterBottom
                textAlign="right"
              >
                ₹{parseFloat(provider.price || 0).toLocaleString()}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                endIcon={<ChevronRight />}
                onClick={handleBookNowClick}
                sx={{
                  borderRadius: "50px",
                  px: 3,
                }}
              >
                Book Now
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <ReviewsDialog
        open={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        provider={provider}
      />

      <Backdrop
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          zIndex: theme.zIndex.drawer + 1,
        }}
        open={open}
        onClick={handleClose}
      />

      {/* Popover for ordering services */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        sx={{
          "& .MuiPopover-paper": {
            width: "500px",
            maxHeight: "80vh", // increased from 80vh to give more space
            overflowY: "auto",
            borderRadius: 3,
            boxShadow: theme.shadows[20],
            p: 4,
            margin: "32px 0", // Add margin to ensure it doesn't touch the screen edges
            position: "fixed",
            top: "50% !important",
            left: "50% !important",
            transform: "translate(-50%, -50%) !important",
          },
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <X size={20} />
        </IconButton>

        <Box>
          {!showOrderSummary ? (
            <>
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
                Choose services
              </Typography>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                Available Services:
              </Typography>
              <List>
                {availableServices.map((service) => (
                  <ListItem
                    key={service.id}
                    sx={{
                      bgcolor: theme.palette.background.light,
                      borderRadius: 2,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography fontWeight={500}>
                          {service.sub_service_name}
                        </Typography>
                      }
                      secondary={`₹${parseFloat(
                        service.price
                      ).toLocaleString()}`}
                    />
                    <Checkbox
                      checked={selectedServices.some(
                        (s) => s.id === service.id
                      )}
                      onChange={() => handleServiceToggle(service)}
                      sx={{
                        color: theme.palette.primary.main,
                        "&.Mui-checked": {
                          color: theme.palette.primary.main,
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 3 }} />

              <Stack spacing={3}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: theme.palette.primary.main }}
                >
                  Total: ₹{calculateTotal().toLocaleString()}
                </Typography>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Stack spacing={2}>
                    <DatePicker
                      label="Select Date"
                      value={selectedDate}
                      onChange={setSelectedDate}
                      minDate={new Date()}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&:hover": {
                            "& > fieldset": {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        },
                      }}
                    />
                    <TimePicker
                      label="Select Time"
                      value={selectedTime}
                      onChange={setSelectedTime}
                      views={["hours", "minutes"]}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&:hover": {
                            "& > fieldset": {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        },
                      }}
                    />
                  </Stack>
                </LocalizationProvider>

                <Button
                  variant="contained"
                  onClick={handleScheduleBook}
                  disabled={
                    !selectedDate ||
                    !selectedTime ||
                    selectedServices.length === 0
                  }
                  startIcon={<Calendar className="h-4 w-4" />}
                  sx={{
                    mt: 2,
                    bgcolor: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: theme.palette.primary.dark,
                    },
                    "&.Mui-disabled": {
                      bgcolor: theme.palette.action.disabledBackground,
                    },
                  }}
                >
                  Schedule Booking
                </Button>
              </Stack>
            </>
          ) : (
            <Box>
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
                Order Summary
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                    Selected Services:
                  </Typography>
                  {selectedServices.map((service) => (
                    <Box
                      key={service.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        bgcolor: theme.palette.background.light,
                        p: 2,
                        borderRadius: 2,
                        mb: 1,
                      }}
                    >
                      <Typography>{service.sub_service_name}</Typography>
                      <Typography fontWeight={500}>
                        ₹{parseFloat(service.price).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                    Appointment Details:
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Calendar size={20} />
                      <Typography>
                        {selectedDate?.toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Clock size={20} />
                      <Typography>
                        {selectedTime?.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider />

                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, color: theme.palette.primary.main }}
                >
                  Total Amount: ₹{calculateTotal().toLocaleString()}
                </Typography>

                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Check className="h-4 w-4" />}
                  onClick={createOrder}
                  sx={{
                    mt: 2,
                    bgcolor: theme.palette.success.main,
                    "&:hover": {
                      bgcolor: theme.palette.success.dark,
                    },
                  }}
                >
                  Confirm Booking
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Popover>

      <Spashscreen
        open={showSuccessSplash}
        onClose={() => {
          setShowSuccessSplash(false);
        }}
      />
    </motion.div>
  );
};

export const SubServiceCard = ({ subService, isSelected, onClick }) => {
  const theme = useTheme();

  return (
    <Card
      onClick={onClick}
      sx={{
        mb: 2,
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderRadius: 3,
        border: `1.5px solid ${
          isSelected ? theme.palette.primary.main : "transparent"
        }`,
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardMedia
        component="img"
        height="140"
        image={subService.image || "/api/placeholder/400/320"}
        alt={subService.name}
        sx={{
          transition: "transform 0.3s ease",
          "&:hover": {
            transform: "scale(1.05)",
          },
        }}
      />
      <CardContent>
        <Typography
          variant="h6"
          align="center"
          color={isSelected ? "primary" : "text.primary"}
        >
          {subService.name}
        </Typography>
      </CardContent>
    </Card>
  );
};
