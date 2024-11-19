import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeViewContextProvider from "./Contexts/WelcomeViewContextProvider";
import HomePage from "./Components/HomePage";
import ServiceDetail from './pages/ServiceDetail.js';

const App = () => (
  <BrowserRouter>
    <WelcomeViewContextProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/service/:serviceId" element={<ServiceDetail />} />
          </Routes>
    </WelcomeViewContextProvider>
  </BrowserRouter>
);

export default App;