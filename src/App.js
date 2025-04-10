import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet'; // Importar React Helmet
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
import BcnBurLayout from './components/BcnBurLayout';

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
    validTemperatures,
    isTablet
  };

  return (
    <ThemeProvider theme={theme}>
      {/* Agregar Helmet para la ruta principal */}
      <Helmet>
        {/* <link rel="icon" href="/nubes.ico" /> */}
        <link rel="icon" type="image/x-icon" href={`${process.env.PUBLIC_URL}/nubes.ico`} />
        <link rel="apple-touch-icon" href="/nubes.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/nubes-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/nubes-180x180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/nubes-167x167.png" />
        {/* <link rel="manifest" href="/manifest.json" /> */}
        <meta name="apple-mobile-web-app-title" content="Meteosarria" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>Meteo Sarria</title>
      </Helmet>
      {isMobile ? (
        <MobileLayout {...layoutProps} />
      ) : (
        <DesktopLayout {...layoutProps} />
      )}
    </ThemeProvider>
  );
}

function BcnBurContent() {
  const [weatherData, setWeatherData] = useState(null);
  const [burgosWeather, setBurgosWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    console.log('BcnBurContent mounted');
    const fetchData = async () => {
      try {
        console.log('Fetching data...');
        const [weatherResponse, burgosResponse] = await Promise.all([
          axios.get(BACKEND_URI + '/api/live'),
          axios.get(BACKEND_URI + '/api/burgos-weather')
        ]);
        console.log('Weather data:', weatherResponse.data);
        console.log('Burgos data:', burgosResponse.data);
        setWeatherData(weatherResponse.data);
        setBurgosWeather(burgosResponse.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setError("Failed to fetch weather data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 60000);

    return () => {
      console.log('BcnBurContent unmounted');
      clearInterval(intervalId);
    };
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      {/* Agregar Helmet para la ruta BcnBur */}
      <Helmet>
        <link rel="icon" href="/paramo.ico" />
        <link rel="apple-touch-icon" href="/paramo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/paramo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/paramo.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/paramo.png" />
        {/* <link rel="manifest" href="/bcnbur-manifest.json" /> */}
        <meta name="apple-mobile-web-app-title" content="MeteoBcnBur" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>MeteoBcnBur</title>
      </Helmet>
      <BcnBurLayout
        weatherData={weatherData}
        burgosWeather={burgosWeather}
        loading={loading}
        error={error}
        currentTime={currentTime}
        getDate={getDate}
        getTime={getTime}
      />
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
          <Route path="/bcnbur" element={<BcnBurContent />} />
          <Route path="/" element={<AppContent />} />
        </Routes>
        <CookieConsent />
      </TemperatureProvider>
    </Router>
  );
}

export default App;