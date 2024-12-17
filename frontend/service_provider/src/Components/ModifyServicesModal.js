import React, { useState, useEffect } from 'react';
import {
  Modal, Box, Typography, TextField, IconButton, Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
  AddCircleOutline as AddIcon
} from '@mui/icons-material';
import axios from 'axios';

const ModifyServicesModal = ({ open, onClose }) => {
  const [currentServices, setCurrentServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [newServicePrices, setNewServicePrices] = useState({});

  const providerId = localStorage.getItem('providerId');
  const mainServiceId = localStorage.getItem('mainServiceId');

  useEffect(() => {
    if(open) fetchCurrentServices();
  }, [open]);

  useEffect(() => {
    fetchAvailableServices();
  }, [currentServices]);

  const fetchCurrentServices = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/service_providers/${providerId}/`);
      setCurrentServices(response.data.provider_services);
    } catch(error) {
      console.error('Error fetching current services:', error);
    }
  };

  const fetchAvailableServices = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/services/${mainServiceId}/subservices/`);
      const currentServiceIds = currentServices.map(service => service.sub_service.id);
      const filteredServices = response.data.data.results.filter(
        service => !currentServiceIds.includes(service.id)
      );
      setAvailableServices(filteredServices);
    } catch(error) {
      console.error('Error fetching available services:', error);
    }
  };

  const handleRemoveService = async (serviceId) => {
    try {
      await axios.post(`http://127.0.0.1:8000/service_providers/${providerId}/remove-services/`, {
        service_ids: [serviceId]
      });

      // Find the removed service to add back to available services
      const removedService = currentServices.find(
        service => service.id === serviceId
      )?.sub_service;

      // Update state
      setCurrentServices(current =>
        current.filter(service => service.id !== serviceId)
      );
      
      if(removedService) {
        setAvailableServices(available => [...available, removedService]);
      }
    } catch(error) {
      console.error('Error removing service:', error);
    }
  };

  const handleAddService = async (service) => {
    const price = newServicePrices[service.id];

    if(!price) {
      alert('Please enter a price for the service');
      return;
    }

    try {
      await axios.post(`http://127.0.0.1:8000/service_providers/${providerId}/add-services/`, {
        services: [{
          sub_service: service.id,
          price: price
        }]
      });

      await fetchCurrentServices();

      setAvailableServices(available =>
        available.filter(availService => availService.id !== service.id)
      );

      // Reset price input
      setNewServicePrices(prev => {
        const newPrices = { ...prev };
        delete newPrices[service.id];
        return newPrices;
      });
    } catch(error) {
      console.error('Error adding service:', error);
    }
  };

  const handlePriceChange = (serviceId, price) => {
    setNewServicePrices(prev => ({
      ...prev,
      [serviceId]: price
    }));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modify-services-modal"
    >
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 650,
          bgcolor: 'background.paper',
          boxShadow: 3,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          p: 3
        }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2
        }}>
          <Typography variant="h5" component="h2">
            Modify Services
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon/>
          </IconButton>
        </Box>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Current Services Section */}
          <Paper
            variant="outlined"
            sx={{
              flex: '1 1 50%',
              overflow: 'auto',
              mb: 2,
              p: 2,
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Current Services
            </Typography>
            {currentServices.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No services added yet
              </Typography>
            ) : (
              currentServices.map((service) => (
                <Box
                  key={service.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                    p: 1,
                    bgcolor: 'background.light',
                    borderRadius: 1
                  }}
                >
                  <Typography>{service.sub_service.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ mr: 2 }}>₹{service.price}</Typography>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleRemoveService(service.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))
            )}
          </Paper>

          {/* Available Services Section */}
          <Paper
            variant="outlined"
            sx={{
              flex: '1 1 50%',
              overflow: 'auto',
              p: 2,
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Add New Services
            </Typography>
            {availableServices.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No additional services available
              </Typography>
            ) : (
              availableServices.map((service) => (
                <Box
                  key={service.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                    p: 1,
                    bgcolor: 'background.light',
                    borderRadius: 1
                  }}
                >
                  <Typography>{service.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      size="small"
                      label="Price"
                      type="number"
                      sx={{
                        width: 100,
                        mr: 2,
                        '& .MuiInputBase-root': {
                          height: 40
                        }
                      }}
                      value={newServicePrices[service.id] || ''}
                      onChange={(e) => handlePriceChange(service.id, e.target.value)}
                      InputProps={{
                        startAdornment: '₹'
                      }}
                    />
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleAddService(service)}
                      disabled={!newServicePrices[service.id]}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        </Box>
      </Paper>
    </Modal>
  );
};

export default ModifyServicesModal;
