import React, { useState } from 'react';
import { Typography, Alert, Box, Button, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";

const RegistrationForm = ({ formData, setFormData, setCurrentStep }) => {
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if(errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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

    Object.keys(formData).forEach(key => {
      if(!formData[key] && key !== 'photo') {
        newErrors[key] = 'This field is required';
      }
    });

    const passwordError = validatePassword(formData.password);
    if(passwordError) newErrors.password = passwordError;

    if(formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    const mobileError = validateMobileNumber(formData.mobileNumber);
    if(mobileError) newErrors.mobileNumber = mobileError;

    const aadhaarError = validateAadhaar(formData.aadhaar);
    if(aadhaarError) newErrors.aadhaar = aadhaarError;

    const pincodeError = validatePincode(formData.pincode);
    if(pincodeError) newErrors.pincode = pincodeError;

    if(!formData.photo) newErrors.photo = 'Please upload a photo';

    setErrors(newErrors);
    if(Object.keys(newErrors).length === 0) {
      console.log('From Child, Form submitted: ', formData);

      // Create FormData object for file upload
      // const formDataToSubmit = new FormData();
      // Object.keys(formData).forEach(key => {
      //   formDataToSubmit.append(key, formData[key]);
      // });

      setCurrentStep('2');
    }
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
          <Grid size={6}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              error={!!errors.firstName}
              helperText={errors.firstName}
              required
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              error={!!errors.lastName}
              helperText={errors.lastName}
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
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
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
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              error={!!errors.mobileNumber}
              helperText={errors.mobileNumber}
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
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
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
            />
            {photoPreview && (
              <Box
                sx={{
                  mt: 1,
                  width: '100px',
                  height: '100px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            )}
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="Street Address"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              error={!!errors.streetAddress}
              helperText={errors.streetAddress}
              required
              multiline
              rows={2}
            />
          </Grid>
          <Grid size={6}>
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
          <Grid size={6}>
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
              <option value="AN">Andaman and Nicobar Islands</option>
              <option value="AP">Andhra Pradesh</option>
              <option value="AR">Arunachal Pradesh</option>
              <option value="AS">Assam</option>
              <option value="BR">Bihar</option>
              <option value="CH">Chandigarh</option>
              <option value="CT">Chhattisgarh</option>
              <option value="DN">Dadra and Nagar Haveli</option>
              <option value="DD">Daman and Diu</option>
              <option value="DL">Delhi</option>
              <option value="GA">Goa</option>
              <option value="GJ">Gujarat</option>
              <option value="HR">Haryana</option>
              <option value="HP">Himachal Pradesh</option>
              <option value="JK">Jammu and Kashmir</option>
              <option value="JH">Jharkhand</option>
              <option value="KA">Karnataka</option>
              <option value="KL">Kerala</option>
              <option value="LA">Ladakh</option>
              <option value="LD">Lakshadweep</option>
              <option value="MP">Madhya Pradesh</option>
              <option value="MH">Maharashtra</option>
              <option value="MN">Manipur</option>
              <option value="ML">Meghalaya</option>
              <option value="MZ">Mizoram</option>
              <option value="NL">Nagaland</option>
              <option value="OR">Odisha</option>
              <option value="PY">Puducherry</option>
              <option value="PB">Punjab</option>
              <option value="RJ">Rajasthan</option>
              <option value="SK">Sikkim</option>
              <option value="TN">Tamil Nadu</option>
              <option value="TG">Telangana</option>
              <option value="TR">Tripura</option>
              <option value="UP">Uttar Pradesh</option>
              <option value="UT">Uttarakhand</option>
              <option value="WB">West Bengal</option>
            </TextField>
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="Pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              error={!!errors.pincode}
              helperText={errors.pincode}
              required
              inputProps={{
                maxLength: 6,
                pattern: '[0-9]*'
              }}
            />
          </Grid>
        </Grid>

        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{mt: 2}}>
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
      </form>
    </>

  );
};

export default RegistrationForm;
