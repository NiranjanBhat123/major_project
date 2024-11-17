import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeViewContextProvider from "./Contexts/WelcomeViewContextProvider";
import HomePage from "./Components/HomePage";
import ServiceDetails from "./Components/ServiceDetails"; // New import

const App = () => (
  <BrowserRouter>
    <WelcomeViewContextProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/service/:serviceId" element={<ServiceDetails />} />
      </Routes>
    </WelcomeViewContextProvider>
  </BrowserRouter>
);

export default App;