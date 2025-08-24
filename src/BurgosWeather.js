import React, { useState, useEffect } from 'react';
import { Typography} from '@mui/material';
import GetTempColour from './GetTempColour';
import GetHumColor from './GetHumColor';
import GetWindDir from './GetWindDir';
import WindDirectionIndicator from './WindDirectionIndicator';
import { Row, Column } from './components/Layout';
import RainBar from './components/Rainbar';
import BurgosShowTempDiffs from './BurgosShowTempDiffs';
import { calculateHeatIndexAemet } from './GetTempColour';
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
        // Request enough data to cover full day (144 records = 24h at 10min intervals)
        const response = await axios.get(`${BACKEND_URI}/api/weather/history`, {
          params: { limit: 200 }
        });
        const data = response.data.data;

        if (!data || data.length === 0) return;

        // Get today's date at 00:00 in local time (Madrid timezone)
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        
        console.log('Looking for temperatures since:', startOfDay.toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }));

        // Filter today's data from 00:00 until now (considering UTC timestamps in DB)
        const todayData = data.filter(entry => {
          // Parse UTC timestamp correctly
          let utcDate;
          if (typeof entry.timestamp === 'string') {
            if (!entry.timestamp.endsWith('Z') && !entry.timestamp.includes('+')) {
              utcDate = new Date(entry.timestamp + 'Z');
            } else {
              utcDate = new Date(entry.timestamp);
            }
          } else {
            utcDate = new Date(entry.timestamp);
          }
          
          // Convert UTC to Madrid local time using proper offset
          const now = new Date();
          const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
          const madridNow = new Date(utcNow.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
          const actualOffset = (madridNow.getTime() - utcNow.getTime()) / (60 * 60 * 1000);
          
          const entryLocal = new Date(utcDate.getTime() + actualOffset * 60 * 60 * 1000);
          
          // Check if entry is from today (00:00 to now)
          const isToday = entryLocal.getDate() === startOfDay.getDate() &&
                         entryLocal.getMonth() === startOfDay.getMonth() &&
                         entryLocal.getFullYear() === startOfDay.getFullYear();
          
          return isToday;
        });

        console.log(`Found ${todayData.length} records for today`);

        if (todayData.length === 0) return;

        // Calculate actual max/min temperatures from today's records
        let maxTemp = -Infinity;
        let minTemp = Infinity;
        let maxTempTime = null;
        let minTempTime = null;

        // Debug: log a few temperatures to verify data
        console.log('Sample temperatures from today:');
        todayData.slice(0, 5).forEach(entry => {
          const temp = getCurrentTemperature(entry);
          console.log(`  ${entry.timestamp}: ${temp}°C`);
        });
        
        todayData.forEach(entry => {
          const temp = getCurrentTemperature(entry);
          if (temp !== null && temp !== undefined && !isNaN(temp)) {
            if (temp > maxTemp) {
              maxTemp = temp;
              maxTempTime = entry.timestamp;
            }
            if (temp < minTemp) {
              minTemp = temp;
              minTempTime = entry.timestamp;
            }
          }
        });
        
        console.log('Calculated from', todayData.length, 'records:');
        console.log('  Max temp:', maxTemp, 'at', maxTempTime);
        console.log('  Min temp:', minTemp, 'at', minTempTime);

        // Format times to local Madrid timezone
        const formatTime = (utcTimestamp) => {
          if (!utcTimestamp) return null;
          
          // Ensure we have a proper UTC date
          let utcDate;
          if (typeof utcTimestamp === 'string') {
            // If timestamp doesn't end with 'Z', it means it's already in UTC format but without timezone indicator
            if (!utcTimestamp.endsWith('Z') && !utcTimestamp.includes('+')) {
              utcDate = new Date(utcTimestamp + 'Z'); // Add Z to indicate it's UTC
            } else {
              utcDate = new Date(utcTimestamp);
            }
          } else {
            utcDate = new Date(utcTimestamp);
          }
          
          // Debug logging
          console.log('Original UTC timestamp:', utcTimestamp);
          console.log('Interpreted as UTC:', utcDate.toISOString());
          
          // Convert to Madrid timezone
          const madridTime = utcDate.toLocaleString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Madrid'
          });
          
          console.log('Formatted Madrid time:', madridTime);
          return madridTime;
        };

        const finalMaxTemp = maxTemp !== -Infinity ? maxTemp : null;
        const finalMinTemp = minTemp !== Infinity ? minTemp : null;
        const finalMaxTime = formatTime(maxTempTime);
        const finalMinTime = formatTime(minTempTime);

        console.log('Calculated today max temp:', finalMaxTemp, 'at', finalMaxTime);
        console.log('Calculated today min temp:', finalMinTemp, 'at', finalMinTime);

        setValidTemperatures({
          maxTemp: finalMaxTemp,
          minTemp: finalMinTemp,
          maxTempTime: finalMaxTime,
          minTempTime: finalMinTime
        });

      } catch (error) {
        console.error('Error fetching Burgos temperature data:', error);
      }
    };

    if (weatherData) {
      fetchTodayTemperatures();
    }
  }, [weatherData]);

  // Helper function to extract temperature from Burgos data structure
  const getCurrentTemperature = (data) => {
    if (!data) return null;
    
    // Try to get temperature from google_weather_burgos_center
    if (data.google_weather_burgos_center && data.google_weather_burgos_center.temperature !== undefined) {
      return data.google_weather_burgos_center.temperature;
    }
    
    // Try to get from raw_data structure
    if (data.raw_data && data.raw_data.temperature && data.raw_data.temperature.degrees !== undefined) {
      return data.raw_data.temperature.degrees;
    }
    
    return null;
  };

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
          <BurgosShowTempDiffs />
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
            return heatIndex ? (
              <Typography style={{
                ...bur_styles.maxminTempLabel,
                fontSize: '2rem',
                color: '#ff6600',
                fontWeight: '500'
              }}>
                Sensación: {heatIndex}°
              </Typography>
            ) : null;
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