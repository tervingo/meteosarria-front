import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, useMediaQuery, CircularProgress, Alert, Link } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { BACKEND_URI } from './constants';
import GetTempColour from './GetTempColour';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});



const BurgosWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  // Media queries for responsive design
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));


  useEffect(() => {
    const fetchBurgosWeather = async () => {
      try {
        setLoading(true);
        // Asegúrate de que esta URL coincide con tu configuración de proxy
        const response = await axios.get(BACKEND_URI + '/api/burgos', {
          // Añadimos timeout y headers para mejor manejo de errores
          timeout: 10000,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.data && response.data.data) {
          setWeatherData(response.data.data);
          setError(null);
        } else {
          throw new Error('Formato de respuesta inválido');
        }
      } catch (err) {
        console.error('Error fetching Burgos weather:', err);
        setError(
          err.response?.data?.message || 
          err.message || 
          'Error al obtener datos de Burgos'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBurgosWeather();
    const interval = setInterval(fetchBurgosWeather, 300000);

    return () => clearInterval(interval);
  }, []);

  const styles = {
    temperature: {
      fontSize: isMobile ? '5rem' : isTablet ? '5rem' : '5rem',
      color: weatherData ? GetTempColour(weatherData.temperature) : 'Gray'
    },
    humidity: {
        fontSize: isMobile ? '3rem' : isTablet ? '3rem'  : '3rem',
        color: 'aqua',
    },
    titulo: {
        color: 'silver',
        fontSize: '1.5rem'
    },
    estacion: {
        color: 'silver',
        fontSize: '1.1rem',
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom style={ styles.titulo}>
        Temperatura actual en Burgos
      </Typography>
      
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" p={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && weatherData && (
        <>
          <Typography style={styles.temperature}>
            {typeof weatherData.temperature === 'number' 
              ? `${weatherData.temperature.toFixed(1)}°C`
              : 'N/A'
            }
          </Typography>
          <Typography style={styles.humidity}>
            {typeof weatherData.humidity === 'number' 
              ? `${weatherData.humidity}%`
              : 'N/A'
            }
          </Typography>
          <Typography variant="caption" display="block" style={styles.estacion}>
            <Link
              href="https://www.aemet.es/es/eltiempo/observacion/ultimosdatos?k=cle&l=2331&w=0&datos=det&x=h24&f=temperatura"
              target="_blank"
              rel="noreferrer"
              underline="none"
              sx={{
                color: 'silver',
                '&:hover': {
                  color: 'white',
                  opacity: 0.8
                }
              }}
            >
              Estación: Burgos/Villafría ( {formatTimestamp(weatherData.timestamp)} )
            </Link>
          </Typography>
        </>
      )}
    </Box>
  );
};

export default BurgosWeather;