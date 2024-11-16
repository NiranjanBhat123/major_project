// src/App.js
import React from 'react';
import WelcomeViewContextProvider from "./Contexts/WelcomeViewContextProvider";
import HomePage from "./Components/HomePage";


const App = () => (
  <div>
    <WelcomeViewContextProvider>
    <HomePage/>
    </WelcomeViewContextProvider>
  </div>
);

export default App;
