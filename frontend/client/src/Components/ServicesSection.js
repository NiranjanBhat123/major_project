import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { styled } from '@mui/system';

const ServiceContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  cursor: 'pointer',
  '&:hover .service-name': {
    textDecoration: 'underline',
  },
}));

const ServiceCircle = styled(Box)(({ theme }) => ({
  width: '200px', // Circle size
  height: '200px', // Circle size
  backgroundColor: '#f0f4f8',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
  },
}));

const ServiceImage = styled('img')({
  width: '60%', // Image size relative to circle
  height: '60%',
  objectFit: 'contain',
});

const services = [
    { name: 'Plumbing', image: 'https://media.istockphoto.com/id/1273820684/vector/plumbing-installation-rgb-color-icon.jpg?s=612x612&w=0&k=20&c=5iiyfZnB_mPGqsyPpkJpXe4Wlkm768QreV43Wjh5FqE=' },
    { name: 'Electrical', image: 'https://img.freepik.com/free-vector/hand-drawn-electrician-cartoon-illustration_52683-152426.jpg' },
    { name: 'House Cleaning', image: 'https://media.istockphoto.com/id/876741676/vector/cleaning-equipment-cleaning-service-concept-poster-template-for-house-cleaning-services-with.jpg?s=612x612&w=0&k=20&c=F01MJBwfV2PO371-EuBLUFkCxwnPlMZgrNV4-1jErYU=' },
  { name: 'Carpentry', image: 'https://via.placeholder.com/100' },
  { name: 'Painting', image: 'https://via.placeholder.com/100' },
  { name: 'Appliance Repair', image: 'https://via.placeholder.com/100' },
  { name: 'Landscaping', image: 'https://via.placeholder.com/100' },
  { name: 'HVAC Services', image: 'https://via.placeholder.com/100' },
  { name: 'Roof Repair', image: 'https://via.placeholder.com/100' },
];

const ServicesSection = () => {
  return (
    <Box sx={{ py: 6, backgroundColor: '#ffffff' }}>
      <Typography
        variant="h4"
        component="h2"
        sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}
      >
        Order Your Services
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {services.map((service, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <ServiceContainer>
              <ServiceCircle>
                <ServiceImage src={service.image} alt={service.name} />
              </ServiceCircle>
              <Typography
                variant="body1"
                className="service-name"
                sx={{ mt: 2 }}
              >
                {service.name}
              </Typography>
            </ServiceContainer>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ServicesSection;
