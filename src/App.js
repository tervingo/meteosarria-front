import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
//import GetTempColour from './GetTempColour';
import { Typography, Card, CardMedia } from '@mui/material';
//import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TemperatureBackground from './TemperatureBackground';
import GetWindDir from './GetWindDir';
import WindDirectionIndicator from './WindDirectionIndicator';
import TemperatureChart from './TemperatureChart';
import PressChart from './PressChart';
import HumChart from './HumChart';
import ShowTempDiffs from './ShowTempDiffs';

const theme = createTheme();

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
//        const response = await axios.get('http://localhost:5000/api/live');
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

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        {weatherData && <TemperatureBackground temperature={weatherData.external_temperature} />}

        <div className="App-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',width: '100%'}}>
            <Typography variant="h1" style={{ fontSize: '6rem', marginRight: '50px' }}>
              #meteosarria
            </Typography>
            <Card>
                <CardMedia
                  component="img"
                  width="100"
                  height="100"
                  image="/images/nubes.jpg"
                  alt="Sample image"
                  sx={{ objectFit: 'cover', }}
                />
              </Card>
          </div>
          <Typography variant="h6" style={{ fontSize: '3rem' }}>
            {formatDate(currentTime)}
          </Typography>
        </div>
        <br/>

        <div className="App">
          {loading && <p>Loading weather data...</p>}
          {error && <p className="error">{error}</p>}

          {weatherData && (
            <div className="weather-container">
              <div className="weather-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',width: '100%'}}>
                <ShowTempDiffs />
                <Typography variant="h1" style={{ fontSize: '7rem', background: 'none' }}>
                  {weatherData.external_temperature}°
                </Typography>
                <TemperatureChart />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',width: '100%'}}>
                <Typography variant="h6" style={{ fontSize: '5rem', background: 'none' }}>
                  {weatherData.humidity}%
                </Typography>
                <HumChart />
              </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',width: '100%'}}>
                  <Typography variant="h6" style={{ fontSize: '5rem', background: 'none' }}>
                    {weatherData.pressure} hPa
                  </Typography>
                  <PressChart />
                </div>
                <Typography variant="h6" style={{ fontSize: '4rem', background: 'none' }}>
                  {weatherData.wind_speed} km/h - {GetWindDir(weatherData.wind_direction)}
                </Typography>
                <br/>
                <WindDirectionIndicator direction={weatherData.wind_direction} />
{/*         
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {Array.from({ length: 12 }).map((_, index) => (
                          <TableCell key={index}>Header {index + 1}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.from({ length: 2 }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {Array.from({ length: 12 }).map((_, colIndex) => (
                            <TableCell sx={{ backgroundColor: GetTempColour(-12 + colIndex*5) }}> {-12 + colIndex*5 } </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
             
 */}              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;