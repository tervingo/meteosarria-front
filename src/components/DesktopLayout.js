import { Typography, Container, Box, Card, CardMedia } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
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

      <Box className="App-header" py={4}>
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" width="100%">
          <Box>
            <Typography variant="h1" style={styles.header}>
              #meteosarria
            </Typography>
            <Typography variant="h6" style={styles.location}>
              Sarrià - Barcelona (41º 23' 42" N, 2º 7' 21" E - 110m)
            </Typography>
          </Box>
          <Card>
            <CardMedia
              component="img"
              sx={{ 
                width: "130px",
                height: "130px",
                objectFit: 'cover'
              }}
              image="/images/nubes.jpg"
              alt="Weather"
            />
          </Card>
        </Box>
      </Box>

      <Menu items={menuItems} />

      <Box className="weather-data" mt={3}>
        {loading && <Typography>Loading weather data...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        <Typography variant="h6" style={styles.dateTime}>
          {getDate(currentTime)}
        </Typography>
        {weatherData && (
          <Box className="weather-container">
            <Box 
              display="grid" 
              gap={2} 
              sx={{
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateAreas: `
                  "1I 1C 1D"
                  "2I 2C 2D"
                `
              }}
            >
              {/* GRÁFICAS - 1I */}
              <Box sx={{ gridArea: '1I', height: '100%', border: '1px solid darkgrey'}}>
                <Graficas 
                  styles={styles}
                  isMobile={false}
                  timeRange={timeRange}
                  handleTimeRangeChange={handleTimeRangeChange}
                />
              </Box>

              {/* SARRIÀ - 1C */}
              <Box sx={{ gridArea: '1C', border: '1px solid azure'}}>
                <DatosSarria 
                  weatherData={weatherData}
                  styles={styles}
                  isMobile={false}
                  currentTime={currentTime}
                  getTime={getTime}
                  validTemperatures={validTemperatures}
                />
              </Box>

              {/* BURGOS - 1D */}
              <Box sx={{ gridArea: '1D', border: '1px solid darkgrey' }}>
                <DatosBurgos 
                  burgosWeather={burgosWeather}
                  styles={styles}
                  isMobile={false}
                />
              </Box>

              {/* MODELOS */}
              <Box sx={{ gridArea: '2I', border: '1px solid darkgrey'}}>
                <Modelos 
                  styles={styles}
                  isMobile={false}
                />
              </Box>

              {/* RADAR */}
              <Box sx={{ gridArea: '2C', border: '1px solid darkgrey'}}>
                <Radar 
                  styles={styles}
                  isMobile={false}
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