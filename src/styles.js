export const createStyles = (isMobile, isTablet, weatherData, GetTempColour, GetHumColor) => ({
  header: {
    fontSize: isMobile ? '2.5rem' : isTablet ? '4rem' : '4rem',
    color: 'azure',
    marginBottom: isMobile ? '10px' : '10px',
    marginRight: isMobile ? '0' : '30px'
  },
  dateTime: {
    fontSize: isMobile ? '1.5rem' : isTablet ? '1.7rem' : '2.5rem',
    color: 'azure'
  },
  location: {
    fontSize: isMobile ? '0.8rem' : '1rem',
    color: 'DarkGray'
  },
  temperature: {
    fontSize: isMobile ? '5rem' : isTablet ? '8rem' : '8rem',
    color: weatherData ? GetTempColour(weatherData.external_temperature) : 'Gray'
  },
  tempInt: {
    fontSize: isMobile ? '1.5rem' : isTablet ? '1.5rem' : '1.5rem',
    color: weatherData ? GetTempColour(weatherData.internal_temperature) : 'Gray',
    marginRight: '70px',
    marginTop: '40px'
  },
  maxminTempLabel: {
    fontSize: isMobile ? '1rem' : isTablet ? '1rem' : '1.2rem',
    color: 'silver',
  },
  maxTemp: {
    fontSize: isMobile ? '2rem' : isTablet ? '2rem' : '3rem',
    color: weatherData ? GetTempColour(weatherData.max_temperature) : 'red',
    marginBottom: '-20px'
  },
  minTemp: {
    fontSize: isMobile ? '2rem' : isTablet ? '2rem' : '3rem',
    color: weatherData ? GetTempColour(weatherData.min_temperature) : 'blue',
    marginTop: '-20px',
  },
  dataDisplay: {
    fontSize: isMobile ? '2rem' : isTablet ? '2rem' : '2rem',
    color: 'azure'
  },
  datosHumedad: {
    fontSize: isMobile ? '2rem' : isTablet ? '2rem' : '2rem',
    color: weatherData ? GetHumColor(weatherData.humidity) : 'chartreuse'
  },
  datosPresion: {
    fontSize: isMobile ? '2rem' : isTablet ? '2rem' : '2rem',
    color: 'orangeRed'
  },
  datosRadiacion: {
    fontSize: isMobile ? '2rem' : isTablet ? '2rem' : '2rem',
    color: 'gold'
  },
  etiquetaHistorico: {
    fontSize: isMobile ? '1rem' : isTablet ? '1.5rem' : '1.5rem',
    color: 'DarkGray' 
  },
  titulo: {
    fontSize: isMobile ? '1rem' : isTablet ? '1.5rem' : '1.5rem',
    color: 'silver',
    marginBottom: '2rem'
  },
  etiqueta: {
    fontSize: isMobile ? '1rem' : isTablet ? '1.5rem' : '1.5rem',
    color: 'azure' 
  },
  seccion: {
    fontSize: isMobile ? '1rem' : isTablet ? '1.5rem' : '1.8rem',
    color: 'azure',
    marginTop: '10px',
    justifyContent: 'right'
  },
  subseccion: {
    fontSize: isMobile ? '1rem' : isTablet ? '1.4rem' : '1.5rem',
    color: 'lightblue',
    marginTop: '20px'
  },
  periodo: {
    fontSize: isMobile ? '0.9rem' : isTablet ? '0.9rem' : '0.9rem',
    color: 'azure',
  },
  enlace: {
    fontSize: '1rem',
    color: 'greenyellow'     
  },
  openweathermap: {
    fontSize: '1rem',
    color: 'silver'     
  },
  description: {
    fontSize: '1.2rem',
    color: 'azure',
    textTransform: 'capitalize',
    marginLeft: '40px',
    marginBottom: '20px'
  },
  resumen: {
    width: '85%',
    color: 'silver',
    fontSize: '0.9rem'
  }
}); 