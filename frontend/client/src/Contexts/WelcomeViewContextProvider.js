import React, { useState, createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const WelcomeViewContext = createContext(null);

export const useWelcomeViewContext = () => useContext(WelcomeViewContext);

const WelcomeViewContextProvider = ({ children }) => {
  const [view, setView] = useState("");
  const [signUpData, setSignUpData] = useState(null);
  const [signUpEmail, setSignUpEmail] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedSubService, setSelectedSubService] = useState(null);
  const navigate = useNavigate();
  // Check authentication status on mount and after any localStorage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const accessToken = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      if (accessToken && userId ) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    // Check on mount
    checkAuthStatus();

    // Listen for localStorage changes
    window.addEventListener('storage', checkAuthStatus);

    // Cleanup listener
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  const setEmpty = () => { setView(""); setSignUpData(null); }
  const showSignUp = () => { setView("signup"); setSignUpData(null); }
  const showLogin = () => { setView("login"); setSignUpData(null); }
  const showOTP = () => { setView("otp"); }
  const updateSignUpEmail = (email) => { setSignUpEmail(email); }
  const updateSignUpData = (data) => { setSignUpData(data); }

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
    setEmpty();
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userLocation');
    setIsLoggedIn(false);
    setEmpty();
    setIsAuthModalOpen(false);
    setSignUpEmail("");
    navigate("/");
  };

  const contextValues = {
    view, 
    signUpEmail,
    signUpData,
    isAuthModalOpen,
    isLoggedIn,
    selectedSubService,
    setEmpty, 
    showSignUp, 
    showLogin, 
    showOTP, 
    updateSignUpEmail,
    updateSignUpData,
    handleCloseAuthModal,
    handleOpenAuthModal,
    handleLogin,
    handleLogout,
    setSelectedSubService,
  };

  return (
    <WelcomeViewContext.Provider value={contextValues}>
      {children}
    </WelcomeViewContext.Provider>
  );
};

export default WelcomeViewContextProvider;