const GetTempColour = (temperature) => {
  let color;
  if (temperature >= -10 && temperature < -5) {
    color = '#9400D3'; // Dark violet
  } else if (temperature >= -5 && temperature < 0) {
    color = '#EE82EE'; // Violet
  } else if (temperature >= 0 && temperature < 5) {
    color = '#0000FF'; // Blue
  } else if (temperature >= 5 && temperature < 10) {
    color = 'DodgerBlue'; // Dodger Blue
  } else if (temperature >= 10 && temperature < 15) {
    color = 'DeepSkyBlue'; // Deep Sky Blue
  } else if (temperature >= 15 && temperature < 20) {
    color = 'YellowGreen'; // Chartreuse
  } else if (temperature >= 20 && temperature < 25) {
    color = '#FFFF00'; // Yellow
  } else if (temperature >= 25 && temperature < 30) {
    color = '#FFA500'; // Orange
  } else if (temperature >= 30 && temperature < 35) {
    color = '#FF0000'; // Red
  } else if (temperature >= 35 && temperature <= 40) {
    color = '#FF00FF'; // Fuchsia
  } else {
    color = '#FFFFFF'; // Default to white if out of range
  }
    return color;
  };
  
  export default GetTempColour;