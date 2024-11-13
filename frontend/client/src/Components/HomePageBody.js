import React, { useState } from 'react';
import { Typography, Box, IconButton, Grid } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import { MainContainer, ServiceCard, ServiceCardMedia } from './StyledComponents';
import { styled } from '@mui/system';

const SliderContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  padding: `${theme.spacing(2)} ${theme.spacing(6)}`,
  minHeight: '400px', 
}));

const CardsWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  transition: 'transform 0.5s ease',
  height: '80%', // Ensure full height
}));

const SliderButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  '&:hover': {
    backgroundColor: theme.palette.background.paper,
    opacity: 0.9,
  },
  zIndex: 1,
}));

const services = [
  {
    title: 'Plumbing',
    image: 'https://thumbor.forbes.com/thumbor/fit-in/900x510/https://www.forbes.com/home-improvement/wp-content/uploads/2022/09/featured-image-plumbing.jpeg.jpg',
  },
  {
    title: 'Electrical',
    image: 'https://www.capitalhomeelectrical.com.au/wp-content/uploads/2021/07/electrical-repair.jpg',
  },
  {
    title: 'Cleaning',
    image: 'https://cdn.prod.website-files.com/60eece3229f951ea48ce43b4/6638df8d1ce1f556221e1c05_how-often-should-you-clean-everything-in-your-house.webp',
  },
  {
    title: 'Carpentry',
    image: 'https://images.squarespace-cdn.com/content/v1/5f4fdc32f4dacb6dc0cac51c/1620949301795-U6S42YRZSPW4ARV3NLV0/carpentry+image.jpg',
  },
];

const HomePageBody = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsToShow = 3;

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + cardsToShow >= services.length ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? services.length - cardsToShow : prevIndex - 1
    );
  };

  return (
    <MainContainer>
      <Typography variant="h4" align="center" gutterBottom>
        Welcome to FixNGo
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
        Your one-stop solution for trusted home repair and maintenance services.
      </Typography>

      <Box mt={4} mb={4}>
        <Typography variant="h5" align="center" gutterBottom>
          Our Services
        </Typography>
        <SliderContainer>
          <SliderButton
            onClick={handlePrev}
            sx={{ left: theme => theme.spacing(1) }}
          >
            <ChevronLeftIcon />
          </SliderButton>
          <CardsWrapper
            sx={{
              transform: `translateX(-${(currentIndex * (100 / cardsToShow))}%)`,
            }}
          >
            {services.map((service, index) => (
              <Box
                key={index}
                sx={{
                  flex: `0 0 ${100 / cardsToShow}%`,
                  padding: theme => theme.spacing(1),
                }}
              >
                <ServiceCard>
                  <ServiceCardMedia image={service.image} title={service.title} />
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6">{service.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reliable {service.title.toLowerCase()} services at your doorstep.
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, mt: 'auto' }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <IconButton
                          color="primary"
                          size="small"
                          sx={{ width: '100%' }}
                        >
                          <CallIcon />
                        </IconButton>
                      </Grid>
                      <Grid item xs={6}>
                        <IconButton
                          color="primary"
                          size="small"
                          sx={{ width: '100%' }}
                        >
                          <EmailIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                </ServiceCard>
              </Box>
            ))}
          </CardsWrapper>
          <SliderButton
            onClick={handleNext}
            sx={{ right: theme => theme.spacing(1) }}
          >
            <ChevronRightIcon />
          </SliderButton>
        </SliderContainer>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" align="center" gutterBottom>
          About Us
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          FixNGo is dedicated to providing quality home repair services with trained and vetted professionals. We ensure
          that your experience is seamless, safe, and satisfactory.
        </Typography>
      </Box>
    </MainContainer>
  );
};

export default HomePageBody;


