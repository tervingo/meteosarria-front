import React from 'react';
import { Box, Typography } from '@mui/material';
import BurgosWeather from '../BurgosWeather';

const DatosBurgos = ({ burgosWeather, styles, isMobile }) => {
  if (!burgosWeather) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="center"
      >
        <Typography style={styles.seccion}>
          Cargando datos de Burgos...
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="center"
    >
      <Typography style={styles.seccion}>
        Datos actuales en Burgos a las {burgosWeather.timestamp ? 
          new Date(burgosWeather.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          }) : '--:--'}
      </Typography>  
      <Typography style={styles.openweathermap}>
        Datos de <a href="https://openweathermap.org/" target="_blank" rel='noreferrer' style={styles.enlace}>OpenWeatherMap</a>
      </Typography>
          
      <BurgosWeather weatherData={burgosWeather} isMobile={isMobile} styles={styles}/>
      <Typography style={styles.subseccion}>
        WebCam
      </Typography>              

      {/* Webcam Catedral de Burgos */}

      <Box sx={{ width: '500px', height: '280px' }}>
        <a
          name="windy-webcam-timelapse-player"
          data-id="1735243432"
          data-play="day"
          data-loop="0"
          data-auto-play="0"
          data-force-full-screen-on-overlay-play="0"
          data-interactive="1"
          href="https://windy.com/webcams/1735243432"
          target="_blank"
          rel="noreferrer"
        >
          Burgos: Burgos Catedral
        </a>
        <script async type="text/javascript" src="https://webcams.windy.com/webcams/public/embed/v2/script/player.js"></script>
      </Box>

      <Typography style={{ ...styles.enlace, marginTop: '-1px' }}>
        <a href="https://ibericam.com/espana/burgos/webcam-burgos-catedral-de-burgos/" target="_blank" rel='noreferrer'>
          Webcam Catedral de Burgos
        </a>
      </Typography>

      <Box sx={{ width: '100%', marginTop: '20px', borderTop:'1px solid darkgrey'}}>
        <Typography style={styles.seccion}>
          Predicción (Burgos)
        </Typography>

        <Box 
          width="100%" 
          display="flex"
          justifyContent="center" 
          alignItems="center" 
          marginTop="30px"
        >
          <iframe 
            width="500" 
            height="187" 
            src="https://embed.windy.com/embed.html?type=forecast&location=coordinates&detail=true&detailLat=42.343926001&detailLon=-3.696977&metricTemp=°C&metricRain=mm&metricWind=km/h" 
            frameborder="0"
            title="Predicción Burgos"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DatosBurgos; 