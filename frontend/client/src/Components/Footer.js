// src/Components/Footer.js
import React from 'react';
import { Typography} from '@mui/material';
import { Footer } from './StyledComponents';

const FooterComponent = () => (
  <Footer>
    <Typography variant="body2" color="text.secondary">
      &copy; 2024 FixNGo. All rights reserved.
    </Typography>
  </Footer>
);

export default FooterComponent;
