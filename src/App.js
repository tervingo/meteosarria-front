import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import TemperatureBackground from './TemperatureBackground';
import Typography from '@mui/material/Typography';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/live');
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
    const intervalId = setInterval(fetchData, 10000);

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
          <Typography variant="h1" style={{ fontSize: '6rem' }}>
            #meteosarria
          </Typography>
          <Typography variant="h6" style={{ fontSize: '3rem' }}>
            {formatDate(currentTime)}
          </Typography>
        </div>

        <div className="App">
          {loading && <p>Loading weather data...</p>}
          {error && <p className="error">{error}</p>}

          {weatherData && (
            <div className="weather-container">
              <div className="weather-item">
                <Typography variant="h1" style={{ fontSize: '8rem', background: 'none' }}>
                  {weatherData.external_temperature}°
                </Typography>
                <Typography variant="h6" style={{ fontSize: '6rem', background: 'none' }}>
                  {weatherData.humidity}%
                </Typography>
              </div>
              {/* Uncomment and add other weather parameters as needed */}
              {/* <div className="weather-item">
                <h2>Internal Temperature</h2>
                <h3>{weatherData.internal_temperature}°C</h3>
              </div>
              <div className="weather-item">
                <h2>Humidity</h2>
                <h3>{weatherData.humidity}%</h3>
              </div>
              <div className="weather-item">
                <h2>Wind Speed</h2>
                <h3>{weatherData.wind_speed} km/h</h3>
              </div>
              <div className="weather-item">
                <h2>Wind Direction</h2>
                <h3>{weatherData.wind_direction}°</h3>
              </div> */}
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;