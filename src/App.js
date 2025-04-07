import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Typography, useMediaQuery, Container, Box } from '@mui/material';
import { Card, CardMedia } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TemperatureBackground from './TemperatureBackground';
import GetTempColour from './GetTempColour';
import Menu from './Menu';
import { BACKEND_URI } from './constants';
import GetHumColor from './GetHumColor';
import { TemperatureProvider, useTemperature } from './TemperatureContext';
import GoogleAnalytics from './components/GoogleAnalytics';
import CookieConsent from './components/CookieConsent';
import CookiePolicy from './pages/CookiePolicy';
import EmailIcon from '@mui/icons-material/Email';
import DatosBurgos from './components/DatosBurgos';
import DatosSarria from './components/DatosSarria';
import Graficas from './components/Graficas';
import Modelos from './components/Modelos';
import Radar from './components/Radar';
import { createStyles } from './styles';
// import RadarAemet from './components/RadarAEMET';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

function AppContent() {
  const [weatherData, setWeatherData] = useState(null);
  const [burgosWeather, setBurgosWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRange, setTimeRange] = useState('24h');
  const { validTemperatures } = useTemperature();

  // Media queries for responsive design
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(BACKEND_URI + '/api/live');
        setWeatherData(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setError("Failed to fetch weather data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchBurgosWeather = async () => {
      try {
        const response = await axios.get(BACKEND_URI + '/api/burgos-weather');
        setBurgosWeather(response.data);
        console.log('burgosWeather: ', response.data);
      } catch (error) {
        console.error("Error fetching Burgos weather data:", error);
      }
    };

    fetchBurgosWeather();
    const burgosIntervalId = setInterval(fetchBurgosWeather, 900000); // 15 minutes

    return () => clearInterval(burgosIntervalId);
  }, []);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const getDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const getTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const menuItems = [
    { label: 'AEMET', url: 'https://www.aemet.es/es/portada' },
    { label: 'Meteocat', url: 'https://www.meteo.cat/' },
    { label: 'Radar', url: 'https://www.meteo.cat/observacions/radar'},
    { label: 'Meteoclimatic', url: 'https://www.meteoclimatic.net/' },
    { label: 'Webcam Collserola', url: 'https://www.3cat.cat/el-temps/collserola-barcelona/camera/2/' },
    { label: 'Meteociel', url: 'https://meteociel.fr' },
    { label: 'Windy', url: 'https://www.windy.com' },
    { label: 'Modelos', url: 'https://meteologix.com/es/model-charts/standard/europe/temperature-850hpa.html' }
  ];

  // Create styles using the imported function
  const styles = createStyles(isMobile, isTablet, weatherData, GetTempColour, GetHumColor);

  // console.log('weatherData: ', weatherData);

  return (
    <ThemeProvider theme={theme}>
      
      <Container maxWidth="xl" className="App">
        {weatherData && <TemperatureBackground temperature={weatherData.external_temperature} />}

        <Box className="App-header" py={isMobile ? 2 : 4}>
          <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} alignItems="center" justifyContent="space-between" width="100%">
            <Box>
              <Typography variant="h1" style={styles.header}>
                #meteosarria
              </Typography>

              <Typography variant="h6" style={styles.location}>
                Sarrià - Barcelona (41º 23' 42" N, 2º 7' 21" E - 110m)
              </Typography>
            </Box>
            {!isMobile && (
            <Card>
                <CardMedia
                  component="img"
                  sx={{ 
                    width: isMobile ? "80px" : "130px",
                    height: isMobile ? "80px" : "130px",
                    objectFit: 'cover'
                  }}
                  image="/images/nubes.jpg"
                  alt="Weather"
                />
          </Card>
            )}
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
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gridTemplateAreas: isMobile ? `
                    "1I"
                    "1C"
                    "1D"
                    "2I"
                    "2C"
                    "2D"
                  ` : `
                    "1I 1C 1D"
                    "2I 2C 2D"
                  `
                }}
              >
                {/* GRÁFICAS - 1I */}
                <Box sx={{ gridArea: '1I', order: isMobile ? 3 : 1, height: '100%', border: '1px solid darkgrey'}}>
                  <Graficas 
                    styles={styles}
                    isMobile={isMobile}
                    timeRange={timeRange}
                    handleTimeRangeChange={handleTimeRangeChange}
                  />
                </Box>

                {/* SARRIÀ - 1C */}
                <Box sx={{ gridArea: '1C', order: isMobile ? 1 : 2, border: '1px solid azure'}}>
                  <DatosSarria 
                    weatherData={weatherData}
                    styles={styles}
                    isMobile={isMobile}
                    currentTime={currentTime}
                    getTime={getTime}
                    validTemperatures={validTemperatures}
                  />
                </Box>

                {/* BURGOS - 1D */}
                <Box sx={{ gridArea: '1D', order: isMobile ? 2 : 3, border: '1px solid darkgrey' }}>
                  <DatosBurgos 
                    burgosWeather={burgosWeather}
                    styles={styles}
                    isMobile={isMobile}
                  />
                </Box>

                {/* MODELOS */}
                <Box sx={{ gridArea: '2I', order: isMobile ? 4 : 4, border: '1px solid darkgrey'}}>
                  <Modelos 
                    styles={styles}
                    isMobile={isMobile}
                  />
                </Box>

                {/* RADAR */}
                <Box sx={{ gridArea: '2C  ', order: isMobile ? 5 : 5, border: '1px solid darkgrey'}}>
                  <Radar 
                    styles={styles}
                    isMobile={isMobile}
                  />
                </Box>

                {/* RADAR AEMET 
                <Box sx={{ gridArea: '2D  ', order: isMobile ? 6 : 6, border: '1px solid darkgrey'}}>
                  <RadarAemet />
                </Box>
                */}
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
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <TemperatureProvider>
        <GoogleAnalytics />
        <Routes>
          <Route path="/politica-cookies" element={<CookiePolicy />} />
          <Route path="/" element={<AppContent />} />
        </Routes>
        <CookieConsent />
      </TemperatureProvider>
    </Router>
  );
}

export default App;