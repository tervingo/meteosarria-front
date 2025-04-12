import React from 'react';
import { Typography, Box } from '@mui/material';
import GetTempColour from './GetTempColour';
import GetHumColor from './GetHumColor';

const BurgosWeather = ({ weatherData }) => {
  const styles = {
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
      <Box display="flex" alignItems="center" gap={2}>
        <Box>
          <Box display="flex" flexDirection="row" alignItems="center" gap={2}>
            <Typography style={styles.temperature}>
              {weatherData.temperature.toFixed(1)}°C
            </Typography>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <Typography style={styles.temperatureDiff}>
                {weatherData.max_temperature.toFixed(1)}°C
              </Typography>
            <Typography style={styles.temperatureDiff}>
              {weatherData.min_temperature.toFixed(1)}°C
              </Typography>
            </Box>
          </Box>
          <Typography style={styles.humidity}>
              {weatherData.humidity}%
          </Typography>
        </Box>
        {weatherData.icon && (
          <img 
            src={`http://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
            alt={weatherData.description}
            style={{ width: '64px', height: '64px' }}
          />
        )}
      </Box>
      <Typography style={styles.description}>
        {weatherData.description}
      </Typography>
      <Typography style={styles.label}>
        Viento: {weatherData.wind_speed.toFixed(1)} km/h
      </Typography>
      <Typography style={styles.label}>
        Presión: {weatherData.pressure} hPa
      </Typography>
    </Box>
  );
};

export default BurgosWeather;