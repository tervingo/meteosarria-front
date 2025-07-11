const GetTempColour = (temperature) => {
  let color;
  if (temperature >= -10 && temperature < -5) {
    color = 'DarkViolet'; // Dark violet
  } else if (temperature >= -5 && temperature < 0) {
    color = 'Violet'; // Violet
  } else if (temperature >= 0 && temperature < 5) {
    color = 'DeepPink';
  } else if (temperature >= 5 && temperature < 10) {
    color = 'DodgerBlue';
  } else if (temperature >= 10 && temperature < 15) {
    color = 'Aqua';
  } else if (temperature >= 15 && temperature < 20) {
    color = 'YellowGreen';
  } else if (temperature >= 20 && temperature < 25) {
    color = 'Gold'; 
  } else if (temperature >= 25 && temperature < 30) {
    color = 'Orange';
  } else if (temperature >= 30 && temperature < 35) {
    color = 'OrangeRed';
  } else if (temperature >= 35 && temperature <= 40) {
    color = 'Fuchsia';
  } else {
    color = 'white'; // Default to white if out of range
  }
    return color;
  };
  
  export default GetTempColour;

// Función para calcular la temperatura de sensación (fórmula simplificada de Rothfusz)
export const calculateHeatIndex = (temperature, humidity) => {
  // Solo calcular para temperaturas >= 20°C (verano)
  if (temperature < 20) {
    return null;
  }

  // Fórmula simplificada de Rothfusz
  // HI = 0.5 * (T + 61.0 + ((T-68)*1.2) + (RH*0.094))
  // Donde T = temperatura en °F, RH = humedad relativa
  
  const tempF = (temperature * 9/5) + 32; // Convertir a Fahrenheit
  const heatIndexF = 0.5 * (tempF + 61.0 + ((tempF - 68) * 1.2) + (humidity * 0.094));
  const heatIndexC = (heatIndexF - 32) * 5/9; // Convertir de vuelta a Celsius
  
  return Math.round(heatIndexC * 10) / 10; // Redondear a 1 decimal
};

// Función para calcular la temperatura de sensación (fórmula AEMET)
export const calculateHeatIndexAemet = (temperature, humidity) => {
  // Solo calcular para temperaturas >= 26°C y humedad relativa >= 40% (verano)
  if (temperature < 26 || humidity < 40) {
    return null;
  }

  // STC = -8,78469476 + 1,61139411·T + 2,338548839·HR - 0,14611605·T·HR - 0,012308094·T2 - 0,016424828·HR2 + + 0,002211732·T2·R + 0,00072546·T·HR2 - 0,000003582·T2·HR2
  const stc = -8.78469476 + 1.61139411*temperature + 2.338548839*humidity - 0.14611605*temperature*humidity - 0.012308094*temperature*temperature - 0.016424828*humidity*humidity + 0.002211732*temperature*temperature*humidity + 0.00072546*temperature*humidity*humidity - 0.000003582*temperature*temperature*humidity*humidity;
  
  return Math.round(stc * 10) / 10; // Redondear a 1 decimal
};



