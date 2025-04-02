import React from 'react';
import { Box, Typography } from '@mui/material';

const Radar = ({ styles, isMobile }) => {
  return (
    <Box>
      {/* Radar */}
      <Box sx={{ 
      width: isMobile ? '100%' : '90%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto'
    }}>
        <Typography style={styles.seccion}>
          Radar
        </Typography>
        <Box 
          width="100%" 
          display="flex"
          justifyContent="center" 
          alignItems="center" 
          marginTop="20px"
        >
          <iframe 
            src="https://static-m.meteo.cat/ginys/mapaRadar?language=ca&color=2c3e50&target=_blank" 
            title="Última imatge de radar" 
            frameBorder="0" 
            style={{border:0}} 
            scrolling="no" 
            width="100%" 
            height={isMobile ? "300px" : "400px"}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Radar; 