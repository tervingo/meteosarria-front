import { Box, Typography, Paper } from '@mui/material';
import GetTempColour from '../GetTempColour';
import GetHumColor from '../GetHumColor';

const BcnBurLayout = ({ weatherData, burgosWeather, loading, error, currentTime, getDate, getTime }) => {
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
      gap: '16px',
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
      justifyContent: 'space-between',
      marginBottom: '8px',
      color: 'silver',
    },
    dataLabel: {
      fontSize: '2rem',
      color: 'silver',
    },
    dataValue: {
      fontSize: '2rem',
    },
    timestamp: {
      fontSize: '12px',
      color: '#aaa',
      textAlign: 'center',
      marginTop: '16px',
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
          <Box sx={styles.dataRow}>
            <Typography sx={styles.dataLabel}>Temperatura:</Typography>
            <Typography sx={{ ...styles.dataValue, color: GetTempColour(weatherData.external_temperature) }}>
              {weatherData.external_temperature.toFixed(1)}°C
            </Typography>
          </Box>
          <Box sx={styles.dataRow}>
            <Typography sx={styles.dataLabel}>Humedad:</Typography>
            <Typography sx={{ ...styles.dataValue, color: GetHumColor(weatherData.humidity) }}>
              {weatherData.humidity}%
            </Typography>
          </Box>
          <Box sx={styles.dataRow}>
            <Typography sx={styles.dataLabel}>Presión:</Typography>
            <Typography sx={styles.dataValue}>{weatherData.pressure} hPa</Typography>
          </Box>
        </Paper>

        {/* Burgos Data */}
        <Paper elevation={3} sx={styles.stationCard}>
          <Box sx={styles.stationHeader}>
            <Typography variant="h4">Burgos</Typography>
          </Box>
          <Box sx={styles.dataRow}>
            <Typography sx={styles.dataLabel}>Temperatura:</Typography>
            <Typography sx={{ ...styles.dataValue, color: GetTempColour(burgosWeather.temperature) }}>
              {burgosWeather.temperature.toFixed(1)}°C
            </Typography>
          </Box>
          <Box sx={styles.dataRow}>
            <Typography sx={styles.dataLabel}>Humedad:</Typography>
            <Typography sx={{ ...styles.dataValue, color: GetHumColor(burgosWeather.humidity) }}>
              {burgosWeather.humidity}%
            </Typography>
          </Box>
          <Box sx={styles.dataRow}>
            <Typography sx={styles.dataLabel}>Presión:</Typography>
            <Typography sx={styles.dataValue}>{burgosWeather.pressure} hPa</Typography>
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