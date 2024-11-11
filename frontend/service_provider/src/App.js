import React from "react";
import WelcomeViewContextProvider from "./Contexts/WelcomeViewContextProvider";
import { Box } from "@mui/material";
import Welcome from "./Components/Welcome";

const App = () => {
  return (
    <>
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
          <Welcome/>
        </Box>
      </WelcomeViewContextProvider>
    </>
  );
}

export default App;
