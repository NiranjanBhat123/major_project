import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Paper,
  Fade,
} from "@mui/material";
import { motion, AnimatePresence} from 'framer-motion';
import { useWelcomeViewContext } from "../contexts/WelcomeViewContextProvider";
import { ServiceProviderCard, SubServiceCard } from "../components/StyledComponents";



const LoadingAnimation = () => {
  const theme = useTheme();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" py={6}>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: `4px solid ${theme.palette.primary.light}`,
          borderTop: `4px solid ${theme.palette.primary.main}`,
          animation: "spin 1s linear infinite",
          mb: 2,
          "@keyframes spin": {
            "0%": {
              transform: "rotate(0deg)",
            },
            "100%": {
              transform: "rotate(360deg)",
            },
          },
        }}
      />
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          animation: "pulse 1.5s ease-in-out infinite",
          "@keyframes pulse": {
            "0%, 100%": {
              opacity: 1,
            },
            "50%": {
              opacity: 0.5,
            },
          },
        }}
      >
        Finding service providers near you...
      </Typography>
    </Box>
  );
};

const ServiceDetail = () => {
  const theme = useTheme();
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [subServices, setSubServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [error, setError] = useState(null);
  const { selectedSubService, setSelectedSubService,location } = useWelcomeViewContext();
  const [isInitialMount, setIsInitialMount] = useState(true);

  const subServicesContainerRef = useRef(null);
  const subServiceRefs = useRef({});
  const scrollTimeoutRef = useRef(null);

  // Improved smooth scrolling function
  const smoothScrollToSubService = useCallback((element, retryCount = 0) => {
    if (element && subServicesContainerRef.current) {
      const container = subServicesContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Check if element is properly rendered
      if (elementRect.height === 0 && retryCount < 5) {
        // Retry after a short delay
        setTimeout(() => {
          smoothScrollToSubService(element, retryCount + 1);
        }, 100);
        return;
      }

      const offsetTop = elementRect.top - containerRect.top + container.scrollTop;
      const containerHeight = container.clientHeight;
      const elementHeight = element.clientHeight;

      const scrollPosition = offsetTop - (containerHeight / 2) + (elementHeight / 2);

      // Clear any existing scroll timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set a new timeout for scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        container.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, []);

  // Effects and other methods remain the same...

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const [serviceResponse, subServicesResponse] = await Promise.all([
          fetch(`http://127.0.0.1:8000/services/${serviceId}/`),
          fetch(`http://127.0.0.1:8000/services/${serviceId}/subservices/`),
        ]);

        if (!serviceResponse.ok || !subServicesResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const serviceData = await serviceResponse.json();
        const subServicesData = await subServicesResponse.json();

        if (serviceData.status && serviceData.data) {
          setService(serviceData.data);
        }

        if (subServicesData.status && subServicesData.data) {
          setSubServices(subServicesData.data.results);
          if (subServicesData.data.results.length > 0 && !selectedSubService) {
            setSelectedSubService(subServicesData.data.results[0]);
          }
        }
      } catch (err) {
        setError("Failed to load service details");
        console.error("Error fetching service details:", err);
      } finally {
        setLoading(false);
        setIsInitialMount(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId]);


  useEffect(() => {
    const fetchProviders = async () => {
      if (!selectedSubService?.id) return;
  
      try {
        setLoadingProviders(true);
        await new Promise((resolve) => setTimeout(resolve, 200));
  
        // Get client's location from localStorage
        const locationDataString = localStorage.getItem('userLocation');
        
        // Build base URL
        const url = new URL(`http://127.0.0.1:8000/service_providers/${selectedSubService.id}/providers/`);
        
        // Add location parameters if available
        if (locationDataString) {
          try {
            const locationData = JSON.parse(locationDataString);
            
            if (locationData.latitude && locationData.longitude) {
              url.searchParams.append('latitude', locationData.latitude.toString());
              url.searchParams.append('longitude', locationData.longitude.toString());
              url.searchParams.append('radius', '25'); // 25km radius
            } else {
              console.log('Location data invalid');
            }
          } catch (error) {
            console.error('Error parsing location data:', error);
          }
        }
  
        const response = await fetch(url);
  
        if (!response.ok) throw new Error("Failed to fetch providers");
  
        const data = await response.json();
        if (data) {
          setProviders(data);
        }
      } catch (err) {
        setError("Failed to load providers");
        console.error("Error fetching providers:", err);
      } finally {

        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoadingProviders(false);

      }
    };
  
    fetchProviders();
  }, [selectedSubService,location]);

  useEffect(() => {
    if (!loading && selectedSubService && subServiceRefs.current[selectedSubService.id]) {
      const element = subServiceRefs.current[selectedSubService.id];
      
      // Add a small delay to ensure DOM is ready
      const scrollTimeout = setTimeout(() => {
        smoothScrollToSubService(element);
      }, isInitialMount ? 300 : 100); // Longer delay on initial mount
      
      return () => clearTimeout(scrollTimeout);
    }
  }, [selectedSubService, loading, smoothScrollToSubService, isInitialMount]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Rest of the render method, with some styling modifications
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <LoadingAnimation />
      </Box>
    );
  }

  if (error) {
    return (
      <Box maxWidth="md" mx="auto" p={4}>
        <Paper
          sx={{
            p: 3,
            bgcolor: "error.light",
            borderLeft: `4px solid ${theme.palette.error.main}`,
            borderRadius: 2,
          }}
        >
          <Typography color="error.main" fontWeight="medium">
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }


  return (
    <Box 
      sx={{
        display: 'flex',
        minHeight: '100vh',
        height: 'calc(100vh - 64px)', // Subtract height of footer/header
        bgcolor: 'background.default',
      }}
    >
      {/* Left Section */}
      <Box 
        sx={{ 
          width: '35%', 
          height: 'calc(100vh - 64px)', // Match parent's height
          p: 2,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 3,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
            Available Services
          </Typography>
          <Box
            ref={subServicesContainerRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 1,
              border: `1px solid #D3D3D3`, 
              borderRadius: 2,
              elevation:5,
              // Custom scrollbar styling
              '&::-webkit-scrollbar': {
                width: 8,
                position: 'absolute',
                right: 0,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.primary.light,
                borderRadius: 4,
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                },
              },
            }}
          >
            {subServices.map((subService) => (
              <Box
                key={subService.id}
                ref={(el) => {
                  if (el) subServiceRefs.current[subService.id] = el;
                }}
                sx={{
                  mt: 1, // Add margin to prevent top overflow
                  mb: 2,
                  transition: 'all 0.3s ease',
                }}
              >
                <SubServiceCard
                  subService={subService}
                  isSelected={selectedSubService?.id === subService.id}
                  onClick={() => setSelectedSubService(subService)}
                />
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Right section remains the same */}
      <Box 
        sx={{ 
          width: '65%', 
          p: 2,
          overflowY: 'auto' 
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '24px' }}
        >
          <Typography
            variant="h1"
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {service?.name}
          </Typography>
        </motion.div>

        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 3,
            mb: 4,
          }}
        >
          <Typography variant="h4" gutterBottom>
            {selectedSubService?.name}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            {providers.length} Service Providers Available
          </Typography>

          <AnimatePresence mode="wait">
            {loadingProviders ? (
              <Fade in timeout={200}>
                <Box>
                  <LoadingAnimation />
                </Box>
              </Fade>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {providers.length > 0 ? (
                  providers.map((provider, index) => (
                    <ServiceProviderCard
                      key={provider.id}
                      provider={provider}
                      index={index}
                    />
                  ))
                ) : (
                  <Box textAlign="center" py={6}>
                    <Typography
                      variant="h5"
                      color="text.secondary"
                      gutterBottom
                    >
                      No service providers available
                    </Typography>
                    <Typography color="text.disabled">
                      Please check back later or try a different service
                    </Typography>
                  </Box>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Paper>
      </Box>

    </Box>
  );
};

export default ServiceDetail;