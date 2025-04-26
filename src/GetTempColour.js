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


