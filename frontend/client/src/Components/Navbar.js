import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import MapIcon from "@mui/icons-material/Map"; // for a map icon
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Fade,
  Chip,
  Typography,
  Autocomplete,
  InputAdornment,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";

import LocationPicker from "./LocationPicker";

import { styled, alpha } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import HandymanIcon from "@mui/icons-material/Handyman";
import CloseIcon from "@mui/icons-material/Close";
import AuthModal from "./AuthModal";

import { useWelcomeViewContext } from "../Contexts/WelcomeViewContextProvider";

const StyledAppBar = styled(AppBar)(({ theme, isscrolled }) => ({
  backgroundColor: theme.palette.common.white,
  transition: "all 0.3s ease",
  boxShadow: isscrolled === "true" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
  borderBottom: "1px solid",
  borderColor: alpha(theme.palette.grey[300], 0.8),
}));

const LogoContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  marginRight: "32px",
  cursor: "pointer",
});

const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: "Righteous, cursive", // Using Righteous font for a stylish look
  fontSize: "2rem",
  fontWeight: "bold",
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  "& .icon": {
    color: theme.palette.primary.main,
    fontSize: "1.8rem",
    transform: "rotate(-15deg)",
  },
  "& .highlight": {
    color: theme.palette.primary.main,
  },
}));

const LocationChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.grey[100], 0.8),
  "&:hover": {
    backgroundColor: alpha(theme.palette.grey[200], 0.8),
  },
  height: "40px",
  padding: "0 8px",
  "& .MuiChip-icon": {
    color: theme.palette.grey[600],
  },
  "& .MuiChip-label": {
    color: theme.palette.grey[700],
    fontWeight: 500,
  },
}));
// Existing styled components remain the same...
// (StyledAppBar, LogoContainer, LogoText, LocationChip definitions remain unchanged)

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  width: "23rem",
  "& .MuiOutlinedInput-root": {
    backgroundColor: alpha(theme.palette.grey[100], 0.8),
    borderRadius: "8px",
    padding: "2px 4px",
    transition: theme.transitions.create(["background-color", "box-shadow"]),
    "& fieldset": {
      borderColor: "transparent",
    },
    "&:hover": {
      backgroundColor: alpha(theme.palette.grey[100], 1),
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.common.white,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
      "& fieldset": {
        borderColor: theme.palette.primary.main,
      },
    },
  },
  "& .MuiAutocomplete-input": {
    padding: "7.5px 4px 7.5px 0 !important",
    height: "25px",
    fontSize: "0.875rem",
  },
}));
const SearchLoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.grey[500],
  size: 20,
}));

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [locationAnchorEl, setLocationAnchorEl] = useState(null);
  const [userName, setUserName] = useState("");
  const [searchValue, setSearchValue] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [filteredServices, setFilteredServices] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const navigate = useNavigate();

  const {
    isAuthModalOpen,
    handleCloseAuthModal,
    handleOpenAuthModal,
    isLoggedIn,
    handleLogout,
    setSelectedSubService,
    location,
    setLocation,
  } = useWelcomeViewContext();

  // Fetch subservices from the backend
  const fetchSubServices = async (searchTerm = "") => {
    try {
      setIsSearching(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await fetch(
        "http://127.0.0.1:8000/sub_services/listAll/"
      );
      const data = await response.json();

      if (data.status && data.data.results) {
        if (searchTerm) {
          const filtered = data.data.results.filter((service) =>
            service.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setFilteredServices(filtered);
        } else {
          setFilteredServices([]);
        }
      }
    } catch (error) {
      console.error("Error fetching subservices:", error);
      setFilteredServices([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search handler
  const handleSearchInput = (event, newInputValue) => {
    setInputValue(newInputValue);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for search
    const newTimeout = setTimeout(() => {
      fetchSubServices(newInputValue);
    }, 300); // 300ms delay

    setSearchTimeout(newTimeout);
  };

  useEffect(() => {
    fetchSubServices();
  }, []);

  // Existing useEffects remain the same...

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Load user data and location
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }

    const userLocation = localStorage.getItem("userLocation");
    if (userLocation) {
      try {
        const parsedLocation = JSON.parse(userLocation);
        setLocation(parsedLocation);
      } catch (error) {
        console.error("Error parsing location:", error);
      }
    }
  }, []);

  // (scroll handler, user data loading, etc.)

  const formatAddress = (address) => {
    if (!address) return "";
    const parts = address.split(",");
    return parts.slice(0, 2).join(",");
  };

 

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLocationClick = (event) => {
    setLocationAnchorEl(event.currentTarget);
  };

  const handleLocationMenuClose = () => {
    setLocationAnchorEl(null);
  };

  const handleOpenLocationPicker = () => {
    setIsLocationPickerOpen(true);
  };

  const handleCloseLocationPicker = () => {
    setIsLocationPickerOpen(false);
  };

  const handleConfirmLocation = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location details");
      }

      const data = await response.json();

      const locationData = {
        latitude: lat,
        longitude: lng,
        address: data.display_name || `Latitude: ${lat}, Longitude: ${lng}`,
        timestamp: new Date().toISOString(),
      };

      // Store in localStorage
      localStorage.setItem("userLocation", JSON.stringify(locationData));

      // Update state
      setLocation(locationData);

      // Close the modal
      handleCloseLocationPicker();
    } catch (error) {
      console.error("Error confirming location:", error);

      // Fallback location data in case of API failure
      const fallbackLocationData = {
        latitude: lat,
        longitude: lng,
        address: `Latitude: ${lat}, Longitude: ${lng}`,
        timestamp: new Date().toISOString(),
      };

      // Store fallback in localStorage
      localStorage.setItem(
        "userLocation",
        JSON.stringify(fallbackLocationData)
      );

      // Update state with fallback
      setLocation(fallbackLocationData);

      // Close the modal
      handleCloseLocationPicker();

      // Optionally show an error message to the user
      alert("Could not fetch exact address. Using coordinates instead.");
    }
  };

  const handleSearchChange = (event, newValue) => {
    setSearchValue(newValue);
    // You can handle the selected service here
    if (newValue) {
      console.log("Selected service:", newValue);
      setSelectedSubService(newValue);
      navigate(`/service/${newValue.main_service}`);
      // Add your logic for handling the selected service
    }
  };

  // Replace the SearchTextField in the Toolbar with this new Autocomplete
  const searchComponent = (
    <StyledAutocomplete
      value={searchValue}
      onChange={handleSearchChange}
      inputValue={inputValue}
      onInputChange={handleSearchInput}
      options={filteredServices}
      getOptionLabel={(option) => option.name || ""}
      loading={isSearching}
      loadingText="Searching..."
      noOptionsText="No services found"
      ListboxProps={{
        sx: {
          maxHeight: "400px",
          "& .MuiAutocomplete-listbox": {
            padding: 0,
          },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search for services..."
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "grey.500" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {isSearching && (
                  <SearchLoadingIndicator size={20} sx={{ mr: 1 }} />
                )}
                {inputValue && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setInputValue("");
                      setFilteredServices([]);
                    }}
                    sx={{
                      p: 0.5,
                      position: "absolute", // Position absolutely
                      right: "8px", // Place at the end
                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <ClearIcon
                      sx={{
                        fontSize: 18,
                        color: "grey.500",
                      }}
                    />
                  </IconButton>
                )}
              </Box>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              p: "2px 4px",
              paddingRight: "36px", // Add space for the clear icon
            },
            "& .MuiIconButton-root": {
              marginRight: 0,
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <MenuItem
          {...props}
          sx={{
            py: 1.5,
            px: 2,
            minHeight: "auto",
            width: "100%",
            whiteSpace: "normal",
            "&:hover": {
              backgroundColor: alpha("#000", 0.04),
            },
          }}
        >
          <Box
            sx={{
              width: "100%",
              minWidth: 0,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {option.name}
            </Typography>
            {option.description && (
              <Typography
                variant="caption"
                sx={{
                  color: "grey.600",
                  display: "block",
                  mt: 0.5,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {option.description}
              </Typography>
            )}
          </Box>
        </MenuItem>
      )}
      PaperProps={{
        sx: {
          mt: 1,
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          width: "600px",
          maxWidth: "80vw",
          "& .MuiAutocomplete-listbox": {
            padding: 0,
            maxHeight: "400px",
            width: "100%",
          },
        },
      }}
      PopperProps={{
        placement: "bottom-start",
        sx: {
          width: "600px !important",
          maxWidth: "80vw !important",
        },
      }}
    />
  );

  return (
    <>
    
      <StyledAppBar
        position="sticky"
        isscrolled={isScrolled.toString()}
        elevation={0}
      >
        <Toolbar sx={{ py: 1.5, gap: 2 }}>
          {/* Logo section remains the same */}
          <LogoContainer>
            <LogoText
              variant="h1"
              onClick={() => {
                navigate("/");
                setSearchValue(null);
              }}
            >
              <HandymanIcon className="icon" />
              FixNGo
            </LogoText>
          </LogoContainer>

          {/* Location chip remains the same */}
          {location && 
            <Tooltip
              title="Click to view full address"
              arrow
              placement="bottom"
            >
              <LocationChip
                icon={<LocationOnIcon />}
                label={formatAddress(location.address)}
                onClick={handleLocationClick}
                clickable
              />
            </Tooltip>
          }

          {/* Replace the existing search field with the new searchComponent */}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            {searchComponent}
          </Box>

          {/* Rest of the Navbar remains the same */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isLoggedIn ? (
              <>
                <IconButton
                  color="primary"
                  sx={{ backgroundColor: alpha("#000", 0.04) }}
                >
                  <ShoppingCartIcon />
                </IconButton>
                <IconButton
                  onClick={handleProfileClick}
                  sx={{
                    p: 0.5,
                    backgroundColor: alpha("#000", 0.04),
                    "&:hover": {
                      backgroundColor: alpha("#000", 0.08),
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 32,
                      height: 32,
                    }}
                  >
                    {userName?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  onClick={handleMenuClose}
                  PaperProps={{
                    elevation: 2,
                    sx: {
                      mt: 1.5,
                      minWidth: 180,
                      borderRadius: "8px",
                      backgroundColor: "common.white",
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem sx={{ py: 1.5 }}>
                    <PersonIcon sx={{ mr: 2, color: "grey.600" }} />
                    <Link
                      to="/profile"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      Profile
                    </Link>
                  </MenuItem>
                  <MenuItem
                    sx={{ py: 1.5 }}
                    onClick={() => navigate("/orders")}
                  >
                    <ReceiptIcon sx={{ mr: 2, color: "grey.600" }} /> My Orders
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    sx={{ py: 1.5, color: "error.main" }}
                  >
                    <LoginIcon sx={{ mr: 2 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<LoginIcon />}
                onClick={handleOpenAuthModal}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  px: 3,
                  py: 1,
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Existing menus and modals remain the same */}
      <Menu
        anchorEl={locationAnchorEl}
        open={Boolean(locationAnchorEl)}
        onClose={handleLocationMenuClose}
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 2,
          sx: {
            maxWidth: "400px",
            padding: "16px",
            borderRadius: "8px",
          },
        }}
      >
        <Box sx={{ p: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "grey.700",
              mb: 1,
            }}
          >
            <LocationOnIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2">Current Location</Typography>
          </Box>

          <Typography
            variant="body1"
            sx={{ color: "grey.800", fontWeight: 500, mb: 2 }}
          >
            {location?.address}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "grey.600",
              mb: 2,
              borderTop: 1,
              borderColor: "grey.200",
              pt: 2,
            }}
          >
            Last updated: {new Date(location?.timestamp).toLocaleString()}
          </Typography>

          <Box sx={{ 
            width: '100%',
            display: 'flex',
            justifyContent: 'center' // Center the button container
          }}>
            <Button
              
              startIcon={<MapIcon />}
              onClick={() => {
                handleOpenLocationPicker();
                handleLocationMenuClose();
              }}
              sx={{
                mt: 1,
                textTransform: "none",
                borderRadius: 2,
                py: 1,
                px: 3, // Add horizontal padding
                minWidth: '200px', // Set a minimum width
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Set Location on Map
            </Button>
          </Box>

        </Box>
      </Menu>

      <Dialog
        open={isLocationPickerOpen}
        onClose={handleCloseLocationPicker}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            height: "80vh",
            display: "flex",
            flexDirection: "column"
          }
        }}
      >
        <DialogTitle>
          Pick Your Location
          <IconButton
            aria-label="close"
            onClick={handleCloseLocationPicker}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          padding: 0, 
          height: "calc(100% - 64px)",
          flexGrow: 1,
          display: "flex" 
        }}>
          {isLocationPickerOpen && (
            <LocationPicker
              initialPosition={
                location
                  ? [location.latitude, location.longitude]
                  : [12.2799972, 76.6520893]
              }
              onConfirm={handleConfirmLocation}
            />
          )}
        </DialogContent>
      </Dialog>
      <AuthModal open={isAuthModalOpen} onClose={handleCloseAuthModal} />
    </>
  );
};

export default Navbar;
