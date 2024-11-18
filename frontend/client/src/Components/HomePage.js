import React from 'react'
import Navbar from './Navbar';
import HomePageBody from './HomePageBody';
import Footer from './Footer';
import MainServices from './MainServices'

const HomePage = () => {
  return (
    <>
    <Navbar/>
    <HomePageBody/>
    <MainServices/>

    <Footer/>
    </>
  )
}

export default HomePage;