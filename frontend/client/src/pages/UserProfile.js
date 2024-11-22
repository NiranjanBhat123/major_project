import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  IconButton,
  TextField,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          throw new Error("No user ID found");
        }

        const response = await fetch(`http://127.0.0.1:8000/client/${userId}/`);
        const data = await response.json();

        setUser(data);
        setEditedUser(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`http://127.0.0.1:8000/client/${userId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedUser.name,
          mobile_number: editedUser.mobile_number,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error("Failed to update profile");
      }

      const updatedData = await response.json();
      console.log("Updated data:", updatedData);

      setUser((prevUser) => ({
        ...prevUser,
        name: updatedData.name,
        mobile_number: updatedData.mobile_number,
      }));

      setEditedUser(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("Failed to update profile. Please try again.");
    }
  };

  const renderProfileField = (icon, label, value, name) => {
    // Disable email editing
    if (name === "email") {
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            p: 2,
            backgroundColor: "background.light",
            borderRadius: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
            }
          }}
        >
          {React.cloneElement(icon, { 
            color: "secondary", 
            sx: { mr: 2, fontSize: 30 } 
          })}
          <Box sx={{ ml: 2 }}>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              sx={{ fontWeight: 600, mb: 0.5 }}
            >
              {label}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: "text.primary", 
                fontWeight: 500 
              }}
            >
              {value}
            </Typography>
          </Box>
        </Box>
      );
    }

    if (isEditing) {
      return (
        <TextField
          fullWidth
          label={label}
          name={name}
          value={editedUser[name] || ""}
          onChange={handleInputChange}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
          InputProps={{
            startAdornment: React.cloneElement(icon, { 
              color: "secondary", 
              sx: { mr: 2 } 
            }),
          }}
        />
      );
    }

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          p: 2,
          backgroundColor: "background.light",
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          }
        }}
      >
        {React.cloneElement(icon, { 
          color: "secondary", 
          sx: { mr: 2, fontSize: 30 } 
        })}
        <Box sx={{ ml: 2 }}>
          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            sx={{ fontWeight: 600, mb: 0.5 }}
          >
            {label}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: "text.primary", 
              fontWeight: 500 
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h5">Loading Profile...</Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h5">Unable to load profile</Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 4,
        mb: 8,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 3,
          position: "relative",
          backgroundColor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              color: "primary.main", 
              fontWeight: 700 
            }}
          >
            My Profile
          </Typography>
          {!isEditing ? (
            <IconButton 
              color="secondary" 
              onClick={() => setIsEditing(true)}
              sx={{
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                }
              }}
            >
              <EditIcon />
            </IconButton>
          ) : (
            <Box>
              <IconButton
                color="error"
                sx={{ 
                  mr: 2,
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}
                onClick={() => {
                  setEditedUser(user);
                  setIsEditing(false);
                }}
              >
                <CancelIcon />
              </IconButton>
              <IconButton 
                color="success" 
                onClick={handleSave}
                sx={{
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}
              >
                <SaveIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 4,
          }}
        >
          <Box
            sx={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.05)',
              border: '2px solid',
              borderColor: 'primary.light',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              position: 'relative',
            }}
          >
            <AccountCircleIcon 
              sx={{ 
                fontSize: 70, 
                color: 'primary.main',
                opacity: 0.7,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }} 
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 30,
                height: 30,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 2px 3px rgba(0,0,0,0.2)',
                border: '2px solid',
                borderColor: 'background.paper',
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'background.paper', 
                  fontWeight: 700,
                  fontSize: '0.7rem',
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Typography>
            </Box>
          </Box>
        </Box>

        {renderProfileField(
          <PersonIcon />,
          "Full Name",
          user.name,
          "name"
        )}

        {renderProfileField(
          <EmailIcon />,
          "Email Address",
          user.email,
          "email"
        )}

        {renderProfileField(
          <PhoneIcon />,
          "Mobile Number",
          user.mobile_number,
          "mobile_number"
        )}

        {errorMessage && (
          <Typography 
            color="error" 
            sx={{ 
              mt: 2, 
              textAlign: 'center',
              backgroundColor: 'rgba(255,23,68,0.1)',
              p: 1,
              borderRadius: 2 
            }}
          >
            {errorMessage}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default UserProfile;