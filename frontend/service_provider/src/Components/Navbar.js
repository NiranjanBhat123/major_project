import React, { useState } from "react";
import {
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  IconButton,
  Divider,
  ListItemIcon,
} from "@mui/material";
import {
  AccountCircle,
  EventNote,
  Logout,
  LocationOn,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import ModifyServicesModal from "./ModifyServicesModal";
import NotificationMenu from "./NotificationMenu";

const Navbar = ({ userName, location }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [modifyServicesModalOpen, setModifyServicesModalOpen] = useState(false);
  const open = Boolean(anchorEl);

  const getFormattedLocation = () => {
    if (!location?.address) return "Location not available";
    const addressParts = location.address.split(",");
    return [addressParts[2], addressParts[5]].join(", ").trim();
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("providerId");
    localStorage.removeItem("providerName");
    localStorage.removeItem("providerEmail");
    localStorage.removeItem("mainServiceId");
    navigate("/");
  };

  const handleModifyServicesClick = () => {
    handleClose(); // Close the menu
    setModifyServicesModalOpen(true);
  };

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          height: "70px",
          zIndex: 1100,
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 10px",
            width: "100%",
          }}
        >
          <NotificationMenu
            userId={localStorage.getItem("userId")}
            userType="service_provider"
          />
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Typography
              variant="title"
              sx={{
                color: "secondary.main",
                fontSize: "2rem",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
              }}
            >
              FixNGo
            </Typography>
          </Link>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "background.paper",
                borderRadius: "1.5rem",
                bgcolor: "secondary.main",
                padding: "0.5rem",
              }}
            >
              <LocationOn sx={{ fontSize: "1.2rem" }} />
              <Typography sx={{ fontSize: "1rem" }}>
                {getFormattedLocation()}
              </Typography>
            </Box>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleClick}
                size="small"
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "secondary.main",
                    color: "background.paper",
                  }}
                >
                  {userName.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                bgcolor: "background.paper",
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem>
            <ListItemIcon>
              <AccountCircle fontSize="small" sx={{ color: "text.muted" }} />
            </ListItemIcon>
            <Link
              to="/profile"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Profile
            </Link>
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <EventNote fontSize="small" sx={{ color: "text.muted" }} />
            </ListItemIcon>
            <Link
              to="/orders"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Order History
            </Link>
          </MenuItem>
          <MenuItem onClick={handleModifyServicesClick}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" sx={{ color: "text.muted" }} />
            </ListItemIcon>
            Modify Services
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" sx={{ color: "text.muted" }} />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
      <ModifyServicesModal
        open={modifyServicesModalOpen}
        onClose={() => setModifyServicesModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
