import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import axios from 'axios';
import { BACKEND_URI } from './constants';
import RainBar from './components/Rainbar';

const Rain = () => {
  const [fabraData, setFabraData] = useState(null);
  const [error, setError] = useState(null);
//  const totalAnnualRain = totalRain + RAIN_2025_CANBRUIXA;

  useEffect(() => {
    const fetchFabraData = async () => {
      try {
        console.log('Fetching Fabra data from:', BACKEND_URI + '/api/barcelona-rain');
        const response = await axios.get(BACKEND_URI + '/api/barcelona-rain');
        console.log('Received Fabra data:', response.data);
        
        // Asegurarnos de que los datos son números
        const processedData = {
          ...response.data,
          today_rain: parseFloat(response.data.today_rain) || 0,
          yearly_rain: parseFloat(response.data.yearly_rain) || 0
        };
        
        setFabraData(processedData);
        return processedData.today_rain > 0;
      } catch (err) {
        setError(err.message);
        console.error('Error fetching Fabra data:', err);
        return false;
      }
    };

    // Fetch initial data and set up first interval
    const setupInterval = async () => {
      const hasRain = await fetchFabraData();
      // If there's rain, update every 20 minutes (1200000 ms), otherwise every hour (3600000 ms)
      const intervalTime = hasRain ? 1200000 : 3600000;
      console.log(`Setting update interval to ${hasRain ? '20 minutes' : '1 hour'}`);
      return setInterval(async () => {
        const newHasRain = await fetchFabraData();
        if (hasRain !== newHasRain) {
          // If rain status changed, clear current interval and set up new one
          clearInterval(intervalId);
          setupInterval();
        }
      }, intervalTime);
    };

    let intervalId = setupInterval();

    // Cleanup interval on component unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // Log cuando los datos cambian
  useEffect(() => {
    if (fabraData) {
      console.log('Current Fabra data state:', fabraData);
      console.log('Yearly rain value:', fabraData.yearly_rain);
    }
  }, [fabraData]);
  
  // Calculate max value for today's rain (round up to next nice number)
  const maxTodayRain = fabraData?.today_rain ? Math.ceil(Math.ceil(fabraData.today_rain) * 10) : 10;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" width="100%" marginRight={8}>
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-end space-x-12">
          {/* Barra de lluvia hoy */}
          <RainBar
            label="Hoy"
            value={fabraData?.today_rain}
            maxValue={maxTodayRain}
            barWidth={12}
            isLoading={!fabraData}
          />

          {/* Barra de lluvia anual */}
          <RainBar
            label="Total año"
            value={fabraData?.yearly_rain}
            maxValue={1000}
            barWidth={12}
            isLoading={!fabraData}
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-2">Error: {error}</p>}
      </div>
    </Box>
  );
};

export default Rain;