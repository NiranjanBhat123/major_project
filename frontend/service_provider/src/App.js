import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Box } from "@mui/material";

// Context and Component Imports
import WelcomeViewContextProvider from "./Contexts/WelcomeViewContextProvider";
import ProtectedRoute from "./Components/ProtectedRoute";
import WelcomePage from "./Components/WelcomePage";
import RegistrationPage from "./Components/RegistrationPage";
import MainPage from "./Components/MainPage";
import ServiceProviderProfile from "./Components/ServiceProviderProfile";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import OrderHistory from "./Components/OrderHistory";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [location, setLocation] = useState(null);
  const navigate = useNavigate();
  const currentLocation = useLocation();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const accessToken = localStorage.getItem('accessToken');
      console.log("Checking Authentication - Access Token:", accessToken);

      // Set authentication state
      const authenticated = !!accessToken;
      setIsAuthenticated(authenticated);

      // Load additional user details if authenticated
      if (authenticated) {
        const name = localStorage.getItem("providerName");
        if (name) setUserName(name);

        const storedLocation = localStorage.getItem("userLocation");
        if (storedLocation) {
          try {
            const locationData = JSON.parse(storedLocation);
            setLocation(locationData);
          } catch (error) {
            console.error("Error parsing location:", error);
          }
        }

        // If authenticated and on root path, redirect to main
        if (currentLocation.pathname === "/" || currentLocation.pathname === "/registration") {
          navigate("/main");
        }
      }
    };

    // Run authentication check
    checkAuth();
  }, [navigate, currentLocation.pathname]);

  // Determine routes that should have Navbar and Footer
  const protectedRoutes = ['/main', '/profile','/orders'];
  const showNavbarAndFooter = isAuthenticated && protectedRoutes.includes(currentLocation.pathname);

  return (
    <WelcomeViewContextProvider>
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Navbar only for protected routes */}
        {showNavbarAndFooter && (
          <Navbar userName={userName} location={location} />
        )}

        <Box
          sx={{
            flexGrow: 1,
            width: "100%",
          }}
        >
          <Routes>
            {/* Conditional routing based on authentication */}
            <Route 
              path="/" 
              element={isAuthenticated ? <Navigate to="/main" replace /> : <WelcomePage />} 
            />
            <Route 
              path="/registration" 
              element={isAuthenticated ? <Navigate to="/main" replace /> : <RegistrationPage />} 
            />
            <Route
              path="/main"
              element={
                <ProtectedRoute>
                  <MainPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ServiceProviderProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Box>
        {showNavbarAndFooter && <Footer />}
      </Box>
    </WelcomeViewContextProvider>
  );
};

export default App;