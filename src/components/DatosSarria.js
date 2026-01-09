import React from 'react';
import { Box, Typography } from '@mui/material';
import ShowTempDiffs from '../ShowTempDiffs';
import ShowHumTrends from '../ShowHumTrends';
import ShowPressTrend from '../ShowPressTrend';
import WindDirectionIndicator from '../WindDirectionIndicator';
import GetWindDir from '../GetWindDir';
import Rain from '../Rain';
import GetTempColour, { calculateHeatIndexAemet, calculateWindChill } from '../GetTempColour';
import { Row, Column } from './Layout';
import TemperatureHistoryChart from '../TemperatureHistoryChart';

const DatosSarria = ({ 
  weatherData, 
  styles, 
  isMobile, 
  currentTime, 
  getTime, 
  validTemperatures 
}) => {
  return (

    <Column justify="flex-start" align="center">
      <Typography style={styles.seccion}>
        Datos actuales en Sarrià a las {getTime(currentTime)}
      </Typography>              

      {/* Temperatura  */}
      <Typography style={styles.subseccion}>
        Temperatura exterior
      </Typography>              
      <Column justify="flex-start" align="flex-start">
        <Typography style={{
          ...styles.maxTemp,
          color: (weatherData.max_temperature <= 45 ? weatherData.max_temperature : validTemperatures.maxTemp) ? 
            GetTempColour(weatherData.max_temperature <= 45 ? weatherData.max_temperature : validTemperatures.maxTemp) : 
            'Gray'
        }}>
          <Row justify="flex-start" align="flex-start">
            <Typography style={styles.maxminTempLabel}>
              Tmax hoy 
              ({validTemperatures.maxTempTime ? validTemperatures.maxTempTime.split(' ')[1] : '--'})                      
            </Typography>
          </Row>
          <Row align="flex-end">
            {weatherData.max_temperature <= 45 ? weatherData.max_temperature : validTemperatures.maxTemp?.toFixed(1) || '--'}°
            {weatherData.icon && (
              <img 
                src={`http://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                alt={weatherData.description}
                style={{ width: isMobile ? '60px' : '80px', height: isMobile ? '60px' : '80px', marginLeft: '30px' }}
              />
            )}
            <Typography style={styles.description}>
              {weatherData.description}
            </Typography>
          </Row>
        </Typography>

        <Row justify="flex-start" align="center">
          <Typography style={styles.temperature}>
            {weatherData.external_temperature.toFixed(1)}°
          </Typography>
          <ShowTempDiffs />
        </Row>

        <Row justify="flex-start" align="center">
          <Typography style={{
            ...styles.minTemp,
            color: (weatherData.min_temperature <= 45 ? weatherData.min_temperature : validTemperatures.minTemp) ? 
              GetTempColour(weatherData.min_temperature <= 45 ? weatherData.min_temperature : validTemperatures.minTemp) : 
              'Gray'
          }}>
            {weatherData.min_temperature <= 45 ? weatherData.min_temperature : validTemperatures.minTemp?.toFixed(1) || '--'}°
          </Typography>
        </Row>

        <Row justify="space-between" align="center" style={{ width: '100%' }}>
          <Typography style={styles.maxminTempLabel}>
            Tmin hoy
            ({validTemperatures.minTempTime ? validTemperatures.minTempTime.split(' ')[1] : '--'})
          </Typography>
          
          {/* Temperatura de sensación */}
          {(() => {
            const heatIndex = calculateHeatIndexAemet(weatherData.external_temperature, weatherData.humidity);
            const windChill = calculateWindChill(weatherData.external_temperature, weatherData.wind_speed * 3.6); // Convertir m/s a km/h

            if (heatIndex) {
              return (
                <Typography style={{
                  ...styles.maxminTempLabel,
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
                  ...styles.maxminTempLabel,
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

      {/* Humedad, Presión y radiación  */}                 
      <Box 
        display="flex" 
        flexDirection={isMobile ? "column" : "row"} 
        alignItems="center"
        justifyContent="center"
        gap={2}
        width="100%"
      >
        {/* Humedad  */}
        <Column 
          align="center"
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
          <Row justify="flex-start" align="center">
            <Typography style={styles.datosHumedad}>
              {weatherData.humidity}%
            </Typography>
            <ShowHumTrends />
          </Row>
        </Column>

        {/* Presión */}
        <Column 
          align="center"
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
          <Row justify="flex-start" align="center">
            <Typography style={styles.datosPresion}>
              {weatherData.pressure} hPa
            </Typography>
            <ShowPressTrend />
          </Row>
        </Column>

        {/* Radiación */}
        <Column 
          align="center"
          width={isMobile ? "100%" : "auto"}
          sx={{ 
            gridArea: '2D', 
            order: 6,
            borderTop: isMobile ? '1px solid darkgrey' : 'none',
            paddingTop: isMobile ? 2 : 0
          }}
        >
          <Typography style={styles.subseccion}>
            Radiación
          </Typography>              
          <Typography style={styles.datosRadiacion}>
            {weatherData.solar_radiation} W/m²
          </Typography>
        </Column>
      </Box>

      {/* Temperatura interior, Viento y Lluvia */}
      <Box 
        display="flex" 
        flexDirection={isMobile ? "column" : "row"} 
        alignItems="flex-start"
        justifyContent="center"
        width="100%"
        gap={2}
        sx={{
          borderTop: '1px solid darkgrey',
          paddingTop: 2,
          marginTop: 2
        }}
      >
        {/* Temperatura interior */}
        <Column 
          align="center"
          width={isMobile ? "100%" : "auto"}
        >
          <Typography style={styles.subseccion}>
            Temperatura interior
          </Typography>
          <Typography style={{...styles.tempInt, marginRight: 0}}>
            {weatherData.internal_temperature.toFixed(1)}°
          </Typography>
        </Column>

        {/* Viento */}
        <Column 
          align="center"
          width={isMobile ? "100%" : "auto"}
          sx={{ 
            borderTop: isMobile ? '1px solid darkgrey' : 'none',
            paddingTop: isMobile ? 2 : 0
          }}
        >
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

        {/* Lluvia */}
        <Column 
          align="center"
          width={isMobile ? "100%" : "auto"}
          sx={{ 
            borderTop: isMobile ? '1px solid darkgrey' : 'none',
            paddingTop: isMobile ? 2 : 0
          }}
        >
          <Typography style={styles.subseccion}>
            Precipitació<a href="https://www.meteoclimatic.net/perfil/ESCAT0800000008014C" target="_blank" rel="noreferrer">n</a>
          </Typography>
          <Rain
            rainRate={weatherData.current_rain_rate}
            totalRain={weatherData.total_rain}
          />
        </Column>
      </Box>

      {/* Predicción */}
      <Column justify="center" align="center" sx={{ width: '100%', marginTop: '30px', borderTop:'1px solid darkgrey'}}>
        <Typography style={{...styles.seccion, marginTop: '20px'}}>
          Predicción (Sarrià)
        </Typography>

        <Column justify="center" align="center" sx={{ marginTop: '30px'}}>
          <iframe 
            width={isMobile ? "100%" : "500"} 
            height="187" 
            src="https://embed.windy.com/embed.html?type=forecast&location=coordinates&detail=true&detailLat=41.3950387&detailLon=2.1225328&metricTemp=°C&metricRain=mm&metricWind=km/h" 
            frameborder="0"
            title="Predicción Barcelona"
          /> 
        </Column>    
      </Column>

      {/* Histórico de temperaturas  */}
      <Column justify="center" align="center" sx={{ width: '100%', marginTop: '30px', borderTop:'1px solid darkgrey'}}>
        <Typography style={{...styles.seccion, marginTop: '20px'}}>
          Histórico de temperaturas
        </Typography>
        <TemperatureHistoryChart />
      </Column>

    </Column>
  );
};

export default DatosSarria; 