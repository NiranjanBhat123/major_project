import React, {useState} from 'react';
import {Typography, Alert, Box, Button, TextField} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {requestAndStoreLocation} from "../utils/LocationHandler";

const RegistrationForm = (
  {formData, setFormData, setCurrentStep, mainServices}
) => {
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if(errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLocationClick = async () => {
    setIsGettingLocation(true);
    try {
      const success = await requestAndStoreLocation(
        () => {
          setFormData(prev => {
            const locationData = JSON.parse(localStorage.getItem('userLocation'));
            return {
              ...prev,
              latitude: locationData.latitude.toString(),
              longitude: locationData.longitude.toString()
            };
          });
        },
        (errorMessage) => {
          setErrors(prev => ({
            ...prev,
            location: errorMessage
          }));
        }
      );

      if(!success) {
        throw new Error("Failed to retrieve location.");
      }
    }
    catch (error) {
      console.error(error.message);
    }
    finally {
      setIsGettingLocation(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if(file) {
      if(!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          photo: 'Please upload an image file'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if(file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          photo: 'File size should be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        photo: file
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if(password.length < minLength)
      return 'Password must be at least 8 characters long';
    if(!hasUpperCase)
      return 'Password must contain at least one uppercase letter';
    if(!hasLowerCase)
      return 'Password must contain at least one lowercase letter';
    if(!hasNumbers)
      return 'Password must contain at least one number';
    if(!hasSpecialChar)
      return 'Password must contain at least one special character';
    return '';
  };

  const validateMobileNumber = (number) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(number) ? '' : 'Please enter a valid 10-digit mobile number';
  };

  const validateAadhaar = (aadhaar) => {
    const aadhaarRegex = /^\d{12}$/;
    return aadhaarRegex.test(aadhaar) ? '' : 'Please enter a valid 12-digit Aadhaar number';
  };

  const validatePincode = (pincode) => {
    const pincodeRegex = /^\d{6}$/;
    return pincodeRegex.test(pincode) ? '' : 'Please enter a valid 6-digit pincode';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const passwordError = validatePassword(formData.password);
    if(passwordError) newErrors.password = passwordError;

    if(formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    const mobileError = validateMobileNumber(formData.mobile_number);
    if(mobileError) newErrors.mobile_number = mobileError;

    const aadhaarError = validateAadhaar(formData.aadhaar);
    if(aadhaarError) newErrors.aadhaar = aadhaarError;

    const pincodeError = validatePincode(formData.postal_code);
    if(pincodeError) newErrors.postal_code = pincodeError;

    if(!formData.photo) newErrors.photo = 'Please upload a photo';

    setErrors(newErrors);
    if(Object.keys(newErrors).length === 0) setCurrentStep('2');
  };

  return (
    <>
      <Typography
        variant="h5"
        sx={{
          color: 'text.primary',
          mb: 2,
          fontSize: '1.5rem',
          fontWeight: 300,
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
        }}
      >
        Personal Details
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container rowSpacing={1} columnSpacing={2}>
          {/* Email Field - Disabled */}
          <Grid size={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              disabled
              sx={{mb: 2}}
            />
          </Grid>

          <Grid size={6}>
            <TextField
              fullWidth
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              error={!!errors.first_name}
              helperText={errors.first_name}
              required
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              error={!!errors.last_name}
              helperText={errors.last_name}
              required
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
              required
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleInputChange}
              error={!!errors.confirm_password}
              helperText={errors.confirm_password}
              required
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="Aadhaar"
              name="aadhaar"
              value={formData.aadhaar}
              onChange={handleInputChange}
              error={!!errors.aadhaar}
              helperText={errors.aadhaar}
              required
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="Mobile Number"
              name="mobile_number"
              value={formData.mobile_number}
              onChange={handleInputChange}
              error={!!errors.mobile_number}
              helperText={errors.mobile_number}
              required
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              error={!!errors.gender}
              helperText={errors.gender}
              required
              SelectProps={{
                native: true,
              }}
            >
              <option value=""></option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </TextField>
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              type="file"
              label="Upload Photo"
              name="photo"
              onChange={handlePhotoChange}
              error={!!errors.photo}
              helperText={errors.photo}
              required
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                accept: 'image/*'
              }}
              InputProps={{
                endAdornment: photoPreview && (
                  <Box
                    component="img"
                    src={photoPreview}
                    alt="Preview"
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      objectFit: 'cover',
                      mr: 1
                    }}
                  />
                )
              }}
            />
          </Grid>

          {/* Main Service Dropdown */}
          <Grid size={12}>
            <TextField
              fullWidth
              select
              label="Main Service"
              name="main_service"
              value={formData.main_service}
              onChange={handleInputChange}
              error={!!errors.main_service}
              helperText={errors.main_service}
              required
              SelectProps={{
                native: true,
              }}
              sx={{mb: 2}}
            >
              <option value=""></option>
              {mainServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </TextField>
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              label="Street Address"
              name="street_address"
              value={formData.street_address}
              onChange={handleInputChange}
              error={!!errors.street_address}
              helperText={errors.street_address}
              required
              multiline
              rows={1}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              error={!!errors.city}
              helperText={errors.city}
              required
            />
          </Grid>
          <Grid size={4}>
            <TextField
              fullWidth
              label="State"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              error={!!errors.state}
              helperText={errors.state}
              required
              select
              SelectProps={{
                native: true,
              }}
            >
              <option value=""></option>
              <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Assam">Assam</option>
              <option value="Bihar">Bihar</option>
              <option value="Chandigarh">Chandigarh</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Dadra and Nagar Haveli">Dadra and Nagar Haveli</option>
              <option value="Daman and Diu">Daman and Diu</option>
              <option value="Delhi">Delhi</option>
              <option value="Goa">Goa</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Haryana">Haryana</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Jammu and Kashmir">Jammu and Kashmir</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Ladakh">Ladakh</option>
              <option value="Lakshadweep">Lakshadweep</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Manipur">Manipur</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Odisha">Odisha</option>
              <option value="Puducherry">Puducherry</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Tripura">Tripura</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="West Bengal">West Bengal</option>
            </TextField>
          </Grid>
          <Grid size={4}>
            <TextField
              fullWidth
              label="Postal Code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleInputChange}
              error={!!errors.postal_code}
              helperText={errors.postal_code}
              required
              inputProps={{
                maxLength: 6,
                pattern: '[0-9]*'
              }}
            />
          </Grid>

          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
            <Grid size={4}>
              <TextField
                label="Latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                error={!!errors.latitude}
                helperText={errors.latitude}
                required
                fullWidth
              />
            </Grid>
            <Grid size={4}>
              <TextField
                label="Longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                error={!!errors.longitude}
                helperText={errors.longitude}
                required
                fullWidth
              />
            </Grid>
            <Grid size={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleLocationClick}
                disabled={isGettingLocation}
                fullWidth
              >
                {isGettingLocation ? 'Getting Location...' : 'Get location'}
              </Button>
            </Grid>
          </Box>

          {/* Error Alert */}
          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{mt: 2, width: '100%'}}>
              Please fix the errors before submitting the form.
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              mt: 3,
              height: '48px',
              fontSize: '1.1rem',
            }}
          >
            Next
          </Button>
        </Grid>
      </form>
    </>
  );
};

export default RegistrationForm;
