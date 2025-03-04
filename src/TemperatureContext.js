import React, { createContext, useState, useContext } from 'react';

const TemperatureContext = createContext();

export function TemperatureProvider({ children }) {
  const [validTemperatures, setValidTemperatures] = useState({
    maxTemp: null,
    minTemp: null,
    maxTempTime: null,
    minTempTime: null
  });

  return (
    <TemperatureContext.Provider value={{ validTemperatures, setValidTemperatures }}>
      {children}
    </TemperatureContext.Provider>
  );
}

export function useTemperature() {
  return useContext(TemperatureContext);
} 