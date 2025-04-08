import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GetTempColour from './GetTempColour';
import { BACKEND_URI } from './constants';
import GetHumColor from './GetHumColor';
import { TemperatureProvider, useTemperature } from './TemperatureContext';
import GoogleAnalytics from './components/GoogleAnalytics';
import CookieConsent from './components/CookieConsent';
import CookiePolicy from './pages/CookiePolicy';
import { createStyles } from './styles';
import DesktopLayout from './components/DesktopLayout';
import MobileLayout from './components/MobileLayout';
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

  const layoutProps = {
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
  };

  return (
    <ThemeProvider theme={theme}>
      {isMobile ? (
        <MobileLayout {...layoutProps} />
      ) : (
        <DesktopLayout {...layoutProps} />
      )}
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