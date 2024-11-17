import React, { useState } from 'react';
import { useWelcomeViewContext } from "../Contexts/WelcomeViewContextProvider";
import { 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Link,
  Grid,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  InputLabel
} from '@mui/material';


// Indian states array
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

const SignUp = () => {
  const { 
    showLogin, 
    showOTP,  
    updateSignUpEmail, 
    updateSignUpData 
  } = useWelcomeViewContext();
  const [formData, setFormData] = useState({
    name: '',
    mobile_number: '',
    email: '',
    password: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: ''
  });


  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: '',
      general: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate the form data first
      let validationErrors = {};
      if (!formData.email.includes('@')) {
        validationErrors.email = 'Please enter a valid email address';
      }
      if (formData.password.length < 8) {
        validationErrors.password = 'Password must be at least 8 characters long';
      }
      if (formData.mobile_number.length !== 10) {
        validationErrors.mobile_number = 'Please enter a valid 10-digit mobile number';
      }
      if(formData.postal_code.length !=6 ){
        validationErrors.postal_code = 'Please enter a valid 6-digit postal code';
      }
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Store form data and email for OTP verification
      updateSignUpData(formData);
      updateSignUpEmail(formData.email);
      
      // Navigate to OTP verification
      showOTP();

    } catch (err) {
      setErrors({ general: 'An error occurred. Please try again.' });
      console.error('Signup error:', err);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100%',
        width: '50%',
        bgcolor: 'background.light',
        padding: '2rem',
        boxSizing: 'border-box',
        overflowY: 'auto',
        boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.1)',
        '@keyframes slideIn': {
          from: {
            transform: 'translateX(100%)',
            opacity: 0,
          },
          to: {
            transform: 'translateX(0)',
            opacity: 1,
          },
        },
        animation: 'slideIn 0.5s ease-out forwards',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
        },
      }}
    >
      {/* <CloseIcon
        onClick={setEmpty}
        sx={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          cursor: 'pointer'
        }}
      /> */}

      <Typography variant="h4" sx={{ mb: 3, color: 'primary.main' }}>
        Sign Up
      </Typography>

      <Grid container spacing={2} sx={{ maxWidth: '500px', margin: '0 auto' }}>
        <Grid item xs={12}>
          <TextField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.email}
            helperText={errors.email}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Mobile Number"
            name="mobile_number"
            value={formData.mobile_number}
            onChange={handleChange}
            fullWidth
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">+91</InputAdornment>,
            }}
            error={!!errors.mobile_number}
            helperText={errors.mobile_number}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.password}
            helperText={errors.password || 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character'}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Street Address"
            name="street_address"
            value={formData.street_address}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.street_address}
            helperText={errors.street_address}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl 
            fullWidth 
            error={!!errors.state}
            required
          >
            <InputLabel id="state-select-label">State</InputLabel>
            <Select
              labelId="state-select-label"
              id="state-select"
              name="state"
              value={formData.state}
              label="State"
              onChange={handleChange}
            >
              {INDIAN_STATES.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Select>
            {errors.state && <FormHelperText>{errors.state}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.city}
            helperText={errors.city}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Postal Code"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.postal_code}
            helperText={errors.postal_code}
          />
        </Grid>

        {errors.general && (
          <Grid item xs={12}>
            <Typography 
              color="error" 
              variant="body2" 
              sx={{ textAlign: 'center' }}
            >
              {errors.general}
            </Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 1, mb: 2 }}
          >
            Sign Up
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.muted' }}>
            Already have an account?{' '}
            <Link
              component="button"
              onClick={showLogin}
              sx={{ color: 'secondary.main' }}
            >
              Login
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SignUp;