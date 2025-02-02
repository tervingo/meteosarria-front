import { useEffect } from 'react';

const TemperatureBackground = ({ temperature }) => {
  useEffect(() => {
    let color;
    if (temperature >= -10 && temperature < -5) {
      color = 'DarkViolet'; // Dark violet
    } else if (temperature >= -5 && temperature < 0) {
      color = 'Violet'; // Violet
    } else if (temperature >= 0 && temperature < 5) {
      color = 'Blue'; 
    } else if (temperature >= 5 && temperature < 10) {
      color = 'DodgerBlue';
    } else if (temperature >= 10 && temperature < 15) {
      color = 'DeepSkyBlue';
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

    color = 'DarkGray'; // Change background to dark grey

    document.body.style.backgroundColor = color;
  }, [temperature]);

  return null; // This component does not render anything
};

export default TemperatureBackground;