import React from 'react';
import { Box, Typography } from '@mui/material';
import ShowTempDiffs from '../ShowTempDiffs';
import ShowHumTrends from '../ShowHumTrends';
import ShowPressTrend from '../ShowPressTrend';
import WindDirectionIndicator from '../WindDirectionIndicator';
import GetWindDir from '../GetWindDir';
import Rain from '../Rain';
import GetTempColour from '../GetTempColour';

const DatosSarria = ({ 
  weatherData, 
  styles, 
  isMobile, 
  currentTime, 
  getTime, 
  validTemperatures 
}) => {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      justifyContent="flex-start"
      alignItems="center"
    >
      <Typography style={styles.seccion}>
        Datos actuales en Sarrià a las {getTime(currentTime)}
      </Typography>              

      {/* Temperatura  */}
      <Typography style={styles.subseccion}>
        Temperatura exterior
      </Typography>              
      <Box display="flex" flexDirection="column" alignItems="flex-start">
        <Typography style={{
          ...styles.maxTemp,
          color: (weatherData.max_temperature <= 45 ? weatherData.max_temperature : validTemperatures.maxTemp) ? 
            GetTempColour(weatherData.max_temperature <= 45 ? weatherData.max_temperature : validTemperatures.maxTemp) : 
            'Gray'
        }}>
          <Box display="flex" flexDirection="row" alignItems="flex-start">
            <Typography style={styles.maxminTempLabel}>
              Tmax hoy 
              ({validTemperatures.maxTempTime ? validTemperatures.maxTempTime.split(' ')[1] : '--'})                      
            </Typography>
          </Box>
          <Box display="flex" flexDirection="row" alignItems="flex-end">
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
          </Box>
        </Typography>

        <Box display="flex" flexDirection="row" alignItems="center">
          <Typography style={styles.temperature}>
            {weatherData.external_temperature.toFixed(1)}°
          </Typography>
          <ShowTempDiffs />
        </Box>

        <Box display="flex" flexDirection="row" alignItems="center">
          <Typography style={{
            ...styles.minTemp,
            color: (weatherData.min_temperature <= 45 ? weatherData.min_temperature : validTemperatures.minTemp) ? 
              GetTempColour(weatherData.min_temperature <= 45 ? weatherData.min_temperature : validTemperatures.minTemp) : 
              'Gray'
          }}>
            {weatherData.min_temperature <= 45 ? weatherData.min_temperature : validTemperatures.minTemp?.toFixed(1) || '--'}°
          </Typography>
        </Box>

        <Typography style={styles.maxminTempLabel}>
          Tmin hoy
          ({validTemperatures.minTempTime ? validTemperatures.minTempTime.split(' ')[1] : '--'})
        </Typography>
      </Box>

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
            <ShowHumTrends />
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
            <ShowPressTrend />
          </Box>
        </Box>

        {/* Radiación */}
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center"
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
        </Box>
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
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center"
          width={isMobile ? "100%" : "auto"}
        >
          <Typography style={styles.subseccion}>
            Temperatura interior
          </Typography>
          <Typography style={{...styles.tempInt, marginRight: 0}}>
            {weatherData.internal_temperature.toFixed(1)}°
          </Typography>
        </Box>

        {/* Viento */}
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center"
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
        </Box>

        {/* Lluvia */}
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center"
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
        </Box>
      </Box>

      {/* Predicción */}
      <Box sx={{ width: '100%', marginTop: '30px', borderTop:'1px solid darkgrey'}}>
        <Typography style={{...styles.seccion, marginTop: '20px'}}>
          Predicción (Sarrià)
        </Typography>

        <Box 
          width="100%" 
          display="flex"
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          marginTop="30px"
        >
          <iframe 
            width={isMobile ? "100%" : "500"} 
            height="187" 
            src="https://embed.windy.com/embed.html?type=forecast&location=coordinates&detail=true&detailLat=41.3950387&detailLon=2.1225328&metricTemp=°C&metricRain=mm&metricWind=km/h" 
            frameborder="0"
            title="Predicción Barcelona"
          /> 
        </Box>    
      </Box>      

    </Box>
  );
};

export default DatosSarria; 