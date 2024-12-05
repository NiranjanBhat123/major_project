import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { Save, Edit } from '@mui/icons-material';
import axios from 'axios';

const ServiceProviderProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [originalProfileData, setOriginalProfileData] = useState({});
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    mobile_number: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    gender: '',
    photo: null,
    main_service: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const STATES = [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh',
    'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
    'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  useEffect(() => {
    const providerId = localStorage.getItem('providerId');
    const fetchProviderDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/service_providers/${providerId}/`);
        const providerDetails = response.data;
        
        // Set both current and original profile data
        const profileData = {
          first_name: providerDetails.first_name,
          last_name: providerDetails.last_name,
          mobile_number: providerDetails.mobile_number,
          street_address: providerDetails.street_address,
          city: providerDetails.city,
          state: providerDetails.state,
          postal_code: providerDetails.postal_code,
          gender: providerDetails.gender,
          photo: providerDetails.photo,
          main_service: providerDetails.main_service
        };

        setProfileData(profileData);
        setOriginalProfileData(profileData);
        setPreviewImage(providerDetails.photo);
      } catch (error) {
        console.error('Error fetching provider details:', error);
        setSnackbar({
          open: true,
          message: 'Failed to fetch provider details',
          severity: 'error'
        });
      }
    };
    fetchProviderDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!profileData.first_name) newErrors.first_name = 'First name is required';
    if (!profileData.last_name) newErrors.last_name = 'Last name is required';
    if (!profileData.mobile_number) newErrors.mobile_number = 'Mobile number is required';
    if (!profileData.street_address) newErrors.street_address = 'Street address is required';
    if (!profileData.city) newErrors.city = 'City is required';
    if (!profileData.state) newErrors.state = 'State is required';
    if (!profileData.postal_code) newErrors.postal_code = 'Postal code is required';
    if (!profileData.gender) newErrors.gender = 'Gender is required';

    // If there are validation errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const formData = {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      mobile_number: profileData.mobile_number,
      street_address: profileData.street_address,
      city: profileData.city,
      state: profileData.state,
      postal_code: profileData.postal_code,
      gender: profileData.gender,
    };
  
    try {
      const providerId = localStorage.getItem('providerId');
      const response = await axios.patch(
        `http://127.0.0.1:8000/service_providers/${providerId}/`, 
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
      
      // Reset to view mode and update original data
      setIsEditing(false);
      setOriginalProfileData(profileData);
      setErrors({});
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
      
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      }
    }
  };

  const handleCancelEdit = () => {
    // Revert back to original data when canceling edit
    setProfileData(originalProfileData);
    setIsEditing(false);
    setErrors({});
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalProfileData);

  return (
    <Box sx={{
      maxWidth: 600,
      margin: 'auto',
      mt: 4,
      p: 2
    }}>
      <Card>
        <CardContent>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ mb: 3 }}
          >
            Service Provider Profile
          </Typography>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={3}
          >
            <Avatar
              src={previewImage}
              sx={{
                width: 120,
                height: 120,
                border: '4px solid',
                borderColor: 'primary.main'
              }}
            />
          </Box>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="first_name"
                  label="First Name"
                  fullWidth
                  value={profileData.first_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!errors.first_name}
                  helperText={errors.first_name}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="last_name"
                  label="Last Name"
                  fullWidth
                  value={profileData.last_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!errors.last_name}
                  helperText={errors.last_name}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="mobile_number"
                  label="Mobile Number"
                  fullWidth
                  value={profileData.mobile_number}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!errors.mobile_number}
                  helperText={errors.mobile_number}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="street_address"
                  label="Street Address"
                  fullWidth
                  value={profileData.street_address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!errors.street_address}
                  helperText={errors.street_address}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  name="city"
                  label="City"
                  fullWidth
                  value={profileData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!errors.city}
                  helperText={errors.city}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth error={!!errors.state}>
                  <InputLabel>State</InputLabel>
                  <Select
                    name="state"
                    value={profileData.state}
                    label="State"
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                  >
                    {STATES.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.state && <Typography color="error" variant="caption">{errors.state}</Typography>}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  name="postal_code"
                  label="Postal Code"
                  fullWidth
                  value={profileData.postal_code}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!errors.postal_code}
                  helperText={errors.postal_code}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.gender}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={profileData.gender}
                    label="Gender"
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                  >
                    <MenuItem value="M">Male</MenuItem>
                    <MenuItem value="F">Female</MenuItem>
                    <MenuItem value="O">Other</MenuItem>
                  </Select>
                  {errors.gender && <Typography color="error" variant="caption">{errors.gender}</Typography>}
                </FormControl>
              </Grid>
              <Grid item xs={12} container spacing={2}>
                {!isEditing ? (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      startIcon={<Edit />}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={6}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        startIcon={<Save />}
                        disabled={!hasChanges}
                      >
                        Save Changes
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServiceProviderProfile;