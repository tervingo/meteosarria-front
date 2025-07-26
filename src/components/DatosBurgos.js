import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import BurgosWeather from '../BurgosWeather';
import { Row, Column } from '../components/Layout';

const DatosBurgos = ({ burgosWeather, styles, isMobile }) => {
  const webcamRef = useRef(null);

  useEffect(() => {
    // Cargar el script de Windy solo una vez
    const script = document.createElement('script');
    script.src = 'https://webcams.windy.com/webcams/public/embed/v2/script/player.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Limpiar el script cuando el componente se desmonte
      document.body.removeChild(script);
    };
  }, []);

  if (!burgosWeather) {
    return (
      <Column width="100%" align="center" justify="flex-start">
        <Typography style={styles.seccion}>
          Cargando datos de Burgos...
        </Typography>
      </Column>
    );
  }

  return (
    <Column width="100%" align="center" justify="flex-start">
      <Typography style={styles.seccion}>
        Datos actuales en Burgos a las {burgosWeather.observation_time ? 
          new Date(burgosWeather.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          }) : '--:--'}
      </Typography>  
      <Typography style={styles.openweathermap}>
        Datos de <a href="https://www.aemet.es/" target="_blank" rel='noreferrer' style={styles.enlace}>AEMET (Villafría)</a>
      </Typography>
          
      <BurgosWeather weatherData={burgosWeather} isMobile={isMobile} styles={styles}/>
      <Typography style={styles.subseccion}>
        WebCam
      </Typography>              

      {/* Webcam Catedral de Burgos */}
      <Box sx={{ width: '500px', height: '280px' }} ref={webcamRef}>
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

        <Row width="100%" align="center" justify="center" marginTop="30px">
          <iframe 
            width="500" 
            height="187" 
            src="https://embed.windy.com/embed.html?type=forecast&location=coordinates&detail=true&detailLat=42.343926001&detailLon=-3.696977&metricTemp=°C&metricRain=mm&metricWind=km/h" 
            frameBorder="0"
            title="Predicción Burgos"
          />
        </Row>
      </Box>

      <Box sx={{ width: '100%', marginTop: '20px', borderTop:'1px solid darkgrey'}}>
      <Typography style={{ ...styles.enlace, marginTop: '-1px' }}>
        <a href="https://renuncio.com/meteo/" target="_blank" rel='noreferrer'>
          Renuncio Meteo
        </a>
      </Typography>
      </Box>
    </Column>
 
  );
};

export default DatosBurgos; 