import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, CircularProgress, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ServiceDetails = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubServices = async () => {
      try {
        setLoading(true);
        // Add trailing slash to URL to handle Django's APPEND_SLASH setting
        const response = await fetch(`http://127.0.0.1:8000/services/${serviceId}/subservices/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            // Add any authentication headers if needed
            // 'Authorization': 'Bearer your-token-here'
          },
          credentials: 'include', // Include if you're using session authentication
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch sub-services');
        }

        const data = await response.json();
        if (data.status) {
          setServiceData(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch sub-services');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubServices();
  }, [serviceId]);

  // Rest of the component remains the same
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" sx={{ mt: 4, textAlign: 'center' }}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <IconButton 
          onClick={() => navigate('/')} 
          sx={{ mb: 2 }}
          aria-label="back to services"
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          {serviceData?.results[0]?.main_service_name || 'Services'}
        </Typography>
        
        {serviceData?.results.length > 0 ? (
          <Box>
            {serviceData.results.map((subService) => (
              <Box 
                key={subService.id} 
                sx={{ 
                  mb: 2, 
                  p: 3, 
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    backgroundColor: '#f9f9f9'
                  }
                }}
              >
                <Box>
                  <Typography variant="h6" component="h2">
                    {subService.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Available Providers: {subService.providers_count}
                  </Typography>
                </Box>
                
                {subService.providers_count > 0 && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'success.main',
                      backgroundColor: 'success.light',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1
                    }}
                  >
                    Available
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography sx={{ textAlign: 'center' }}>
            No sub-services found for this category.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default ServiceDetails;