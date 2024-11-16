import React, { useState } from "react";
import { useWelcomeViewContext } from "../Contexts/WelcomeViewContextProvider";
import { Typography, TextField, Button, Box, Link } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { requestAndStoreLocation } from "../utils/locationhandler.js";

const Login = () => {

  const { setEmpty, showSignUp, handleCloseAuthModal, handleLogin } =
    useWelcomeViewContext();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear errors when user starts typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: "", password: "", general: "" });

    try {
      const response = await fetch("http://127.0.0.1:8000/client/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different types of errors
        if (data.email) {
          setErrors((prev) => ({ ...prev, email: data.email[0] }));
        }
        if (data.password) {
          setErrors((prev) => ({ ...prev, password: data.password[0] }));
        }
        if (data.detail) {
          setErrors((prev) => ({ ...prev, general: data.detail }));
        }
        if (data.non_field_errors) {
          setErrors((prev) => ({ ...prev, general: data.non_field_errors[0] }));
        }
        return;
      }

      // Store tokens and user info in localStorage
      if (data.tokens) {
        localStorage.setItem("accessToken", data.tokens.access_token);
        localStorage.setItem("refreshToken", data.tokens.refresh_token);
      }
      // Inside handleSubmit function, after storing tokens and user info
      if (data.user) {
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userName", data.user.name);

        // Add location handling
        const locationSuccess = await requestAndStoreLocation(
          () => {
            handleLogin();
            handleCloseAuthModal();
          },
          (error) => {
            setErrors((prev) => ({
              ...prev,
              general: "Please enable location access to continue",
            }));
          }
        );

        if (!locationSuccess) {
          return; // Don't proceed until location is provided
        }
      }

      handleLogin();
      handleCloseAuthModal();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: "An error occurred during login. Please try again.",
      }));
      console.error("Login error:", err);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        height: "100%",
        width: "50%",
        bgcolor: "background.light",
        padding: "2rem",
        boxSizing: "border-box",
        overflow: "hidden",
        boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.1)",
        "@keyframes slideIn": {
          from: {
            transform: "translateX(100%)",
            opacity: 0,
          },
          to: {
            transform: "translateX(0)",
            opacity: 1,
          },
        },
        animation: "slideIn 0.5s ease-out forwards",
      }}
    >
      <CloseIcon
        onClick={setEmpty}
        sx={{
          position: "absolute",
          top: "1.5rem",
          right: "1.5rem",
          cursor: "pointer",
        }}
      />

      <Typography variant="h4" sx={{ mb: 2, color: "primary.main" }}>
        Login
      </Typography>

      <Box sx={{ width: "100%", maxWidth: "400px" }}>
        <TextField
          label="Email Address"
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          required
          type="email"
          error={!!errors.email}
          helperText={errors.email}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          required
          type="password"
          error={!!errors.password}
          helperText={errors.password}
          sx={{ mb: errors.general ? 1 : 3 }}
        />

        {errors.general && (
          <Typography
            color="error"
            variant="body2"
            sx={{ mb: 2, textAlign: "center" }}
          >
            {errors.general}
          </Typography>
        )}

        <Button type="submit" fullWidth variant="contained" sx={{ mb: 3 }}>
          Login
        </Button>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body1" sx={{ color: "text.muted" }}>
            Don't have an account?{" "}
            <Link
              component="button"
              onClick={showSignUp}
              sx={{ color: "secondary.main" }}
            >
              SignUp
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
