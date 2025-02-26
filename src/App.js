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
import BurgosWeather from './BurgosWeather';
import Menu from './Menu';
import TemperatureHistoryChart from './TemperatureHistoryChart';
import Rain from './Rain';
import { BACKEND_URI } from './constants';
import GetHumColor from './GetHumColor';

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
  const [burgosWeather, setBurgosWeather] = useState(null);
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
    const fetchBurgosWeather = async () => {
      try {
        const response = await axios.get(BACKEND_URI + '/api/burgos-weather');
        setBurgosWeather(response.data);
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
    { label: 'Meteoclimatic', url: 'https://www.meteoclimatic.net/' },
    { label: 'Webcam Collserola', url: 'https://www.3cat.cat/el-temps/collserola-barcelona/camera/2/' },
    { label: 'Meteociel', url: 'https://meteociel.fr' },
    { label: 'Windy', url: 'https://www.windy.com' },
    { label: 'Modelos', url: 'https://meteologix.com/es/model-charts/standard/europe/temperature-850hpa.html' }
  ];

  // Responsive styles
  const styles = {
    header: {
      fontSize: isMobile ? '2.5rem' : isTablet ? '4rem' : '4rem',
      color: 'azure',
      marginBottom: isMobile ? '10px' : '10px',
      marginRight: isMobile ? '0' : '30px'
    },
    dateTime: {
      fontSize: isMobile ? '1.5rem' : isTablet ? '2rem' : '2rem',
      color: 'DarkGray'
    },
    location: {
      fontSize: isMobile ? '0.8rem' : '1rem',
      color: 'DarkGray'
    },
    temperature: {
      fontSize: isMobile ? '5rem' : isTablet ? '8rem' : '8rem',
      color: weatherData ? GetTempColour(weatherData.external_temperature) : 'Gray'
    },
    dataDisplay: {
      fontSize: isMobile ? '2rem' : isTablet ? '2rem' : '2rem',
      color: 'azure'
    },
    datosHumedad: {
      fontSize: isMobile ? '2rem' : isTablet ? '2rem' : '2rem',
      color: weatherData ? GetHumColor(weatherData.humidity) : 'chartreuse'
    },
    datosPresion: {
      fontSize: isMobile ? '2rem' : isTablet ? '2rem' : '2rem',
      color: 'orangeRed'
    },
    datosRadiacion: {
      fontSize: isMobile ? '2rem' : isTablet ? '2rem' : '2rem',
      color: 'gold'
    },
    etiquetaHistorico: {
      fontSize: isMobile ? '1rem' : isTablet ? '1.5rem' : '1.5rem',
      color: 'DarkGray' 
    },
    titulo: {
      fontSize: isMobile ? '1rem' : isTablet ? '1.5rem' : '1.5rem',
      color: 'silver',
      marginBottom: '2rem'
      },
    etiqueta: {
      fontSize: isMobile ? '1rem' : isTablet ? '1.5rem' : '1.5rem',
      color: 'azure' 
    },
    seccion: {
      fontSize: isMobile ? '1rem' : isTablet ? '1.5rem' : '1.6rem',
      color: 'azure',
      marginTop: '10px',
      justifyContent: 'right'
    }, 
    subseccion: {
      fontSize: isMobile ? '1rem' : isTablet ? '1.4rem' : '1.4rem',
      color: 'lightblue',
      marginTop: '20px',
      marginBottom: '20px'
    },
    periodo: {
      fontSize: isMobile ? '0.9rem' : isTablet ? '0.9rem' : '0.9rem',
      color: 'azure',
    },
    catedral: {
      fontSize:  '1rem',
      color: 'lightblue'     
    }

  };

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
              <Typography variant="h6" style={styles.dateTime}>
                {getDate(currentTime)}
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
                    width: isMobile ? "80px" : "150px",
                    height: isMobile ? "80px" : "150px",
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

          {weatherData && (
            <Box className="weather-container">
              <Box 
                display="grid" 
                gap={2} 
                sx={{
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gridTemplateAreas: isMobile ? `
                    "1D"
                    "1C"
                    "1I"
                    "2I"
                    "2C"
                    "2D"
                    "3I"
                    "3C"
                    "3D"
                  ` : `
                    "1C 1I 1D"
                    "2I 2C 2D"
                    "3I 3C 3D"
                  `
                }}
              >
                {/* BURGOS */}
                <Box 
                  display="flex" 
                  flexDirection="column"
                  justifyContent="flex-start"
                  alignItems="center"
                  sx={{ gridArea: '1I',  order: isMobile ? 2 : 3, border: '1px solid darkgrey'  }}
                >
                  <Typography style={styles.seccion}>
                      Datos actuales en Burgos
                  </Typography>              
                  <Typography style={styles.subseccion}>
                      Temperatura y humedad
                  </Typography>              
                  <BurgosWeather weatherData={burgosWeather}/>
                  <Typography style={styles.subseccion}>
                      WebCam
                  </Typography>              

                  {/* Webcam Catedral de Burgos */}
                  <Box sx={{ width: '500px', height: '280px' }} > {/* Reducida la altura de 350px a 280px */}
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
                    Burgos: Burgos Catedral
                  </a>
                  <script async type="text/javascript" src="https://webcams.windy.com/webcams/public/embed/v2/script/player.js"></script>
                  </Box>

                  <Typography style={{ ...styles.catedral, marginTop: '-1px' }}>
                  <a href="https://ibericam.com/espana/burgos/webcam-burgos-catedral-de-burgos/" target="_blank" rel='noreferrer'>
                    Webcam Catedral de Burgos
                  </a>
                  </Typography>

                  <Box sx={{ width: '100%', marginTop: '20px', borderTop:'1px solid darkgrey'}} >
                    <Typography style={ styles.seccion}>
                      Predicción
                    </Typography>

                    <Box 
                      width="100%" 
                      display="flex"
                      justifyContent="center" 
                      alignItems="center" 
                      marginTop="30px"
                    >
                      <iframe 
                        width="500" 
                        height="187" 
                        src="https://embed.windy.com/embed.html?type=forecast&location=coordinates&detail=true&detailLat=42.343926001&detailLon=-3.696977&metricTemp=°C&metricRain=mm&metricWind=km/h" 
                        frameborder="0"
                        title="Predicción Burgos"
                        >
                      </iframe>
                    </Box>
                  </Box>

                  <Box sx={{ width: '100%', marginTop: '20px', borderTop:'1px solid darkgrey'}} >
                    <Typography style={styles.seccion}>
                        Modelo numérico
                    </Typography>              

                    <br/>
                    <iframe
                      width="95%"
                      height={isMobile ? "250px" : "300px"}     
                      src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=4&overlay=temp&product=ecmwf&level=surface&lat=44.778&lon=7.646&pressure=true&message=true"
                      frameBorder="0"
                      title="Weather Map"
                    />
                  </Box>
                </Box>

                {/* SARRIÀ */}
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  justifyContent="flex-start"
                  alignItems="center"
                  sx={{ gridArea: '1C',  order: isMobile ? 1 : 2, border: '1px solid azure'}}
                >
                  <Typography style={styles.seccion}>
                      Datos actuales en Sarrià a las {getTime(currentTime)}
                  </Typography>              

                  {/* Temperatura  */}

                  <Typography style={styles.subseccion}>
                      Temperatura exterior
                  </Typography>              
                  <Box display="flex" alignItems="center">
                    <Typography style={styles.temperature}>
                      {weatherData.external_temperature.toFixed(1)}°
                    </Typography>
                    <ShowTempDiffs />
                  </Box>

                   <Box 
                    display="flex" 
                    flexDirection="row" 
                    alignItems="center"
                    >
                      <Box display="column" flexDirection="row" alignItems="center">
                        <Typography style={styles.subseccion}>
                            Viento
                        </Typography>
                        <WindDirectionIndicator
                          direction={weatherData.wind_direction}
                          speed={weatherData.wind_speed}
                          rose={GetWindDir(weatherData.wind_direction)}
                          size={isMobile ? 'small' : 'normal'}
                        />
                      </Box>
                      <Box display="column" flexDirection="row" alignItems="center">
                        <Typography style={styles.subseccion}>
                            Precipitación
                        </Typography>
                        <Rain
                          rainRate={weatherData.current_rain_rate}
                          totalRain={weatherData.total_rain}
                        />
                      </Box>
                   </Box>

                 {/* Humedad, Presión y radiación  */}                 

                  <Box display="flex" flexDirection="row" alignItems="center" gap={(4)}>

                      {/* Humedad  */}

                      <Box 
                        display="flex" 
                        flexDirection="column" 
                        alignItems="center"
                        sx={{ gridArea: '2I', order: 4 }}
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
                        sx={{ gridArea: '2C', order: 5 }}
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
                        sx={{ gridArea: '2D', order: 6 }}
                      >
                        <Typography style={styles.subseccion}>
                            Radiación
                        </Typography>              

                        <Typography style={styles.datosRadiacion}>
                          {weatherData.solar_radiation} W/m²
                        </Typography>
                      </Box>
                  </Box>
  
                  <Box sx={{ width: '100%', marginTop: '30px', borderTop:'1px solid darkgrey'}} >
                    <Typography style={{...styles.seccion, marginTop: '20px'}}>
                      Histórico de temperaturas (2025)
                    </Typography>
                    <Box width="100%">
                      <TemperatureHistoryChart />
                    </Box>
                  </Box>

                  <Box sx={{ width: '100%', marginTop: '30px', borderTop:'1px solid darkgrey'}} >

                    <Typography style={{...styles.seccion, marginTop: '20px'}}>
                      Predicción
                    </Typography>

                    <Box 
                      width="100%" 
                      display="flex"
                      justifyContent="center" 
                      alignItems="center" 
                      marginTop="30px"
                    >
                      <iframe 
                        width="500" 
                        height="187" 
                        src="https://embed.windy.com/embed.html?type=forecast&location=coordinates&detail=true&detailLat=41.3950387&detailLon=2.1225328&metricTemp=°C&metricRain=mm&metricWind=km/h" 
                        frameborder="0"
                        title="Predicción Barcelona"
                      /> 
                    </Box>    
                  </Box>            
                </Box>

                {/* Gráficas */}

                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center"
                  justifyContent="flex-start"
                  sx={{ 
                    gridArea: '1D',
                    order: isMobile ? 3 : 1,
                    height: '100%',
                    border: "1px solid darkgrey"
                  }}>
                  <Typography style={styles.seccion} >
                    Gráficas (Sarrià)
                  </Typography>
                  <Box display="flex" justifyContent="flex-start" gap={6} mt={4} p={1} sx={{ border: "1px solid darkgrey"}}>
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
                  </Box>
                  <Typography style={styles.subseccion}>
                    Temperatura exterior
                  </Typography>
                  <TemperatureChart timeRange={timeRange} />

                  <Typography style={styles.subseccion}>
                    Humedad
                  </Typography>
                  <HumChart timeRange={timeRange} />

                  <Typography style={styles.subseccion}>
                    Presión
                  </Typography>
                  <PressChart timeRange={timeRange} /> 
 
                  <Typography style={styles.subseccion}>
                    Radiación
                  </Typography>
                  <RadChart timeRange={timeRange} /> 
  
                </Box>
                
                {/* Humidity Section */}
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center"
                  sx={{ gridArea: '2I', order: 4 }}
                >
                </Box>

                {/* Pressure Section */}
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center"
                  sx={{ gridArea: '2C', order: 5 }}
                >
                </Box>

                {/* Radiation Section */}
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center"
                  sx={{ gridArea: '2D', order: 6 }}
                >
                </Box>

                {/* Maps Section */}
                <Box sx={{ gridArea: '3I', order: 7 }}>

                </Box>

                {/* Datos de Burgos */}
                <Box sx={{ gridArea: '3C', order: 8 }}>


                </Box>

                {/* Webcam Section */}
                <Box sx={{ gridArea: '3D', order: 9  }}>

 
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