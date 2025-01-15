import React, { useState, useEffect } from 'react';
import axios from 'axios'; // If you installed axios
import './App.css'; // Import your CSS file for styling

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/live'); // Using axios
        // const response = await fetch('/api/live'); // Using built-in fetch

        setWeatherData(response.data);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setError("Failed to fetch weather data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Fetch data immediately on component mount

    const intervalId = setInterval(fetchData, 10000); // Fetch data every 60 seconds (adjust as needed)

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, []);

  return (
    <div className="App">
      <h1>Meteo Sarria</h1>

      {loading && <p>Loading weather data...</p>}

      {error && <p className="error">{error}</p>}

      {weatherData && (
        <div className="weather-container">
          <div className="weather-item">
            <h2>External Temperature</h2>
            <p>{weatherData.external_temperature}°C</p>
          </div>
          <div className="weather-item">
            <h2>Internal Temperature</h2>
            <p>{weatherData.internal_temperature}°C</p>
          </div>
          <div className="weather-item">
            <h2>Humidity</h2>
            <p>{weatherData.humidity}%</p>
          </div>
          <div className="weather-item">
            <h2>Wind Speed</h2>
            <p>{weatherData.wind_speed} km/h</p>
          </div>
          <div className="weather-item">
            <h2>Wind Direction</h2>
            <p>{weatherData.wind_direction}°</p>
          </div>
          
          {/* ... other weather parameters (wind, pressure, rain, etc.) ... */}
        </div>
      )}
    </div>
  );
}

export default App;