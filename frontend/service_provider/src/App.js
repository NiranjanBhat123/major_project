import React from "react";
import WelcomeViewContextProvider from "./Contexts/WelcomeViewContextProvider";
import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import ProtectedRoute from "./Components/ProtectedRoute";
import WelcomePage from "./Components/WelcomePage";
import RegistrationPage from "./Components/RegistrationPage";
import MainPage from "./Components/MainPage";
import ServiceProviderProfile from "./Components/ServiceProviderProfile";

const App = () => {
  return (
    <WelcomeViewContextProvider>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          width: "100%",
          height: "100vh",
          p: "8px",
          bgcolor: "background.paper",
          boxSizing: "border-box",
        }}
      >
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/registration" element={<RegistrationPage />} />
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
        </Routes>
      </Box>
    </WelcomeViewContextProvider>
  );
};

export default App;
