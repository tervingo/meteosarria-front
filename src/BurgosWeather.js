import React, { useState, useEffect } from 'react';
import { Typography} from '@mui/material';
import GetTempColour from './GetTempColour';
import GetHumColor from './GetHumColor';
import GetWindDir from './GetWindDir';
import WindDirectionIndicator from './WindDirectionIndicator';
import { Row, Column } from './components/Layout';
import RainBar from './components/Rainbar';
import BurgosTempDiffs from './components/BurgosTempDiffs';
import { calculateHeatIndexAemet, calculateWindChill } from './GetTempColour';
import axios from 'axios';
import { BACKEND_URI } from './constants';

const BurgosWeather = ({ weatherData, isMobile, styles }) => {
  const [validTemperatures, setValidTemperatures] = useState({
    maxTemp: null,
    minTemp: null,
    maxTempTime: null,
    minTempTime: null
  });

  useEffect(() => {
    const fetchTodayTemperatures = async () => {
      try {
        const response = await axios.get(`${BACKEND_URI}/api/burgos-daily-extremes`);
        const data = response.data;

        if (data.success && data.extremes) {
          console.log('Daily extremes from backend:', data.extremes);
          console.log('Records analyzed:', data.records_analyzed);

          setValidTemperatures({
            maxTemp: data.extremes.max_temperature,
            minTemp: data.extremes.min_temperature,
            maxTempTime: data.extremes.max_temperature_time,
            minTempTime: data.extremes.min_temperature_time
          });
        } else {
          console.error('Error in daily extremes response:', data.error);
        }

      } catch (error) {
        console.error('Error fetching Burgos daily extremes:', error);
      }
    };

    if (weatherData) {
      fetchTodayTemperatures();
    }
  }, [weatherData]);


  const bur_styles = {
    temperature: {
      fontSize: '7rem',
      color: weatherData ? GetTempColour(weatherData.temperature) : 'Gray'
    },
    maxTemp: {  
      fontSize: '3rem',
      color: weatherData ? GetTempColour(weatherData.max_temperature) : 'Gray'
    },
    minTemp: {
      fontSize: '3rem',
      color: weatherData ? GetTempColour(weatherData.min_temperature) : 'Gray'
    },
    maxminTempLabel: {
      fontSize: '1rem',
      color: 'lightblue'
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
        Temperatura exterior
      </Typography>           
      
      <Column justify="flex-start" align="flex-start">
        <Typography style={{
          ...bur_styles.maxTemp,
          color: validTemperatures.maxTemp ? GetTempColour(validTemperatures.maxTemp) : 'Gray'
        }}>
          <Row justify="flex-start" align="flex-start">
            <Typography style={bur_styles.maxminTempLabel}>
              Tmax hoy 
              ({validTemperatures.maxTempTime || '--:--'})                      
            </Typography>
          </Row>
          <Row align="flex-end">
            {validTemperatures.maxTemp?.toFixed(1) || '--'}°
            {weatherData.icon && (
              <img 
                src={`http://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                alt={weatherData.description}
                style={{ width: isMobile ? '60px' : '80px', height: isMobile ? '60px' : '80px', marginLeft: '30px' }}
              />
            )}
            <Typography style={bur_styles.description}>
              {weatherData.description}
            </Typography>
          </Row>
        </Typography>

        <Row justify="flex-start" align="center">
          <Typography style={bur_styles.temperature}>
            {weatherData.temperature.toFixed(1)}°
          </Typography>
          <BurgosTempDiffs />
        </Row>

        <Row justify="flex-start" align="center">
          <Typography style={{
            ...bur_styles.minTemp,
            color: validTemperatures.minTemp ? GetTempColour(validTemperatures.minTemp) : 'Gray'
          }}>
            {validTemperatures.minTemp?.toFixed(1) || '--'}°
          </Typography>
        </Row>

        <Row justify="space-between" align="center" style={{ width: '100%' }}>
          <Typography style={bur_styles.maxminTempLabel}>
            Tmin hoy
            ({validTemperatures.minTempTime || '--:--'})
          </Typography>
          
          {/* Temperatura de sensación */}
          {(() => {
            const heatIndex = calculateHeatIndexAemet(weatherData.temperature, weatherData.humidity);
            const windChill = calculateWindChill(weatherData.temperature, weatherData.wind_speed * 3.6); // Convertir m/s a km/h

            if (heatIndex) {
              return (
                <Typography style={{
                  ...bur_styles.maxminTempLabel,
                  fontSize: '1.8rem',
                  color: 'orangeRed',
                  fontWeight: '500'
                }}>
                  Sensación: {heatIndex}°
                </Typography>
              );
            } else if (windChill) {
              return (
                <Typography style={{
                  ...bur_styles.maxminTempLabel,
                  fontSize: '1.8rem',
                  color: 'dodgerblue',
                  fontWeight: '500'
                }}>
                  Sensación: {windChill}°
                </Typography>
              );
            }
            return null;
          })()}
        </Row>
      </Column>

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

            {/* Nubes */}
            <Column align="center" width={isMobile ? "100%" : "auto"}>
              <Typography style={styles.subseccion}>
                Nubosidad
              </Typography>              
              <Row align="center" justify="center" gap={2}>
                <Typography style={styles.datosNubes}>
                  {weatherData.clouds} %
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
                  barWidth={12}
                  isLoading={!weatherData}
                />
              </Row>
            </Column>
          </Row>

    </Column>
  );
};

export default BurgosWeather;