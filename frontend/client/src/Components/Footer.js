import React from 'react';
import { Box, Container, Grid, Typography, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FaApple, FaGooglePlay } from 'react-icons/fa';
// Correct image import
import Logo from '../images/logo.jpeg';

const StyledFooter = styled('footer')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: '64px 0 32px',
  color: theme.palette.text.muted,
  boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.05)',
}));

const FooterHeading = styled(Typography)(({ theme }) => ({
  fontSize: '18px',
  fontWeight: 600,
  marginBottom: '24px',
  color: theme.palette.text.primary,
  fontFamily: '"Poppins", sans-serif',
  position: 'relative',
  paddingBottom: '8px',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '40px',
    height: '3px',
    background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
    borderRadius: '2px',
  },
}));

const LogoImage = styled('img')({
  height: '40px',
  marginBottom: '16px',
});

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.muted,
  textDecoration: 'none',
  fontSize: '14px',
  lineHeight: '32px',
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  fontFamily: '"Poppins", sans-serif',
  '&:hover': {
    color: theme.palette.secondary.main,
    transform: 'translateX(5px)',
  },
}));

const AppStoreButton = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 24px',
  backgroundColor: theme.palette.text.primary,
  color: theme.palette.background.paper,
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  textDecoration: 'none',
  marginBottom: '16px',
  fontFamily: '"Poppins", sans-serif',
  '& .icon-wrapper': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
  },
  '& .store-info': {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  '& .store-text': {
    fontSize: '11px',
    opacity: 0.9,
    letterSpacing: '0.5px',
    fontWeight: 400,
  },
  '& .store-name': {
    fontSize: '16px',
    fontWeight: 600,
    letterSpacing: '0.3px',
  },
}));

const FooterBottom = styled(Box)(({ theme }) => ({
  marginTop: '48px',
  paddingTop: '24px',
  borderTop: `1px solid ${theme.palette.background.muted}`,
  '& p': {
    color: theme.palette.text.muted,
    fontSize: '13px',
    letterSpacing: '0.3px',
    fontFamily: '"Poppins", sans-serif',
  },
}));

const BrandText = styled(Typography)(({ theme }) => ({
  fontFamily: '"Poppins", sans-serif',
  fontWeight: 700,
  fontSize: '28px',
  background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: '24px',
}));

const StyledList = styled('ul')({
  listStyle: 'none',
  padding: 0,
  margin: 0,
});

const Footer = () => {
  return (
    <StyledFooter>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <LogoImage src={Logo} style={{height:"10rem",width:"10rem"}} alt="FixNGo Logo" />
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 3, 
                color: 'text.muted', 
                lineHeight: 1.8,
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Your trusted partner for all home services. Quality work, professional service, and customer satisfaction guaranteed.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FooterHeading>Company</FooterHeading>
            <StyledList>
              <li><FooterLink href="#">About us</FooterLink></li>
              <li><FooterLink href="#">Terms & conditions</FooterLink></li>
              <li><FooterLink href="#">Privacy policy</FooterLink></li>
              <li><FooterLink href="#">Anti-discrimination policy</FooterLink></li>
              <li><FooterLink href="#">Impact</FooterLink></li>
              <li><FooterLink href="#">Careers</FooterLink></li>
            </StyledList>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FooterHeading>For customers</FooterHeading>
            <StyledList>
              <li><FooterLink href="#">Reviews</FooterLink></li>
              <li><FooterLink href="#">Categories near you</FooterLink></li>
              <li><FooterLink href="#">Blog</FooterLink></li>
              <li><FooterLink href="#">Contact us</FooterLink></li>
            </StyledList>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FooterHeading>Get the app</FooterHeading>
            <AppStoreButton href="#">
              <Box className="icon-wrapper">
                <FaApple size={24} />
              </Box>
              <Box className="store-info">
                <span className="store-text">Download on the</span>
                <span className="store-name">App Store</span>
              </Box>
            </AppStoreButton>
            <AppStoreButton href="#">
              <Box className="icon-wrapper">
                <FaGooglePlay size={22} />
              </Box>
              <Box className="store-info">
                <span className="store-text">Get it on</span>
                <span className="store-name">Google Play</span>
              </Box>
            </AppStoreButton>
          </Grid>
        </Grid>

        <FooterBottom>
          <Typography align="center">
            © {new Date().getFullYear()} FixNGo. All rights reserved.
          </Typography>
        </FooterBottom>
      </Container>
    </StyledFooter>
  );
};

export default Footer;