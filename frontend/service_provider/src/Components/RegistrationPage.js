import React, {useState, useEffect, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {useWelcomeViewContext} from "../Contexts/WelcomeViewContextProvider";
import axios from "axios";
import {
  Box, Typography, Paper
} from '@mui/material';
import RegistrationForm from "./RegistrationForm";
import PhotoMatching from "./PhotoMatching";

const RegistrationPage = () => {
  const {signUpEmail} = useWelcomeViewContext();
  const navigate = useNavigate();
  const [mainServices, setMainServices] = useState([]);
  const [formData, setFormData] = useState({
    email: signUpEmail,
    main_service: "",
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    aadhaar: '',
    mobile_number: '',
    gender: '',
    photo: null,
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    latitude: '',
    longitude: '',
    is_active: true
  });
  const [currentStep, setCurrentStep] = useState('1');
  const [isTitleVisible, setIsTitleVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const fetchMainServices = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/services/');
        if(response.data.status) {
          const filteredServices = response.data.data.results.map(service => ({
            id: service.data.id,
            name: service.data.name,
          }));
          setMainServices(filteredServices);
        }
      }
      catch(error) {
        console.error('Error fetching services:', error);
        setError('Failed to fetch services. Please refresh the page.');
      }
    };

    fetchMainServices();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if(titleRef.current) {
        const titlePosition = titleRef.current.getBoundingClientRect().top;
        setIsTitleVisible(titlePosition < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if(key === 'photo' && formData[key]) formDataToSend.append(key, formData[key]);
        else if(key === 'latitude' || key === 'longitude') {
          const value = parseFloat(formData[key]).toFixed(6);
          formDataToSend.append(key, value);
        }
        else formDataToSend.append(key, formData[key]);
      });

      const response = await axios.post(
        'http://127.0.0.1:8000/service_providers/signup/',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if(response.data.status) {
        localStorage.setItem('accessToken', response.data.data.access_token);
        localStorage.setItem('refreshToken', response.data.data.refresh_token);
        localStorage.setItem('providerId', response.data.data.provider_id);
        localStorage.setItem('providerName', response.data.data.name);
        localStorage.setItem('providerEmail', response.data.data.email);
        localStorage.setItem('mainServiceId', response.data.data.service_id);
        navigate('/main');
      }
      else setError(response.data.message);
    }
    catch(error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: `linear-gradient(135deg, ${theme => theme.palette.primary.light}22, ${theme => theme.palette.secondary.light}33)`,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          height: '70px',
          zIndex: 1100,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease-in-out',
          transform: isTitleVisible ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
            width: '100%',
          }}
        >
          <Typography
            variant="title"
            sx={{
              color: 'secondary.main',
              fontSize: isTitleVisible ? '2rem' : '1.5rem',
              transform: isTitleVisible ? 'translateX(20px)' : 'translateX(0)',
              transition: 'all 0.3s ease-in-out',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            FixNGo
          </Typography>

          <Typography
            sx={{
              position: 'absolute',
              left: '50%',
              color: 'secondary.main',
              fontWeight: 600,
              fontSize: '1.4rem',
              opacity: isTitleVisible ? 1 : 0,
              transition: 'all 0.3s ease-in-out',
              transform: isTitleVisible ? 'translateX(-50%)' : 'translateX(-50%) translateY(-20px)',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            Service Provider Registration
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            flexDirection: 'column',
            pt: 16,
            pb: 6,
            px: 3,
            width: '100%',
          }}
        >
          <Box
            ref={titleRef}
            sx={{textAlign: 'center', mb: 8}}
          >
            <Typography
              variant="title"
              sx={{
                color: 'secondary.main',
                mb: 3,
                fontSize: '5rem',
                letterSpacing: '-0.02em',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              FixNGo
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: 'text.primary',
                mb: 2,
                fontSize: '1.75rem',
                fontWeight: 300,
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
              }}
            >
              Join our network of trusted service providers
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                maxWidth: '700px',
                mx: 'auto',
                mb: 4,
                fontSize: '1.1rem',
                lineHeight: 1.6,
              }}
            >
              Connect with customers in your area and grow your business.
              Register now to become part of our professional service provider network.
            </Typography>
          </Box>

          <Paper elevation={4} sx={{width: '50%', p: 4, borderRadius: 2}}>
            {
              currentStep === '1' ?
                <RegistrationForm
                  formData={formData}
                  setFormData={setFormData}
                  setCurrentStep={setCurrentStep}
                  mainServices={mainServices}
                /> :
                <PhotoMatching
                  formData={formData}
                  setCurrentStep={setCurrentStep}
                  handleFinalSubmit={handleFinalSubmit}
                  isSubmitting={isSubmitting}
                  error={error}
                  setError={setError}
                />
            }
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default RegistrationPage;
