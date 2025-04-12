import { Box, Typography, Paper } from '@mui/material';
import GetTempColour from '../GetTempColour';
import GetHumColor from '../GetHumColor';
import ShowTempDiffs from '../ShowTempDiffs';
const BcnBurLayout = ({ weatherData, burgosWeather, loading, error, currentTime, getDate, getTime, validTemperatures }) => {


  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!weatherData || !burgosWeather) return null;

  const styles = {
    container: {
      minHeight: '100vh',
      padding: '16px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: '#fff',
    },
    header: {
      textAlign: 'center',
      marginBottom: '16px',
    },
    dataContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    stationCard: {
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(5px)',
    },
    stationHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
      color: 'azure',
    },
    dataRow: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: '1px',
      color: 'silver',
      gap: '20px',  
    },
    dataLabel: {
      fontSize: '2rem',
      color: 'silver',
    },
    dataValue: {
      fontSize: '2.5rem',
    },
    tempValue: {
      fontSize: '4rem',
    },
    timestamp: {
      fontSize: '12px',
      color: '#aaa',
      textAlign: 'center',
      marginTop: '16px',
    },
    maxminTemp: {
      fontSize: '1.5rem',
    },
    maxminTempContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    humPressContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: '20px',
    },
    tempDiffContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: '20px',
    },
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
         <Typography variant="h4" sx={{ color: 'silver' }}>
          {getDate(currentTime)} - {getTime(currentTime)}
        </Typography>
      </Box>

      <Box sx={styles.dataContainer}>
        {/* Sarrià Data */}
        <Paper elevation={3} sx={styles.stationCard}>
          <Box sx={styles.stationHeader}>
            <Typography variant="h4">Sarrià</Typography>
          </Box>

          {/* Exterior Temperature */}
          <Box sx={styles.dataRow}>
            <Typography sx={{ ...styles.tempValue, color: GetTempColour(weatherData.external_temperature) }}>
              {weatherData.external_temperature.toFixed(1)}°C
            </Typography>
            <Box sx={styles.maxminTempContainer}>
              {/* Max Temp */}
              <Typography style={{
                ...styles.maxminTemp,
                color: (weatherData.max_temperature <= 45 ? weatherData.max_temperature : validTemperatures.maxTemp) ? 
                  GetTempColour(weatherData.max_temperature <= 45 ? weatherData.max_temperature : validTemperatures.maxTemp) : 
                  'Gray'
              }}>
              {weatherData.max_temperature.toFixed(1)}°C
                </Typography>
              {/* Min Temp */}
              <Typography style={{
                ...styles.maxminTemp,
                color: (weatherData.min_temperature <= 45 ? weatherData.min_temperature : validTemperatures.minTemp) ? 
                  GetTempColour(weatherData.min_temperature <= 45 ? weatherData.min_temperature : validTemperatures.minTemp) : 
                  'Gray'
              }}>
                {weatherData.min_temperature.toFixed(1)}°C
              </Typography>

            </Box>
           </Box>
           <Box sx={styles.tempDiffContainer}>
            <ShowTempDiffs />
           </Box>
         
          <Box sx={styles.humPressContainer}>
            {/* Humidity */}
            < Box sx={styles.dataRow}>
                <Typography sx={{ ...styles.dataValue, color: GetHumColor(weatherData.humidity) }}>
                {weatherData.humidity}%
                </Typography>
            </Box>

            {/* Pressure */}
            <Box sx={styles.dataRow}>
              <Typography sx={{ ...styles.dataValue, color: 'orange' }}>{weatherData.pressure} hPa</Typography>
            </Box>
          </Box>
        </Paper>



        {/* Burgos Data */}
        <Paper elevation={3} sx={styles.stationCard}>
          <Box sx={styles.stationHeader}>
            <Typography variant="h4">Burgos</Typography>
          </Box>
          <Box sx={styles.dataRow}>
            <Typography sx={{ ...styles.tempValue, color: GetTempColour(burgosWeather.temperature) }}>
              {burgosWeather.temperature.toFixed(1)}°C
            </Typography>
          </Box>

          <Box sx={styles.humPressContainer}>
            <Box sx={styles.dataRow}>
              <Typography sx={{ ...styles.dataValue, color: GetHumColor(burgosWeather.humidity) }}>
                {burgosWeather.humidity}%
              </Typography>
            </Box>
            <Box sx={styles.dataRow}>
              <Typography sx={{ ...styles.dataValue, color: 'orange' }}>{burgosWeather.pressure} hPa</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Typography sx={styles.timestamp}>
        Última actualización: {getTime(currentTime)}
      </Typography>
    </Box>
  );
};

export default BcnBurLayout; 