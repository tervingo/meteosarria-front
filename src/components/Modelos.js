import React from 'react';
import { Box, Typography } from '@mui/material';

const Modelos = ({ styles, isMobile }) => {
  return (
    <Box sx={{ 
      width: isMobile ? '100%' : '90%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Typography style={styles.seccion}>
        Modelo numérico
      </Typography>
      <Box display="flex" flexDirection="column" alignItems="center" sx={{ width: '100%', marginTop: '20px'}}>
        <iframe
          width="100%"
          height={isMobile ? "250px" : "400px"}     
          src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=4&overlay=temp&product=ecmwf&level=surface&lat=44.778&lon=7.646&pressure=true&message=true"
          frameBorder="0"
          title="Weather Map"
        />
      </Box>
    </Box>
  );
};

export default Modelos;

