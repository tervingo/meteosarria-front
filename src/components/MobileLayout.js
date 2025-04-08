import { Typography, Container, Box } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import Menu from '../Menu';
import DatosBurgos from './DatosBurgos';
import DatosSarria from './DatosSarria';
import Graficas from './Graficas';
import Modelos from './Modelos';
import Radar from './Radar';
import TemperatureBackground from '../TemperatureBackground';

const MobileLayout = ({
  weatherData,
  burgosWeather,
  loading,
  error,
  currentTime,
  timeRange,
  handleTimeRangeChange,
  styles,
  menuItems,
  getDate,
  getTime,
  validTemperatures
}) => {
  return (
    <Container maxWidth="xl" className="App">
      {weatherData && <TemperatureBackground temperature={weatherData.external_temperature} />}

      <Box className="App-header" py={2}>
        <Box display="flex" flexDirection="column" alignItems="center" width="100%">
          <Typography variant="h1" style={styles.header}>
            #meteosarria
          </Typography>
          <Typography variant="h6" style={styles.location}>
            Sarrià - Barcelona
          </Typography>
        </Box>
      </Box>

      <Menu items={menuItems} />

      <Box className="weather-data">
        {loading && <Typography>Loading weather data...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        <Typography variant="h6" style={styles.dateTime}>
          {getDate(currentTime)}
        </Typography>

        {weatherData && (
          <Box className="weather-container" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* SARRIÀ - Principal */}
            <Box sx={{ border: '1px solid azure', padding: 2 }}>
              <DatosSarria 
                weatherData={weatherData}
                styles={styles}
                isMobile={true}
                currentTime={currentTime}
                getTime={getTime}
                validTemperatures={validTemperatures}
              />
            </Box>

            {/* GRÁFICAS */}
            <Box sx={{ border: '1px solid darkgrey', padding: 2 }}>
              <Graficas 
                styles={styles}
                isMobile={true}
                timeRange={timeRange}
                handleTimeRangeChange={handleTimeRangeChange}
              />
            </Box>

            {/* BURGOS */}
            <Box sx={{ border: '1px solid darkgrey', padding: 2 }}>
              <DatosBurgos 
                burgosWeather={burgosWeather}
                styles={styles}
                isMobile={true}
              />
            </Box>

            {/* RADAR */}
            <Box sx={{ border: '1px solid darkgrey', padding: 2 }}>
              <Radar 
                styles={styles}
                isMobile={true}
              />
            </Box>

            {/* MODELOS */}
            <Box sx={{ border: '1px solid darkgrey', padding: 2 }}>
              <Modelos 
                styles={styles}
                isMobile={true}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 4, mb: 2, textAlign: 'center' }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          gap: 2 
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

export default MobileLayout; 