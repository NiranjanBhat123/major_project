import React, { useState, createContext, useContext } from 'react';

const WelcomeViewContext= createContext(null);

export const useWelcomeViewContext = () => useContext(WelcomeViewContext);

const WelcomeViewContextProvider = ({ children }) => {
  const [view, setView] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");

  const setEmpty = () => { setView(""); }
  const showSignUp = () => { setView("signup"); }
  const showLogin = () => { setView("login"); }
  const showOTP = () => { setView("otp"); }
  const updateSignUpEmail = (email) => { setSignUpEmail(email); }

  const contextValues = {
    view, signUpEmail, setEmpty, showSignUp, showLogin, showOTP, updateSignUpEmail
  };

  return (
    <WelcomeViewContext.Provider value={contextValues}>
      { children }
    </WelcomeViewContext.Provider>
  );
};

export default WelcomeViewContextProvider;
