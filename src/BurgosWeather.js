import React from 'react';
import { Typography, Box } from '@mui/material';
import GetTempColour from './GetTempColour';
import GetHumColor from './GetHumColor';
import GetWindDir from './GetWindDir';

const BurgosWeather = ({ weatherData }) => {
  const styles = {
    temperature: {
      fontSize: '4rem',
      color: weatherData ? GetTempColour(weatherData.temperature) : 'Gray'
    },
    humidity: {
      fontSize: '3rem',
      color: weatherData ? GetHumColor(weatherData.humidity) : 'chartreuse'
    },
    viento: {
      fontSize: '1rem',
      color: 'gold'
    },
    description: {
      fontSize: '1.2rem',
      color: 'azure',
      textTransform: 'capitalize',
      marginTop: '10px',
      marginBottom: '20px'
    },
    label: {
      fontSize: '1rem',
      color: 'lightblue',
      marginTop: '5px'
    },
    press: {
      fontSize: '1rem',
      color: 'orangeRed',
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
          <Typography style={styles.temperature}>
            {weatherData.temperature.toFixed(1)}°C
          </Typography>
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
      <Typography style={styles.viento}>
        Viento: {weatherData.windSpeed.toFixed(1)} km/h ({weatherData.windDirection}° - {GetWindDir(weatherData.windDirection)})
      </Typography>
      <Typography style={styles.press}>
        Presión: {weatherData.pressure} hPa
      </Typography>
    </Box>
  );
};

export default BurgosWeather;