import React from "react";
import WelcomeViewContextProvider from "./Contexts/WelcomeViewContextProvider";
import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Welcome from "./Components/Welcome";
import Registration from "./Components/Registration";

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
          boxSizing: "border-box"
        }}
      >
        <Routes>
          <Route path="/" element={ <Welcome /> }/>
          <Route path="/registration" element={ <Registration /> }/>
        </Routes>
      </Box>
    </WelcomeViewContextProvider>
  );
}

export default App;
