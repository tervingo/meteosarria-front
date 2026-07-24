import { Typography, Container, Box, Card, CardMedia } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import { Link } from 'react-router-dom'; // Agregar este import
import Menu from '../Menu';
import DatosBurgos from './DatosBurgos';
import DatosSarria from './DatosSarria';
import Graficas from './Graficas';
import Modelos from './Modelos';
import Radar from './Radar';
import TemperatureBackground from '../TemperatureBackground';

const DesktopLayout = ({
  weatherData,
  burgosWeather,
  lastBurgosUpdate,
  loading,
  error,
  currentTime,
  timeRange,
  handleTimeRangeChange,
  styles,
  menuItems,
  getDate,
  getTime,
  validTemperatures,
  isTablet,
  dashboardIcon
}) => {
  return (
    <Container 
      maxWidth={false} 
      className="App"
      sx={{
        px: { sm: 2, md: 3 },
        maxWidth: isTablet ? '100%' : '1920px',
        overflowX: 'hidden'
      }}
    >
      {weatherData && <TemperatureBackground temperature={weatherData.external_temperature} />}

      <Box className="App-header" py={isTablet ? 2 : 4}>
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" width="100%">
          <Box>
            <Typography variant="h1" style={styles.header}>
              #meteosarria
            </Typography>
            <Typography variant="h6" style={styles.location}>
              Sarrià - Barcelona {!isTablet && "(41º 23' 42\" N, 2º 7' 21\" E - 110m)"}
            </Typography>
          </Box>
          <Card>
            <CardMedia
              component="img"
              sx={{ 
                width: isTablet ? "100px" : "130px",
                height: isTablet ? "100px" : "130px",
                objectFit: 'cover'
              }}
              image="/images/nubes.jpg"
              alt="Weather"
            />
          </Card>
        </Box>
      </Box>

      {/* Menú con enlace a estadísticas agregado */}
      <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
        <Menu items={menuItems} />
        
        {/* Enlaces a Estadísticas a la derecha del menú */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {dashboardIcon}
          <Link 
            to="/estadisticas"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: '#90EE90', // Verde claro como los otros enlaces del menú
              fontSize: '1rem',
              fontWeight: '500',
              padding: '8px 16px',
              borderRadius: '6px',
              transition: 'background-color 0.2s, transform 0.2s'
            }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(144, 238, 144, 0.1)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Estadísticas de Sarrià
        </Link>
        <Link 
          to="/estadisticas-burgos"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#90EE90', // Verde claro como los otros enlaces del menú
            fontSize: '1rem',
            fontWeight: '500',
            padding: '8px 16px',
            borderRadius: '6px',
            transition: 'background-color 0.2s, transform 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(144, 238, 144, 0.1)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Estadísticas de Burgos
        </Link>
        <Link
          to="/prediccion/barcelona"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#90EE90', // Verde claro como los otros enlaces del menú
            fontSize: '1rem',
            fontWeight: '500',
            padding: '8px 16px',
            borderRadius: '6px',
            transition: 'background-color 0.2s, transform 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(144, 238, 144, 0.1)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Predicción Barcelona
        </Link>
        <Link
          to="/prediccion/burgos"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#90EE90', // Verde claro como los otros enlaces del menú
            fontSize: '1rem',
            fontWeight: '500',
            padding: '8px 16px',
            borderRadius: '6px',
            transition: 'background-color 0.2s, transform 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(144, 238, 144, 0.1)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Predicción Burgos
        </Link>
        <Link
          to="/graphcast"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#90EE90',
            fontSize: '1rem',
            fontWeight: '500',
            padding: '8px 16px',
            borderRadius: '6px',
            transition: 'background-color 0.2s, transform 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(144, 238, 144, 0.1)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          AIFS
        </Link>
        </Box>
      </Box>

      <Box className="weather-data" mt={3}>
        {loading && <Typography>Loading weather data...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        <Typography variant="h6" style={styles.dateTime}>
          {getDate(currentTime)} - {getTime(currentTime)}
        </Typography>
        {weatherData && (
          <Box className="weather-container">
            <Box
              display="grid"
              gap={2}
              sx={{
                // Responsive column count so the layout never overflows on
                // tablets/iPads: 1 col on narrow tablets, 2 cols on iPad
                // (portrait ~960-1280px), 3 cols on wide desktops (>=1280px).
                // Items flow in source order (no fixed gridTemplateAreas).
                gridTemplateColumns: {
                  sm: '1fr',
                  md: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))'
                },
                '& > *': {
                  minWidth: 0,
                  width: '100%'
                }
              }}
            >
              {/* GRÁFICAS - 1I */}
              <Box sx={{
                height: '100%',
                border: '1px solid darkgrey',
                overflowX: 'hidden'
              }}>
                <Graficas 
                  styles={styles}
                  isMobile={false}
                  isTablet={isTablet}
                  timeRange={timeRange}
                  handleTimeRangeChange={handleTimeRangeChange}
                />
              </Box>

              {/* SARRIÀ - 1C */}
              <Box sx={{
                border: '1px solid azure',
                overflowX: 'hidden'
              }}>
                <DatosSarria 
                  weatherData={weatherData}
                  styles={styles}
                  isMobile={false}
                  isTablet={isTablet}
                  currentTime={currentTime}
                  getTime={getTime}
                  validTemperatures={validTemperatures}
                />
              </Box>

              {/* BURGOS - 1D */}
              <Box sx={{
                border: '1px solid darkgrey',
                overflowX: 'hidden'
              }}>
                <DatosBurgos 
                  burgosWeather={burgosWeather}
                  lastBurgosUpdate={lastBurgosUpdate}
                  styles={styles}
                  isMobile={false}
                  isTablet={isTablet}
                />
              </Box>

              {/* MODELOS */}
              <Box sx={{
                border: '1px solid darkgrey',
                overflowX: 'hidden'
              }}>
                <Modelos 
                  styles={styles}
                  isMobile={false}
                  isTablet={isTablet}
                />
              </Box>

              {/* RADAR */}
              <Box sx={{
                border: '1px solid darkgrey',
                overflowX: 'hidden'
              }}>
                <Radar 
                  styles={styles}
                  isMobile={false}
                  isTablet={isTablet}
                />
              </Box>

              {/* ANOMALÍAS DE TEMPERATURA - VENTUSKY */}
              <Box sx={{
                border: '1px solid darkgrey',
                overflowX: 'hidden',
                position: 'relative',
                height: '100%',
                minHeight: '400px'
              }}>
                <iframe 
                  src="https://www.ventusky.com/es/temperatura-mapa/anomalia-2m#p=41.5;-1;4" 
                  title="Anomalías de Temperatura - Ventusky"
                  width="100%" 
                  height="100%" 
                  frameBorder="0"
                  style={{
                    border: 'none',
                    display: 'block'
                  }}
                />
              </Box>

            </Box>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 4, mb: 2, textAlign: 'center' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: 4 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon sx={{ color: 'gray', fontSize: '1rem' }} />
            <Typography variant="body2">
              <a href="mailto:meteosarria@gmail.com" style={{ color: 'gray', textDecoration: 'none' }}>
                meteosarria@gmail.com
              </a>
            </Typography>
          </Box>
          <Typography variant="body2" style={{ color: 'gray' }}>
            ® www.meteosarria.com 2025
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default DesktopLayout;