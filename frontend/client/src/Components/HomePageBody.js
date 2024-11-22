import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import womenHair from '../images/service_images/women_hair.jpg';
import menSalon from '../images/service_images/men_salon.webp';
import homeCleaning from '../images/service_images/home_cleaning.jpg';
import electrician from '../images/service_images/electrician.jpg';
import applianceRepair from '../images/service_images/appliance_repair.webp';
import painting from '../images/service_images/painting_service.webp';
import carpenter from '../images/service_images/carpenter.jpg';

const ServiceCard = ({ title, icon, description, rating, startingPrice }) => (
  <Box 
    sx={{
      p: 4,
      bgcolor: 'background.paper',
      borderRadius: 3,
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.light}25`
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
      }
    }}
  >
    <Box
      sx={{
        width: '100%',
        height: '160px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mb: 3,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <img
        src={icon}
        alt={title}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 1,
          left: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
          px: 1.5,
          py: 0.75,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}
      >
        <Star size={16} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {rating}
        </Typography>
      </Box>
    </Box>
    
    <Typography
      variant="h6"
      sx={{
        fontWeight: 600,
        color: 'text.primary',
        mb: 1
      }}
    >
      {title}
    </Typography>
    
    <Typography
      variant="body2"
      sx={{
        color: 'text.secondary',
        mb: 2
      }}
    >
      {description}
    </Typography>
    
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography
        variant="body2"
        sx={{
          color: 'primary.main',
          fontWeight: 600
        }}
      >
        From {startingPrice}
      </Typography>
    </Box>
  </Box>
);

const ServiceSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const services = [
    {
      title: "Women's Salon & Spa",
      description: "Professional beauty services at home",
      rating: 4.8,
      startingPrice: "₹499",
      image: womenHair,
      category: "salon"
    },
    {
      title: "Men's Salon & Massage",
      description: "Expert grooming & relaxation",
      rating: 4.7,
      startingPrice: "₹399",
      image: menSalon,
      category: "salon"
    },
    {
      title: "Cleaning & Pest Control",
      description: "Deep cleaning & sanitization",
      rating: 4.6,
      startingPrice: "₹699",
      image: homeCleaning,
      category: "cleaning"
    },
    {
      title: "Electrician Services",
      description: "Quick repair & installation",
      rating: 4.9,
      startingPrice: "₹299",
      image: electrician,
      category: "repair"
    },
    {
      title: "Appliance Repair",
      description: "Expert maintenance & service",
      rating: 4.5,
      startingPrice: "₹599",
      image: applianceRepair,
      category: "repair"
    },
    {
      title: "Painting Services",
      description: "Transform your space",
      rating: 4.7,
      startingPrice: "₹999",
      image: painting,
      category: "home"
    },
    {
      title: "Carpentry Work",
      description: "Custom furniture & repairs",
      rating: 4.8,
      startingPrice: "₹799",
      image: carpenter,
      category: "home"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === services.length - 3 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? services.length - 3 : prevIndex - 1
    );
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ 
      width: '100%', 
      py: 8,
      background: (theme) => `linear-gradient(to bottom, ${theme.palette.primary.light}15, ${theme.palette.primary.light}05, ${theme.palette.background.paper})`
    }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Popular Services
        </Typography>
        
        <Typography variant="body1" sx={{ 
          textAlign: 'center', 
          color: 'text.secondary',
          mb: 6,
          maxWidth: '600px',
          mx: 'auto'
        }}>
          Discover our most booked services with top-rated professionals ready to help
        </Typography>
        
        <Box sx={{ position: 'relative' }}>
          <Button
            onClick={prevSlide}
            sx={{
              minWidth: 'auto',
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              p: 1.5,
              borderRadius: '50%',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) scale(1.1)',
              }
            }}
          >
            <ChevronLeft size={24} />
          </Button>
          
          <Box sx={{ overflow: 'hidden', mx: 4 }}>
            <Box 
              sx={{
                display: 'flex',
                gap: 3,
                transition: 'transform 0.5s ease-out',
                transform: `translateX(-${currentIndex * (100 / 3)}%)`
              }}
            >
              {services.map((service, index) => (
                <Box 
                  key={index}
                  sx={{
                    minWidth: 'calc(33.333% - 16px)',
                    transform: 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ServiceCard
                    title={service.title}
                    icon={service.image}
                    description={service.description}
                    rating={service.rating}
                    startingPrice={service.startingPrice}
                  />
                </Box>
              ))}
            </Box>
          </Box>
          
          <Button
            onClick={nextSlide}
            sx={{
              minWidth: 'auto',
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              p: 1.5,
              borderRadius: '50%',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) scale(1.1)',
              }
            }}
          >
            <ChevronRight size={24} />
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 4 }}>
          {Array.from({ length: services.length - 2 }).map((_, index) => (
            <Button
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                minWidth: 'auto',
                width: index === currentIndex ? 32 : 8,
                height: 8,
                p: 0,
                borderRadius: 4,
                bgcolor: index === currentIndex ? 'primary.main' : 'primary.light',
                '&:hover': {
                  bgcolor: index === currentIndex ? 'primary.main' : 'primary.main',
                }
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ServiceSlider;
