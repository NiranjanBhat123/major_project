import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeViewContextProvider from "./Contexts/WelcomeViewContextProvider";
import ServiceDetail from './pages/ServiceDetail.js';
import Navbar from './Components/header/Navbar.js';
import Footer from './Components/footer/Footer.js';
import HomePage from './Components/HomePage';
import ProtectedRoute from './Components/ProtectedRoute';
import ScrollToTop from './Components/ScrollToTop';
import OrdersList from './Components/clientOrders/OrdersList.js';
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