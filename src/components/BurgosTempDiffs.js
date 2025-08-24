import React, { useState, useEffect } from 'react';
import axios from 'axios';

import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { BACKEND_URI } from '../constants';

const BurgosTempDiffs = () => {
  const [hourlyDifference, setHourlyDifference] = useState(null);
  const [dailyDifference, setDailyDifference] = useState(null);
  const [temperatureTrend, setTemperatureTrend] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Request enough data for 24h analysis (150 records for every 10 minutes)
        const response = await axios.get(`${BACKEND_URI}/api/weather/history`, {
          params: { limit: 150 }
        });
        const fetchedData = response.data.data;

        if (!fetchedData || fetchedData.length === 0) {
          console.log("No Burgos weather data available");
          return;
        }

        // Use the most recent available data as "current" instead of searching for "now"
        // This avoids finding the same record for current and past times
        const currentData = fetchedData[0]; // Most recent record (already sorted by timestamp DESC)
        
        // Get the timestamp of the most recent data and calculate relative times from it
        let currentUTC;
        if (typeof currentData.timestamp === 'string') {
          if (!currentData.timestamp.endsWith('Z') && !currentData.timestamp.includes('+')) {
            currentUTC = new Date(currentData.timestamp + 'Z');
          } else {
            currentUTC = new Date(currentData.timestamp);
          }
        } else {
          currentUTC = new Date(currentData.timestamp);
        }
        
        const fifteenMinutesAgoUTC = new Date(currentUTC.getTime() - 15 * 60 * 1000);
        const oneHourAgoUTC = new Date(currentUTC.getTime() - 3600 * 1000);
        const twentyFourHoursAgoUTC = new Date(currentUTC.getTime() - 24 * 3600 * 1000);

        // Find the closest data points to these relative UTC timestamps
        const fifteenMinutesAgoData = findDataClosestToTime(fetchedData, fifteenMinutesAgoUTC);
        const oneHourAgoData = findDataClosestToTime(fetchedData, oneHourAgoUTC);
        const twentyFourHoursAgoData = findDataClosestToTime(fetchedData, twentyFourHoursAgoUTC);

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
        }

        if (currentData && oneHourAgoData) {
          const currentTemp = getCurrentTemperature(currentData);
          const oneHourAgoTemp = getCurrentTemperature(oneHourAgoData);
          
          if (currentTemp !== null && oneHourAgoTemp !== null) {
            setHourlyDifference((currentTemp - oneHourAgoTemp).toFixed(1));
          }
        }

        if (currentData && twentyFourHoursAgoData) {
          const currentTemp = getCurrentTemperature(currentData);
          const twentyFourHoursAgoTemp = getCurrentTemperature(twentyFourHoursAgoData);
          
          if (currentTemp !== null && twentyFourHoursAgoTemp !== null) {
            setDailyDifference((currentTemp - twentyFourHoursAgoTemp).toFixed(1));
          }
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
      let utcDate;
      
      if (entry.timestamp) {
        // Parse UTC timestamp from database
        if (typeof entry.timestamp === 'string') {
          // Add Z if missing to ensure it's interpreted as UTC
          if (!entry.timestamp.endsWith('Z') && !entry.timestamp.includes('+')) {
            utcDate = new Date(entry.timestamp + 'Z');
          } else {
            utcDate = new Date(entry.timestamp);
          }
        } else {
          utcDate = new Date(entry.timestamp);
        }
      } else {
        console.warn("Entry without timestamp:", entry);
        return;
      }

      const timeDiff = Math.abs(utcDate.getTime() - targetTime.getTime());
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

export default BurgosTempDiffs;