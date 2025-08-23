import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import BurgosWeather from '../BurgosWeather';
import { Row, Column } from '../components/Layout';

// Componente indicador circular minimalista
const UpdateIndicator = ({ lastUpdate, updateInterval = 600000 }) => {
  const [progress, setProgress] = useState(0);
  
  const calculateProgress = useCallback(() => {
    if (!lastUpdate) return 0;
    
    const now = new Date();
    const lastUpdateTime = typeof lastUpdate === 'string' ? new Date(lastUpdate) : lastUpdate;
    const elapsed = now - lastUpdateTime;
    
    // Calcular progreso cíclico: resetea cada vez que se completa un ciclo
    const cycleProgress = (elapsed % updateInterval) / updateInterval * 100;
    
    // Debug
    console.log('UpdateIndicator debug:', {
      lastUpdate,
      lastUpdateTime,
      elapsed,
      cycleProgress,
      progressPercent: Math.min(cycleProgress, 100)
    });
    
    return Math.min(cycleProgress, 100);
  }, [lastUpdate, updateInterval]);
  
  useEffect(() => {
    const updateProgress = () => {
      setProgress(calculateProgress());
    };
    
    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    
    return () => clearInterval(interval);
  }, [calculateProgress]);
  
  const radius = 8;
  const strokeWidth = 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <div 
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: '24px',
        height: '24px',
        opacity: 0.8
      }}
      onMouseEnter={(e) => {
        const tooltip = e.currentTarget.querySelector('.update-tooltip');
        if (tooltip) tooltip.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        const tooltip = e.currentTarget.querySelector('.update-tooltip');
        if (tooltip) tooltip.style.opacity = '0';
      }}
    >
      <svg width="24" height="24" style={{ transform: 'rotate(-90deg)' }}>
        {/* Círculo de fondo */}
        <circle
          cx="12"
          cy="12"
          r={radius}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Círculo de progreso */}
        <circle
          cx="12"
          cy="12"
          r={radius}
          stroke={progress >= 95 ? "#4caf50" : progress >= 80 ? "#ff9800" : "#2196f3"}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease'
          }}
        />
      </svg>
      {/* Tooltip con tiempo restante */}
      <div 
        style={{
          position: 'absolute',
          top: '28px',
          right: '0',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          whiteSpace: 'nowrap',
          opacity: '0',
          transition: 'opacity 0.2s',
          pointerEvents: 'none'
        }}
        className="update-tooltip"
      >
        {progress >= 95 ? 'Actualizando...' : `${Math.ceil((100 - progress) / 100 * 10)} min`}
      </div>
    </div>
  );
};

const DatosBurgos = ({ burgosWeather, lastBurgosUpdate, styles, isMobile }) => {
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
      <div style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
        <Typography style={styles.seccion}>
          Datos de Burgos (Plaza Mayor) <br/>
          actualizados a las {burgosWeather.observation_time ? 
            (() => {
              try {
                const date = new Date(burgosWeather.observation_time + ' UTC');
                return date.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Europe/Madrid'
                });
              } catch {
                return '--:--';
              }
            })() : '--:--'}
        </Typography>
        <UpdateIndicator 
          lastUpdate={lastBurgosUpdate} 
          updateInterval={600000} // 10 minutos
        />
      </div>  
      <Typography style={styles.openweathermap}>
        Datos de Google Weather (42°20'28" N, 3°42'07" W)
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
    </Column>
 
  );
};

export default DatosBurgos; 