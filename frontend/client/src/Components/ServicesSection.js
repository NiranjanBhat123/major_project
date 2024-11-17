import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  width: '200px',
  height: '200px',
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
  width: '60%',
  height: '60%',
  objectFit: 'contain',
});

// Updated services array with unique IDs
const services = [
  { id: 'plumbing', name: 'Plumbing', image: 'https://media.istockphoto.com/id/1273820684/vector/plumbing-installation-rgb-color-icon.jpg?s=612x612&w=0&k=20&c=5iiyfZnB_mPGqsyPpkJpXe4Wlkm768QreV43Wjh5FqE=' },
  { id: 'electrical', name: 'Electrical', image: 'https://img.freepik.com/free-vector/hand-drawn-electrician-cartoon-illustration_52683-152426.jpg' },
  { id: 'cleaning', name: 'House Cleaning', image: 'https://media.istockphoto.com/id/876741676/vector/cleaning-equipment-cleaning-service-concept-poster-template-for-house-cleaning-services-with.jpg?s=612x612&w=0&k=20&c=F01MJBwfV2PO371-EuBLUFkCxwnPlMZgrNV4-1jErYU=' },
  { id: 'carpentry', name: 'Carpentry', image: 'https://via.placeholder.com/100' },
  { id: 'painting', name: 'Painting', image: 'https://via.placeholder.com/100' },
  { id: 'appliance', name: 'Appliance Repair', image: 'https://via.placeholder.com/100' },
  { id: 'landscaping', name: 'Landscaping', image: 'https://via.placeholder.com/100' },
  { id: 'hvac', name: 'HVAC Services', image: 'https://via.placeholder.com/100' },
  { id: 'roof', name: 'Roof Repair', image: 'https://via.placeholder.com/100' },
];

const ServicesSection = () => {
  const navigate = useNavigate();

  const handleServiceClick = (serviceId) => {
    navigate(`/service/${serviceId}`);
  };

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
        {services.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.id}>
            <ServiceContainer onClick={() => handleServiceClick(service.id)}>
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