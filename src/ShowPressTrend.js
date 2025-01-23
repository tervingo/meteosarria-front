import React, { useState, useEffect } from 'react';
import axios from 'axios';

import NorthIcon from '@mui/icons-material/North';
import SouthIcon from '@mui/icons-material/South';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import DragHandleIcon from '@mui/icons-material/DragHandle';


const ShowPressTrend = () => {
  const [pressureTrend, setPressureTrend] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://meteosarria-back.onrender.com/api/meteo-data');
        const fetchedData = response.data;

        // Process data to find the most recent, 15 minutes ago, 1 hour ago, and 24 hours ago timestamps
        const now = new Date();
        const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
 
        // Find the closest data points to these timestamps
        const currentData = findDataClosestToTime(fetchedData, now);
        const fifteenMinutesAgoData = findDataClosestToTime(fetchedData, fifteenMinutesAgo);

        // Calculate pressure differences and trend
        if (currentData && fifteenMinutesAgoData) {
          const fifteenMinuteDiff = currentData.pressure - fifteenMinutesAgoData.pressure;
          if (Math.abs(fifteenMinuteDiff) === 0) {
            setPressureTrend('right');
          } else if (fifteenMinuteDiff > 0.2) {
            setPressureTrend('up-90');
          } else if (fifteenMinuteDiff > 0) {
            setPressureTrend('up-45');
          } else if (fifteenMinuteDiff < -0.2) {
            setPressureTrend('down-90');
          } else {
            setPressureTrend('down-45');
          }
        } else {
          console.log("Could not find pressure data from 15 minutes ago.");
        }
      } catch (error) {
        console.error('Error fetching pressure data:', error);
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
        <div className="arrow-container"> {/* Container for the arrow */}
          {pressureTrend === 'up-90' && <NorthIcon style={{ color: 'red'  }} />}
          {pressureTrend === 'up-45' && <NorthEastIcon style={{ color: 'orangeRed'  }} />}
          {pressureTrend === 'down-90' && <SouthIcon style={{ color: 'slateBlue' }} />}
          {pressureTrend === 'down-45' && <SouthEastIcon style={{  color: 'royalBlue'  }} />}
          {pressureTrend === 'right' && <DragHandleIcon style={{ color: 'darkslategray' }}/>}
        </div>
      </div>
    </div>
  );
};

export default ShowPressTrend;