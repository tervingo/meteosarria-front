import React from 'react';
import { Typography, Box } from '@mui/material';
import GetTempColour from './GetTempColour';
import GetHumColor from './GetHumColor';
import GetWindDir from './GetWindDir';
import WindDirectionIndicator from './WindDirectionIndicator';

const BurgosWeather = ({ weatherData, isMobile, styles }) => {
  const bur_styles = {
    temperature: {
      fontSize: '3rem',
      color: weatherData ? GetTempColour(weatherData.temperature) : 'Gray'
    },
    temperatureDiff: {
      fontSize: '1.5rem',
      color: weatherData ? GetTempColour(weatherData.max_temperature) : 'Gray'
    },
    humidity: {
      fontSize: '2rem',
      color: weatherData ? GetHumColor(weatherData.humidity) : 'chartreuse'
    },
    description: {
      fontSize: '1.2rem',
      color: 'azure',
      textTransform: 'capitalize',
      marginTop: '10px'
    },
    label: {
      fontSize: '1rem',
      color: 'lightblue',
      marginTop: '5px'
    }
  };

  if (!weatherData) {
    return <Typography color="azure">Loading Burgos weather data...</Typography>;
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography style={styles.subseccion}>
        Temperatura
      </Typography>           
      <Box display="flex" alignItems="center" gap={2}>
        <Box>
          <Box display="flex" flexDirection="row" alignItems="center" gap={2}>
            <Typography style={bur_styles.temperature}>
              {weatherData.temperature.toFixed(1)}°C
            </Typography>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <Typography style={bur_styles.temperatureDiff}>
                {weatherData.max_temperature.toFixed(1)}°C
              </Typography>
            <Typography style={bur_styles.temperatureDiff}>
              {weatherData.min_temperature.toFixed(1)}°C
              </Typography>
            </Box>
          </Box>

          {/* Humedad, Presión  */}                 
        <Box 
            display="flex" 
            flexDirection="row" 
            alignItems="center"
            justifyContent="center"
            gap={2}
            width="100%"
          >
            {/* Humedad  */}
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center"
              width={isMobile ? "100%" : "auto"}
              sx={{ 
                gridArea: '2I', 
                order: 4,
                borderTop: isMobile ? '1px solid darkgrey' : 'none',
                paddingTop: isMobile ? 2 : 0
              }}
            >
              <Typography style={styles.subseccion}>
                Humedad
              </Typography>              
              <Box display="flex" alignItems="center">
                <Typography style={styles.datosHumedad}>
                  {weatherData.humidity}%
                </Typography>
              </Box>
            </Box>

            {/* Presión */}
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center"
              width={isMobile ? "100%" : "auto"}
              sx={{ 
                gridArea: '2C', 
                order: 5,
                borderTop: isMobile ? '1px solid darkgrey' : 'none',
                paddingTop: isMobile ? 2 : 0
              }}
            >
              <Typography style={styles.subseccion}>
                Presión
              </Typography>              
              <Box display="flex" alignItems="center">
                <Typography style={styles.datosPresion}>
                  {weatherData.pressure} hPa
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography style={styles.subseccion}>
            Viento
          </Typography>
          <WindDirectionIndicator
            direction={weatherData.wind_direction}
            speed={(weatherData.wind_speed * 3.6).toFixed(1)}
            rose={GetWindDir(weatherData.wind_direction)}
            size={isMobile ? 'small' : 'normal'}
          />


        </Box>
        <Box display="flex" flexDirection="column" alignItems="center">
          {weatherData.icon && (
            <img 
              src={`http://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
              alt={weatherData.description}
              style={{ width: '64px', height: '64px' }}
            />
          )}
        <Typography style={bur_styles.description}>
          {weatherData.description}
        </Typography>
        </Box>
      </Box>

     </Box>
  );
};

export default BurgosWeather;