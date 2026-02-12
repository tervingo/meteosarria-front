import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const Modelos = ({ styles, isMobile }) => {
  return (
    <Box sx={{ 
      width: isMobile ? '100%' : '90%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto'
    }}>
      <Typography style={styles.seccion}>
        Modelo numérico
      </Typography>
      <Box 
        sx={{ 
          width: '100%', 
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        <iframe
          style={{
            width: '100%',
            height: isMobile ? "250px" : "400px",
            display: 'block',
            margin: '0 auto'
          }}
          src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=4&overlay=temp&product=ecmwf&level=surface&lat=44.778&lon=7.646&pressure=true&message=true"
          frameBorder="0"
          title="Weather Map"
        />
        <Button
          variant="outlined"
          startIcon={<OpenInNewIcon />}
          href="https://www.tropicaltidbits.com/analysis/models/?model=ecmwf&region=eu&pkg=T850a&runtime=2026021200"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: styles?.seccion?.color || '#90EE90',
            borderColor: styles?.seccion?.color || '#90EE90',
            '&:hover': {
              borderColor: styles?.seccion?.color || '#90EE90',
              backgroundColor: 'rgba(144, 238, 144, 0.1)'
            }
          }}
        >
          Ver modelos ECMWF en Tropical Tidbits
        </Button>
      </Box>
    </Box>
  );
};

export default Modelos;

