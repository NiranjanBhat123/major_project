import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeViewContextProvider from "./Contexts/WelcomeViewContextProvider";
import HomePage from "./Components/HomePage";


const App = () => (
  <BrowserRouter>
    <WelcomeViewContextProvider>
          <Routes>
            
            <Route path="/" element={<HomePage />} />
          </Routes>
    </WelcomeViewContextProvider>
  </BrowserRouter>
);

export default App;