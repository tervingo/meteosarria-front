import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import axios from 'axios';
import { BACKEND_URI } from './constants';

const Rain = () => {
  const [fabraData, setFabraData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFabraData = async () => {
      try {
        setLoading(true);
        loading && console.log('Fetching Fabra data...');
        const response = await axios.get(BACKEND_URI + '/api/barcelona-rain');
        console.log('Received Fabra data:', response.data);
        setFabraData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching Fabra data:', err);
        setError('Error al obtener datos del Observatorio Fabra');
        error && console.log('Error fetching Fabra data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFabraData();
    // Actualizar cada 30 minutos
    const intervalId = setInterval(fetchFabraData, 30 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [loading, error]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" width="100%">
      {fabraData && (
        <div className="flex flex-col items-center">
        {/* Removemos el mb-5 del título y usamos un margen más pequeño */}
        <div className="flex flex-row items-end space-x-4">
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-48 border border-white">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-300"
                style={{ height: `${(fabraData.yearly_rain / 1000) * 100}%` }}
              />
            </div>
            <div className="text-sm mt-2 text-white">
              <p>Total año</p>
              {fabraData.yearly_rain.toFixed(1)} mm
            </div>
          </div>
        </div>
      </div>
   )};
  </Box>

  );
};


export default Rain;