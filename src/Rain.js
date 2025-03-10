import React from 'react';
import { Box } from '@mui/material';
import { RAIN_2025_CANBRUIXA } from './constants';

const Rain = ({ totalRain }) => {
  const totalAnnualRain = totalRain + RAIN_2025_CANBRUIXA;
  
  return (
    <Box display="flex" flexDirection="column" alignItems="center" width="100%">
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-end space-x-4">
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-48 border border-white">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-300"
                style={{ height: `${(totalAnnualRain / 1000) * 100}%` }}
              />
            </div>
            <div className="text-sm mt-2 text-white">
              <p>Total año</p>
              {totalAnnualRain.toFixed(1)} mm
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Rain;