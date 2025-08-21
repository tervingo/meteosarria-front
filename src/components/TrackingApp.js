import React from 'react';
import WeatherComparison from './WeatherComparison';

const TrackingApp = () => {
  return (
    <div className="tracking-app">
      <h1>Comparación Meteorológica</h1>
      <p>Comparación de datos entre AEMET (Estación Villafría) y Google Weather para la misma ubicación.</p>
      <WeatherComparison />
    </div>
  );
};

export default TrackingApp;