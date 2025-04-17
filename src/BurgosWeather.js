import React from 'react';
import { Typography} from '@mui/material';
import GetTempColour from './GetTempColour';
import GetHumColor from './GetHumColor';
import GetWindDir from './GetWindDir';
import WindDirectionIndicator from './WindDirectionIndicator';
import { Row, Column } from './components/Layout';
import RainBar from './components/Rainbar';

const BurgosWeather = ({ weatherData, isMobile, styles }) => {
  const bur_styles = {
    temperature: {
      fontSize: '5rem',
      color: weatherData ? GetTempColour(weatherData.temperature) : 'Gray'
    },
    max_temperature: {  
      fontSize: '1.5rem',
      color: weatherData ? GetTempColour(weatherData.max_temperature) : 'Gray'
    },
    min_temperature: {
      fontSize: '1.5rem',
      color: weatherData ? GetTempColour(weatherData.min_temperature) : 'Gray'
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

    <Column width="100%" align="center" justify="center"               
/*       sx={{ 
      gridArea: '2C', 
      order: 5,
      borderTop: isMobile ? '1px solid darkgrey' : 'none',
      paddingTop: isMobile ? 2 : 0
    }}
 */
>
      <Typography style={styles.subseccion}>
        Temperatura
      </Typography>           

          <Row align="center" justify="center" gap={2}>
            <Typography style={bur_styles.temperature}>
              {weatherData.temperature.toFixed(1)}°C
            </Typography>
            <Column align="center" justify="center" gap={2}>
              <Typography style={bur_styles.max_temperature}>
                {weatherData.max_temperature.toFixed(1)}°C
              </Typography>
            <Typography style={bur_styles.min_temperature}>
              {weatherData.min_temperature.toFixed(1)}°C
              </Typography>
            </Column>
          </Row>

          {/* Humedad, Presión  */}                 
          <Row width="auto" align="flex-start" justify="center" gap={2}>
            {/* Humedad  */}
            <Column 
              align="center"
              width={isMobile ? "100%" : "auto"}
            >
              <Typography style={styles.subseccion}>
                Humedad
              </Typography>              
              <Row width="100%" align="center" justify="center" gap={2}>
                <Typography style={styles.datosHumedad}>
                  {weatherData.humidity}%
                </Typography>
              </Row>
            </Column>

            {/* Presión */}
            <Column align="center" width={isMobile ? "100%" : "auto"}>
              <Typography style={styles.subseccion}>
                Presión
              </Typography>              
              <Row align="center" justify="center" gap={2}>
                <Typography style={styles.datosPresion}>
                  {weatherData.pressure} hPa
                </Typography>
              </Row>
            </Column>

            {/* Icono y descripción */}
            <Column align="center" justify="center">
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
            </Column>
          </Row>
          <Row align="center" justify="center" gap={2}>
            <Column align="center" justify="center">
            <Typography style={styles.subseccion}>
              Viento
            </Typography>
            <WindDirectionIndicator
              direction={weatherData.wind_direction}
              speed={(weatherData.wind_speed * 3.6).toFixed(1)}
              rose={GetWindDir(weatherData.wind_direction)}
              size={isMobile ? 'small' : 'normal'}
            />
            </Column>
            <Column align="center" justify="center">
              <Typography style={styles.subseccion}>
                Precipitación
              </Typography>
              <Row align="center" justify="center" gap={8}>
                <RainBar
                  label="Hoy"
                  value={weatherData.day_rain}
                  maxValue={100}
                  barWidth={12}
                  isLoading={!weatherData}
                />
                <RainBar
                  label="Total año"
                  value={weatherData.total_rain}
                  maxValue={1000}
                  barWidth={16}
                  isLoading={!weatherData}
                />
              </Row>
            </Column>
          </Row>

    </Column>
  );
};

export default BurgosWeather;