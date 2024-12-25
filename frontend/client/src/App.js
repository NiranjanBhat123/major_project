import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeViewContextProvider from "./contexts/WelcomeViewContextProvider";
import ServiceDetail from './pages/ServiceDetail.js';
import Navbar from './components/header/Navbar.js';
import Footer from './components/footer/Footer.js';
import HomePage from './components/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import OrdersList from './components/clientOrders/OrdersList.js';
import UserProfile from './pages/UserProfile.js';

const App = () => (
  <BrowserRouter>
    <WelcomeViewContextProvider>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/profile" element={<UserProfile/>} />
        <Route path="/service/:serviceId" element={<ProtectedRoute component={ServiceDetail} />} />
        <Route path="/orders" element={<ProtectedRoute component={OrdersList} />} />
      </Routes>
      <Footer/>
    </WelcomeViewContextProvider>
  </BrowserRouter>
);
export default App;