import React, { useState, createContext, useContext } from 'react';

const WelcomeViewContext= createContext(null);

export const useWelcomeViewContext = () => useContext(WelcomeViewContext);

const WelcomeViewContextProvider = ({ children }) => {
  const [view, setView] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const setEmpty = () => { setView(""); }
  const showSignUp = () => { setView("signup"); }
  const showLogin = () => { setView("login"); }
  const showOTP = () => { setView("otp"); }
  const updateSignUpEmail = (email) => { setSignUpEmail(email); }

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const contextValues = {
    view, signUpEmail,isAuthModalOpen,isLoggedIn,setEmpty, showSignUp, showLogin, showOTP, updateSignUpEmail,handleCloseAuthModal,handleOpenAuthModal,handleLogin,handleLogout
  };

  return (
    <WelcomeViewContext.Provider value={contextValues}>
      { children }
    </WelcomeViewContext.Provider>
  );
};

export default WelcomeViewContextProvider;
