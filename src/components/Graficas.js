import React from 'react';
import { Box, Typography } from '@mui/material';
import TemperatureChart from '../TemperatureChart';
import IntTemperatureChart from '../IntTemperatureChart';
import PressChart from '../PressChart';
import HumChart from '../HumChart';
import RadChart from '../RadChart';
import { Column, Row } from './Layout';

const Graficas = ({ 
  styles, 
  isMobile,
  isTablet,
  timeRange, 
  handleTimeRangeChange 
}) => {
  return (
    <Column
      align="center"
      justify="flex-start"
      sx={{
        width: '100%',
        '& > *': {
          width: '100%'
        }
      }}
    >
      <Typography style={styles.seccion}>
        Gráficas (Sarrià)
      </Typography>
      <Row
        justify="flex-start" 
        gap={isTablet ? 3 : 6} 
        mt={4} 
        p={1} 
        sx={{ 
          border: "1px solid darkgrey",
          width: 'auto'
        }}
      >
        <label>
          <input
            type="radio"
            value="24h"
            checked={timeRange === '24h'}
            onChange={handleTimeRangeChange}
          />
          <Typography style={styles.periodo}>
            24h
          </Typography>
        </label>
        <label>
          <input
            type="radio"
            value="48h"
            checked={timeRange === '48h'}
            onChange={handleTimeRangeChange}
          />
          <Typography style={styles.periodo}>
            48h
          </Typography>
        </label>
        <label>
          <input
            type="radio"
            value="7d"
            checked={timeRange === '7d'}
            onChange={handleTimeRangeChange}
          />
          <Typography style={styles.periodo}>
            7d
          </Typography>
        </label>
      </Row>

      <Box sx={{ width: '100%', height: isMobile ? '200px' : isTablet ? '200px' : '320px' }}>
        <Typography style={styles.subseccion}>
          Temperatura exterior
        </Typography>
        <TemperatureChart timeRange={timeRange} isTablet={isTablet} isMobile={isMobile} />
      </Box>

      <Box sx={{ width: '100%', height: isMobile ? '180px' : isTablet ? '180px' : '320px' }}>
        <Typography style={styles.subseccion}>
          Humedad
        </Typography>
        <HumChart timeRange={timeRange} isTablet={isTablet} isMobile={isMobile} />
      </Box>

      <Box sx={{ width: '100%', height: isMobile ? '180px' : isTablet ? '180px' : '320px' }}>
        <Typography style={styles.subseccion}>
          Presión
        </Typography>
        <PressChart timeRange={timeRange} isTablet={isTablet} isMobile={isMobile} />
      </Box>

      <Box sx={{ width: '100%', height: isMobile ? '180px' : isTablet ? '180px' : '320px' }}>
        <Typography style={styles.subseccion}>
          Radiación
        </Typography>
        <RadChart timeRange={timeRange} isTablet={isTablet} isMobile={isMobile} />
      </Box>

      <Box sx={{ width: '100%', height: isMobile ? '180px' : isTablet ? '180px' : '320px' }}>
        <Typography style={styles.subseccion}>
          Temperatura interior
        </Typography>
        <IntTemperatureChart timeRange={timeRange} isTablet={isTablet} isMobile={isMobile} />
      </Box>
    </Column>
  );
};

export default Graficas; 