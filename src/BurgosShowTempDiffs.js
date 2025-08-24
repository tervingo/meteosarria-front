import React, { useState, useEffect } from 'react';
import axios from 'axios';

import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { BACKEND_URI } from './constants';

const BurgosShowTempDiffs = () => {
  const [hourlyDifference, setHourlyDifference] = useState(null);
  const [dailyDifference, setDailyDifference] = useState(null);
  const [temperatureTrend, setTemperatureTrend] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URI}/api/weather/history`);
        const fetchedData = response.data.data;

        if (!fetchedData || fetchedData.length === 0) {
          console.log("No Burgos weather data available");
          return;
        }

        // Process data to find the most recent, 15 minutes ago, 1 hour ago, and 24 hours ago timestamps
        const now = new Date();
        const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
        const oneHourAgo = new Date(now.getTime() - 3600 * 1000);
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 3600 * 1000);

        // Find the closest data points to these timestamps
        const currentData = findDataClosestToTime(fetchedData, now);
        const fifteenMinutesAgoData = findDataClosestToTime(fetchedData, fifteenMinutesAgo);
        const oneHourAgoData = findDataClosestToTime(fetchedData, oneHourAgo);
        const twentyFourHoursAgoData = findDataClosestToTime(fetchedData, twentyFourHoursAgo);

        console.log('Burgos Current data:', currentData);
        console.log('Burgos 15 minutes ago data:', fifteenMinutesAgoData);
        console.log('Burgos 1 hour ago data:', oneHourAgoData);
        console.log('Burgos 24 hours ago data:', twentyFourHoursAgoData);

        // Calculate temperature differences and trend
        if (currentData && fifteenMinutesAgoData) {
          const currentTemp = getCurrentTemperature(currentData);
          const fifteenMinAgoTemp = getCurrentTemperature(fifteenMinutesAgoData);
          
          if (currentTemp !== null && fifteenMinAgoTemp !== null) {
            const fifteenMinuteDiff = currentTemp - fifteenMinAgoTemp;
            if (Math.abs(fifteenMinuteDiff) < 0.2) {
              setTemperatureTrend('right');
            } else if (fifteenMinuteDiff > 0.5) {
              setTemperatureTrend('up-90');
            } else if (fifteenMinuteDiff > 0.2) {
              setTemperatureTrend('up-45');
            } else if (fifteenMinuteDiff < -0.5) {
              setTemperatureTrend('down-90');
            } else {
              setTemperatureTrend('down-45');
            }
          }
        } else {
          console.log("Could not find Burgos temperature data from 15 minutes ago.");
        }

        if (currentData && oneHourAgoData) {
          const currentTemp = getCurrentTemperature(currentData);
          const oneHourAgoTemp = getCurrentTemperature(oneHourAgoData);
          
          if (currentTemp !== null && oneHourAgoTemp !== null) {
            setHourlyDifference((currentTemp - oneHourAgoTemp).toFixed(1));
          }
        } else {
          console.log("Could not find Burgos temperature data from 1 hour ago.");
        }

        if (currentData && twentyFourHoursAgoData) {
          const currentTemp = getCurrentTemperature(currentData);
          const twentyFourHoursAgoTemp = getCurrentTemperature(twentyFourHoursAgoData);
          
          if (currentTemp !== null && twentyFourHoursAgoTemp !== null) {
            setDailyDifference((currentTemp - twentyFourHoursAgoTemp).toFixed(1));
          }
        } else {
          console.log("Could not find Burgos temperature data from 24 hours ago.");
        }
      } catch (error) {
        console.error('Error fetching Burgos temperature data:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 60000); // Update every 1 minute
    return () => clearInterval(intervalId);
  }, []);

  // Helper function to extract temperature from Burgos data structure
  const getCurrentTemperature = (data) => {
    if (!data) return null;
    
    // Try to get temperature from google_weather_burgos_center
    if (data.google_weather_burgos_center && data.google_weather_burgos_center.temperature !== undefined) {
      return data.google_weather_burgos_center.temperature;
    }
    
    // Try to get from raw_data structure
    if (data.raw_data && data.raw_data.temperature && data.raw_data.temperature.degrees !== undefined) {
      return data.raw_data.temperature.degrees;
    }
    
    return null;
  };

  // Helper function to find data closest to a given time
  const findDataClosestToTime = (data, targetTime) => {
    let closestData = null;
    let minTimeDiff = Infinity;

    data.forEach(entry => {
      let dateObj;
      
      if (entry.timestamp) {
        // Handle ISO format timestamp
        dateObj = new Date(entry.timestamp);
      } else {
        console.warn("Entry without timestamp:", entry);
        return;
      }

      const timeDiff = Math.abs(dateObj.getTime() - targetTime.getTime());
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestData = entry;
      }
    });

    return closestData;
  };

  return (
    <div className="differences">
      <div className="diff-container">
        <div className="temp-diffs">
          {hourlyDifference !== null && (
            <p>{hourlyDifference}°C (1h)</p>
          )}
          {dailyDifference !== null && (
            <p>{dailyDifference}°C (24h)</p>
          )}
        </div>
        <div className="arrow-container">
          {temperatureTrend === 'up-90' && <TrendingUpIcon style={{ color: 'red' }} />}
          {temperatureTrend === 'up-45' && <NorthEastIcon style={{ color: 'orangeRed' }} />}
          {temperatureTrend === 'down-90' && <TrendingDownIcon style={{ color: 'blue' }} />}
          {temperatureTrend === 'down-45' && <SouthEastIcon style={{ color: 'royalBlue' }} />}
          {temperatureTrend === 'right' && <HorizontalRuleIcon style={{ color: 'azure' }} />}
        </div>
      </div>
    </div>
  );
};

export default BurgosShowTempDiffs;