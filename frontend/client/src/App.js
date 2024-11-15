// src/App.js
import React from 'react';
import WelcomeViewContextProvider from "./Contexts/WelcomeViewContextProvider";
import Navbar from './Components/Navbar';
import HomePageBody from './Components/HomePageBody';
import FooterComponent from './Components/Footer';

const App = () => (
  <div>
    <WelcomeViewContextProvider>
    <Navbar />
    <HomePageBody />
    <FooterComponent />
    </WelcomeViewContextProvider>
  </div>
);

export default App;
