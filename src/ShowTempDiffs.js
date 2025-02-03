import React, { useState, useEffect } from 'react';
import axios from 'axios';

import NorthIcon from '@mui/icons-material/North';
import SouthIcon from '@mui/icons-material/South';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { BACKEND_URI  }  from './constants';

const ShowTempDiffs = () => {
  const [hourlyDifference, setHourlyDifference] = useState(null);
  const [dailyDifference, setDailyDifference] = useState(null);
  const [temperatureTrend, setTemperatureTrend] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(BACKEND_URI+'/api/meteo-data');
        const fetchedData = response.data;

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

        console.log('Current data:', currentData);
        console.log('15 minutes ago data:', fifteenMinutesAgoData);
        console.log('1 hour ago data:', oneHourAgoData);
        console.log('24 hours ago data:', twentyFourHoursAgoData);

        // Calculate temperature differences and trend
        if (currentData && fifteenMinutesAgoData) {
          const fifteenMinuteDiff = currentData.external_temperature - fifteenMinutesAgoData.external_temperature;
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
        } else {
          console.log("Could not find temperature data from 15 minutes ago.");
        }

        if (currentData && oneHourAgoData) {
          setHourlyDifference((currentData.external_temperature - oneHourAgoData.external_temperature).toFixed(1));
        } else {
          console.log("Could not find temperature data from 1 hour ago.");
        }

        if (currentData && twentyFourHoursAgoData) {
          setDailyDifference((currentData.external_temperature - twentyFourHoursAgoData.external_temperature).toFixed(1));
        } else {
          console.log("Could not find temperature data from 24 hours ago.");
        }
      } catch (error) {
        console.error('Error fetching temperature data:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 60000); // Update every 1 minute (adjust as needed)
    return () => clearInterval(intervalId);
  }, []);

  // Helper function to find data closest to a given time
  const findDataClosestToTime = (data, targetTime) => {
    let closestData = null;
    let minTimeDiff = Infinity;

    data.forEach(entry => {
      const [datePart, timePart] = entry.timestamp.split(' ');
      const [day, month, year] = datePart.split('-');
      const formattedDate = `${year}-${month}-${day}T${timePart}`;
      const dateObj = new Date(formattedDate);

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
      <div className="diff-container"> {/* Added container for diffs and arrow */}
        <div className="temp-diffs">
          {hourlyDifference !== null && (
            <p>{hourlyDifference}°C (1h)</p>
          )}
          {dailyDifference !== null && (
            <p>{dailyDifference}°C (24h)</p>
          )}
        </div>
        <div className="arrow-container"> {/* Container for the arrow */}
          {temperatureTrend === 'up-90' && <NorthIcon style={{ color: 'red'  }} />}
          {temperatureTrend === 'up-45' && <NorthEastIcon style={{ color: 'orangeRed'  }} />}
          {temperatureTrend === 'down-90' && <SouthIcon style={{ color: 'slateBlue' }} />}
          {temperatureTrend === 'down-45' && <SouthEastIcon style={{  color: 'royalBlue'  }} />}
          {temperatureTrend === 'right' && <DragHandleIcon style={{ color: 'azure' }}/>}
        </div>
      </div>
    </div>
  );
};

export default ShowTempDiffs;