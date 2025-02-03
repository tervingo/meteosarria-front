import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Typography } from '@mui/material';
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
import RadChart from './RadChart';
import { BACKEND_URI } from './constants';

const theme = createTheme();

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
//  const [renuncioData, setRenuncioData] = useState(null);

  const [timeRange, setTimeRange] = useState('24h'); // Default to 24 hours

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(BACKEND_URI+'/api/live');
        setWeatherData(response.data);
        console.log('Weather data:', response.data);
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

/*   
   useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(BACKEND_URI+'/api/renuncio');
        setRenuncioData(response.data);
        console.log('Renuncio data:', response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching Renuncio data:", error);
        setError("Failed to fetch Renuncio data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 300000);

    return () => clearInterval(intervalId);
  }, []);
  */

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

  // Menu bar
  function Menu({ items }) {
    return (
      <nav>
        {items.map(item => (
          <a key={item.label} href={item.url} target="_blank" rel="noreferrer">
            {item.label}
          </a>
        ))}
      </nav>
    );
  }

  const menuItems = [
    { label: 'AEMET', url: 'https://www.aemet.es/es/portada' },
    { label: 'Meteocat', url: 'https://www.meteo.cat/' },
    { label: 'Renuncio Meteo', url: 'https://renuncio.com/meteorologia/actual' },
    { label: 'Burgos Webcam', url: 'https://ibericam.com/espana/burgos/webcam-burgos-catedral-de-burgos/' },
    { label: 'Meteociel', url: 'https://meteociel.fr' },
    { label: 'Windy', url: 'https://www.windy.com' },
    { label: 'Modelos', url: 'https://meteologix.com/es/model-charts/standard/europe/temperature-850hpa.html' }
  ];

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        {weatherData && <TemperatureBackground temperature={weatherData.external_temperature} />}

        <div className="App-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div>
              <Typography variant="h1" style={{ fontSize: '6rem', marginRight: '50px', color: 'Gray' }}>
                #meteosarria
              </Typography>
              <Typography variant="h6" style={{ fontSize: '3rem', color: 'DarkGray'  }}>
                {formatDate(currentTime)}
              </Typography>
              <Typography variant="h6" style={{ fontSize: '1rem', color: 'DarkGray' }}>
              Sarrià - Barcelona (41º 23' 42" N, 2º 7' 21" E - 110m) 
            </Typography>          
            </div>
            <Card>
                <CardMedia
                  component="img"
                  width="180"
                  height="180"
                  image="/images/nubes.jpg"
                  alt="Sample image"
                  sx={{ objectFit: 'cover'}}
                />
              </Card>
          </div>
        </div>
        <br />

        <Menu items={menuItems} />

       {/* radio buttons to select chart scope (24h, 48h, 7d) */}


        <div className="App">
          {loading && <p>Loading weather data...</p>}
          {error && <p className="error">{error}</p>}

          {weatherData && (
            <div className="weather-container">

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: 'middle', padding: '10px', width: '20%', textAlign: 'center'}}>
                       <WindDirectionIndicator direction={weatherData.wind_direction} speed={weatherData.wind_speed} rose={GetWindDir(weatherData.wind_direction)} />
                     </td>
                    <td style={{ verticalAlign: 'middle', padding: '10px', width: '40%', textAlign: 'center'}}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h1" style={{ fontSize: '11rem', color: GetTempColour(weatherData.external_temperature), background: 'none', marginLeft: '1px'}}>
                          {weatherData.external_temperature.toFixed(1)}°
                        </Typography>
                        <ShowTempDiffs />
                      </div>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '10px', width: '20%', color: 'darkgray', textAlign: 'center'}}>
                      <div>
                        <label>
                          <input type="radio" value="24h" checked={timeRange === '24h'} onChange={handleTimeRangeChange} />
                          24 Horas
                        </label>
                        <label>
                          <input type="radio" value="48h" checked={timeRange === '48h'} onChange={handleTimeRangeChange} />
                          48 Horas
                        </label>
                        <label>
                          <input type="radio" value="7d" checked={timeRange === '7d'} onChange={handleTimeRangeChange} />
                          7 Días
                        </label>
                      </div>
                      <TemperatureChart timeRange={timeRange} />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: 'middle', padding: '10px', textAlign: 'center'}}> 
                      <Typography variant="h6" style={{ fontSize: '4rem', color: 'DarkGray', background: 'none' }}>
                        {weatherData.humidity}%
                      </Typography>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '10px', textAlign: 'center'}}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'  }}>
                        <Typography variant="h6" style={{ fontSize: '4rem', color: 'DarkGray', background: 'none', marginRight: '10px' }}>
                          {weatherData.pressure} hPa
                        </Typography>
                        <ShowPressTrend />
                      </div>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '10px', textAlign: 'center'}}>
                      <Typography variant="h6" style={{ fontSize: '4rem', color: 'DarkGray', background: 'none' }}>
                        {weatherData.solar_radiation} W/m2
                      </Typography>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: 'middle', padding: '10px', textAlign: 'center'}}> 
                      <HumChart timeRange={timeRange} />
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '10px', textAlign: 'center'}}>
                      <PressChart timeRange={timeRange} />  
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '10px', textAlign: 'center'}}> 
                      <RadChart timeRange={timeRange}  />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <iframe 
                        width="450" 
                        height="300" 
                        src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=4&overlay=temp&product=ecmwf&level=surface&lat=44.778&lon=7.646&pressure=true&message=true" 
                        frameborder="0"
                        title='mapa'
                        >
                      </iframe>          
                    </td>
                    <td>
                        <a name="windy-webcam-timelapse-player"  data-id="1735243432" data-play="day" data-loop="0" data-auto-play="0" data-force-full-screen-on-overlay-play="0" data-interactive="1" href="https://windy.com/webcams/1735243432" target="_blank" rel="noreferrer">Burgos: Burgos Cathedral</a>
                        <script async type="text/javascript" src="https://webcams.windy.com/webcams/public/embed/v2/script/player.js"></script>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;