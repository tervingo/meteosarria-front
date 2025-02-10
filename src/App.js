import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Typography, useMediaQuery, Container, Box } from '@mui/material';
import { Card, CardMedia } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TemperatureBackground from './TemperatureBackground';
import GetTempColour from './GetTempColour';
import GetWindDir from './GetWindDir';
import WindDirectionIndicator from './WindDirectionIndicator';
import TemperatureChart from './TemperatureChart';
import PressChart from './PressChart';
import HumChart from './HumChart';
import ShowTempDiffs from './ShowTempDiffs';
import ShowPressTrend from './ShowPressTrend';
import ShowHumTrends from './ShowHumTrends';
import RadChart from './RadChart';
import Menu from './Menu';
import { BACKEND_URI } from './constants';

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

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRange, setTimeRange] = useState('24h');

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
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const formatDate = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} (${day}.${month}.${year})`;
  };

/*  
  const Menu = ({ items }) => {
    return (
      <nav style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '8px' : '16px',
        padding: isMobile ? '10px' : '20px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {items.map(item => (
          <a
            key={item.label}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: isMobile ? '8px' : '12px',
              fontSize: isMobile ? '14px' : '28px'
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    );
  }; */

  const menuItems = [
    { label: 'AEMET', url: 'https://www.aemet.es/es/portada' },
    { label: 'Meteocat', url: 'https://www.meteo.cat/' },
    { label: 'Meteo Renuncio', url: 'https://renuncio.com/meteorologia/actual' },
    { label: 'Webcam Burgos', url: 'https://ibericam.com/espana/burgos/webcam-burgos-catedral-de-burgos/' },
    { label: 'Meteociel', url: 'https://meteociel.fr' },
    { label: 'Windy', url: 'https://www.windy.com' },
    { label: 'Modelos', url: 'https://meteologix.com/es/model-charts/standard/europe/temperature-850hpa.html' }
  ];

  // Responsive styles
  const styles = {
    header: {
      fontSize: isMobile ? '2.5rem' : isTablet ? '4rem' : '6rem',
      color: 'Gray',
      marginBottom: isMobile ? '10px' : '20px',
      marginRight: isMobile ? '0' : '30px'
    },
    dateTime: {
      fontSize: isMobile ? '1.5rem' : isTablet ? '2rem' : '3rem',
      color: 'DarkGray'
    },
    location: {
      fontSize: isMobile ? '0.8rem' : '1rem',
      color: 'DarkGray'
    },
    temperature: {
      fontSize: isMobile ? '5rem' : isTablet ? '8rem' : '11rem',
      color: weatherData ? GetTempColour(weatherData.external_temperature) : 'Gray'
    },
    dataDisplay: {
      fontSize: isMobile ? '2rem' : isTablet ? '3rem' : '4rem',
      color: 'DarkGray'
    }
  };

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
              <Typography variant="h6" style={styles.dateTime}>
                {formatDate(currentTime)}
              </Typography>
              <Typography variant="h6" style={styles.location}>
                Sarrià - Barcelona (41º 23' 42" N, 2º 7' 21" E - 110m)
              </Typography>
            </Box>
            {!isMobile && (
              <Card>
                <CardMedia
                  component="img"
                  width={isMobile ? 100 : 180}
                  height={isMobile ? 100 : 180}
                  image="/images/nubes.jpg"
                  alt="Weather"
                  sx={{ objectFit: 'cover' }}
                />
              </Card>
            )}
          </Box>
        </Box>

        <Menu items={menuItems} />

        <Box className="weather-data" mt={3}>
          {loading && <Typography>Loading weather data...</Typography>}
          {error && <Typography color="error">{error}</Typography>}

          {weatherData && (
            <Box className="weather-container">
              <Box 
                display="grid" 
                gap={2} 
                sx={{
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gridTemplateAreas: isMobile ? `
                    "temperature"
                    "wind"
                    "chart"
                    "humidity"
                    "pressure"
                    "radiation"
                    "maps"
                    "pred"
                    "webcam"
                  ` : `
                    "wind temperature chart"
                    "humidity pressure radiation"
                    "maps pred webcam"
                  `
                }}
              >
                {/* Wind Direction Section */}
                <Box 
                  display="flex" 
                  justifyContent="center" 
                  alignItems="center"
                  sx={{ gridArea: 'wind' }}
                >
                  <WindDirectionIndicator
                    direction={weatherData.wind_direction}
                    speed={weatherData.wind_speed}
                    rose={GetWindDir(weatherData.wind_direction)}
                    size={isMobile ? 'small' : 'normal'}
                  />
                </Box>

                {/* Temperature Section */}
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center"
                  sx={{ gridArea: 'temperature' }}
                >
                  <Box display="flex" alignItems="center">
                    <Typography style={styles.temperature}>
                      {weatherData.external_temperature.toFixed(1)}°
                    </Typography>
                    <ShowTempDiffs />
                  </Box>
                </Box>

                {/* Chart Controls Section */}
                <Box sx={{ gridArea: 'chart' }}>
                  <Box display="flex" justifyContent="center" gap={2} mb={2}>
                    <label>
                      <input
                        type="radio"
                        value="24h"
                        checked={timeRange === '24h'}
                        onChange={handleTimeRangeChange}
                      />
                      24h
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="48h"
                        checked={timeRange === '48h'}
                        onChange={handleTimeRangeChange}
                      />
                      48h
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="7d"
                        checked={timeRange === '7d'}
                        onChange={handleTimeRangeChange}
                      />
                      7d
                    </label>
                  </Box>
                  <TemperatureChart timeRange={timeRange} />
                </Box>

                {/* Humidity Section */}
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center"
                  sx={{ gridArea: 'humidity' }}
                >
                  <Box display="flex" alignItems="center">
                    <Typography style={styles.dataDisplay}>
                      {weatherData.humidity}%
                    </Typography>
                    <ShowHumTrends />
                  </Box>
                  <HumChart timeRange={timeRange} />
                </Box>

                {/* Pressure Section */}
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center"
                  sx={{ gridArea: 'pressure' }}
                >
                  <Box display="flex" alignItems="center">
                    <Typography style={styles.dataDisplay}>
                      {weatherData.pressure} hPa
                    </Typography>
                    <ShowPressTrend />
                  </Box>
                  <PressChart timeRange={timeRange} />
                </Box>

                {/* Radiation Section */}
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center"
                  sx={{ gridArea: 'radiation' }}
                >
                  <Typography style={styles.dataDisplay}>
                    {weatherData.solar_radiation} W/m²
                  </Typography>
                  <RadChart timeRange={timeRange} />
                </Box>

                {/* Maps Section */}
                <Box sx={{ gridArea: 'maps' }}>
                  <iframe
                    width="100%"
                    height={isMobile ? "250px" : "300px"}
                    src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=4&overlay=temp&product=ecmwf&level=surface&lat=44.778&lon=7.646&pressure=true&message=true"
                    frameBorder="0"
                    title="Weather Map"
                  />
                </Box>

                {/* Predicción Section */}
                <Box sx={{ gridArea: 'pred' }}>
                  <iframe 
                    name="iframe_aemet_id33044" 
                    width="100%" 
                    height="100%" 
                    tabindex="0" 
                    id="iframe_aemet_id33044" 
                    src="https://www.aemet.es/es/eltiempo/prediccion/municipios/mostrarwidget/barcelona-id08019?w=g4p01110001ohmffffffw500z250x4f86d9t95b6e9r1s8n2" 
                    frameborder="0"
                    title="Predicción AEMET" 
                    scrolling="no">
                  </iframe>
                </Box>

                {/* Webcam Section */}
                <Box sx={{ gridArea: 'webcam' }}>
                  <a
                    name="windy-webcam-timelapse-player"
                    data-id="1735243432"
                    data-play="day"
                    data-loop="0"
                    data-auto-play="0"
                    data-force-full-screen-on-overlay-play="0"
                    data-interactive="1"
                    href="https://windy.com/webcams/1735243432"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Burgos: Burgos Cathedral
                  </a>
                  <script async type="text/javascript" src="https://webcams.windy.com/webcams/public/embed/v2/script/player.js"></script>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;