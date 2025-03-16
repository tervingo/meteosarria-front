import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import axios from 'axios';
import { BACKEND_URI } from './constants';

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
  
  // Calculate max value for today's rain (10 times current rain)
  const maxTodayRain = fabraData?.today_rain ? Math.ceil(fabraData.today_rain * 10) : 10;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" width="100%">
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-end space-x-12">
 
          {/* Columna de lluvia hoy */}
          <div className="flex flex-col items-center">
            <p className="text-sm mb-2 text-white">Hoy</p>
            <div className="relative w-12 h-48 border border-white">
              {/* Max value label */}
              <div className="absolute -right-10 top-0 text-xs text-gray-400">
                {maxTodayRain} mm
              </div>
              <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-300"
                style={{ height: `${fabraData?.today_rain ? (fabraData.today_rain / maxTodayRain) * 100 : 0}%` }}
              />
            </div>
            <div className="text-sm mt-2 text-white">
              {fabraData?.today_rain !== undefined ? `${fabraData.today_rain.toFixed(1)} mm` : 'Cargando...'}
            </div>
          </div>

          {/* Columna de lluvia Fabra */}
          <div className="flex flex-col items-center">
            <p className="text-sm mb-2 text-white">Total año</p>
            <div className="relative w-16 h-48 border border-white">
              {/* Max value label */}
              <div className="absolute -right-14 top-0 text-xs text-gray-400">
                1.000 mm
              </div>
              <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-300"
                style={{ height: `${fabraData?.yearly_rain ? (fabraData.yearly_rain / 1000) * 100 : 0}%` }}
              />
            </div>
            <div className="text-sm mt-2 text-white">
              {fabraData?.yearly_rain !== undefined ? `${fabraData.yearly_rain.toFixed(1)} mm` : 'Cargando...'}
              {error && <p className="text-red-500 text-xs">Error: {error}</p>}
            </div>
          </div>

        </div>
      </div>
    </Box>
  );
};

export default Rain;