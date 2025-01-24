import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Typography } from '@mui/material';
import { Card, CardMedia } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TemperatureBackground from './TemperatureBackground';
import GetWindDir from './GetWindDir';
import WindDirectionIndicator from './WindDirectionIndicator';
import TemperatureChart from './TemperatureChart';
import PressChart from './PressChart';
import HumChart from './HumChart';
import ShowTempDiffs from './ShowTempDiffs';
import ShowPressTrend from './ShowPressTrend';
import RadChart from './RadChart';

const theme = createTheme();

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await axios.get('http://localhost:5000/api/live');
        const response = await axios.get('https://meteosarria-back.onrender.com/api/live');
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
    { label: 'Burgos Meteo', url: 'https://renuncio.com/meteorologia/actual' },
    { label: 'Burgos Webcam', url: 'https://ibericam.com/espana/burgos/webcam-burgos-catedral-de-burgos/' },
    { label: 'Meteociel', url: 'https://meteociel.fr' },
    { label: 'Modelos', url: 'https://meteologix.com/es/model-charts/standard/europe/temperature-850hpa.html' }
  ];

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        {weatherData && <TemperatureBackground temperature={weatherData.external_temperature} />}

        <div className="App-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div>
              <Typography variant="h1" style={{ fontSize: '6rem', marginRight: '50px' }}>
                #meteosarria
              </Typography>
              <Typography variant="h6" style={{ fontSize: '3rem' }}>
                {formatDate(currentTime)}
              </Typography>
              <Typography variant="h6" style={{ fontSize: '1rem', color: 'dimGray' }}>
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
                        <Typography variant="h1" style={{ fontSize: '10rem', color: 'dimGray', background: 'none', marginLeft: '1px'}}>
                          {weatherData.external_temperature.toFixed(1)}°
                        </Typography>
                        <ShowTempDiffs />
                      </div>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '10px', width: '20%', textAlign: 'center'}}>
                      <TemperatureChart />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: 'middle', padding: '10px', textAlign: 'center'}}> 
                      <Typography variant="h6" style={{ fontSize: '3rem', background: 'none' }}>
                        {weatherData.humidity}%
                      </Typography>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '10px', textAlign: 'center'}}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'  }}>
                        <Typography variant="h6" style={{ fontSize: '3rem', background: 'none', marginRight: '10px' }}>
                          {weatherData.pressure} hPa
                        </Typography>
                        <ShowPressTrend />
                      </div>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '10px', textAlign: 'center'}}>
                      <Typography variant="h6" style={{ fontSize: '3rem', background: 'none' }}>
                        {weatherData.solar_radiation} W/m2
                      </Typography>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: 'middle', padding: '10px', textAlign: 'center'}}> 
                      <HumChart />
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '10px', textAlign: 'center'}}>
                      <PressChart />  
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '10px', textAlign: 'center'}}> 
                      <RadChart />
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