import React from 'react';

const Rain = ({ rainRate, totalRain }) => {

/* pongo el valor de totalRain a 60 (17 feb 25) hasta que el pluviómetro esté arreglado */

    totalRain = totalRain + 60;

  const rateHeight = Math.min((rainRate / 50) * 100, 100);
  const totalHeight = Math.min((totalRain / 700) * 100, 100);  // cambiar 10 por 1000 

  return (

    <div className="flex flex-col items-center>">
        <div className="text-2xl mb-5 text-gray-300">
            Precipitación
        </div>
        <div className="flex flex-row items-end space-x-4">
        {/* Barra de Rain Rate */}
        <div className="flex flex-col items-center">
            <div className="relative w-12 h-48 border border-white">
            <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-300"
                style={{ height: `${rateHeight}%` }}
            />
            </div>
            <div className="text-sm mt-2 text-white">
                <p>litros/hora</p>
            {rainRate.toFixed(1)} mm/h
            </div>
        </div>

        {/* Barra de Total Rain */}
        <div className="flex flex-col items-center">
            <div className="relative w-12 h-48 border border-white">
            <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-300"
                style={{ height: `${totalHeight}%` }}
            />
            </div>
            <div className="text-sm mt-2 text-white">
            <p>Total 2025</p>
            {totalRain.toFixed(1)} mm
            </div>
        </div>
        </div>
    </div>
  );
};

export default Rain;