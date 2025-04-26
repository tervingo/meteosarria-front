import { Typography, Container, Box, Card, CardMedia, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import Menu from '../Menu';
import DatosBurgos from './DatosBurgos';
import DatosSarria from './DatosSarria';
import Graficas from './Graficas';
import Modelos from './Modelos';
import Radar from './Radar';
import TemperatureBackground from '../TemperatureBackground';
import GetTempColour from '../GetTempColour';
import { SHOW_COLOUR_BAR } from '../constants';

const DesktopLayout = ({
  weatherData,
  burgosWeather,
  loading,
  error,
  currentTime,
  timeRange,
  handleTimeRangeChange,
  styles,
  menuItems,
  getDate,
  getTime,
  validTemperatures,
  isTablet
}) => {
  return (
    <Container 
      maxWidth={false} 
      className="App"
      sx={{
        px: { sm: 2, md: 3 },
        maxWidth: isTablet ? '100%' : '1920px',
        overflowX: 'hidden'
      }}
    >
      {weatherData && <TemperatureBackground temperature={weatherData.external_temperature} />}

      <Box className="App-header" py={isTablet ? 2 : 4}>
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" width="100%">
          <Box>
            <Typography variant="h1" style={styles.header}>
              #meteosarria
            </Typography>
            <Typography variant="h6" style={styles.location}>
              Sarrià - Barcelona {!isTablet && "(41º 23' 42\" N, 2º 7' 21\" E - 110m)"}
            </Typography>
          </Box>
          <Card>
            <CardMedia
              component="img"
              sx={{ 
                width: isTablet ? "100px" : "130px",
                height: isTablet ? "100px" : "130px",
                objectFit: 'cover'
              }}
              image="/images/nubes.jpg"
              alt="Weather"
            />
          </Card>
        </Box>
      </Box>

      <Menu items={menuItems} />

      <Box className="weather-data" mt={3}>
        {loading && <Typography>Loading weather data...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        <Typography variant="h6" style={styles.dateTime}>
          {getDate(currentTime)} - {getTime(currentTime)}
        </Typography>
        {weatherData && (
          <Box className="weather-container">
            <Box 
              display="grid" 
              gap={2} 
              sx={{
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gridTemplateAreas: `
                  "1I 1C 1D"
                  "2I 2C 2D"
                `,
                '& > *': {
                  minWidth: 0, // Previene que los elementos se desborden
                  width: '100%'
                }
              }}
            >
              {/* GRÁFICAS - 1I */}
              <Box sx={{ 
                gridArea: '1I', 
                height: '100%', 
                border: '1px solid darkgrey',
                overflowX: 'hidden'
              }}>
                <Graficas 
                  styles={styles}
                  isMobile={false}
                  isTablet={isTablet}
                  timeRange={timeRange}
                  handleTimeRangeChange={handleTimeRangeChange}
                />
              </Box>

              {/* SARRIÀ - 1C */}
              <Box sx={{ 
                gridArea: '1C', 
                border: '1px solid azure',
                overflowX: 'hidden'
              }}>
                <DatosSarria 
                  weatherData={weatherData}
                  styles={styles}
                  isMobile={false}
                  isTablet={isTablet}
                  currentTime={currentTime}
                  getTime={getTime}
                  validTemperatures={validTemperatures}
                />
              </Box>

              {/* BURGOS - 1D */}
              <Box sx={{ 
                gridArea: '1D', 
                border: '1px solid darkgrey',
                overflowX: 'hidden'
              }}>
                <DatosBurgos 
                  burgosWeather={burgosWeather}
                  styles={styles}
                  isMobile={false}
                  isTablet={isTablet}
                />
              </Box>

              {/* MODELOS */}
              <Box sx={{ 
                gridArea: '2I', 
                border: '1px solid darkgrey',
                overflowX: 'hidden'
              }}>
                <Modelos 
                  styles={styles}
                  isMobile={false}
                  isTablet={isTablet}
                />
              </Box>

              {/* RADAR */}
              <Box sx={{ 
                gridArea: '2C', 
                border: '1px solid darkgrey',
                overflowX: 'hidden'
              }}>
                <Radar 
                  styles={styles}
                  isMobile={false}
                  isTablet={isTablet}
                />
              </Box>

              <Box sx={{ 
                gridArea: '2D', 
                border: '1px solid darkgrey',
                overflowX: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 2
              }}>
                {SHOW_COLOUR_BAR && (
                  <TableContainer 
                    component={Paper} 
                    sx={{ 
                      width: '100%',
                      '& .MuiTable-root': {
                        width: '100%'
                      }
                    }}
                  >
                    <Table>
                      <TableBody>
                        <TableRow>
                          {Array.from({ length: 10 }, (_, i) => {
                            const temp = -7 + (i * 5);
                            return (
                              <TableCell 
                                key={i}
                                sx={{ 
                                  textAlign: 'center',
                                  padding: 1,
                                  backgroundColor: GetTempColour(temp),
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '1rem',
                                  width: '10%'
                                }}
                              >
                                {temp}°C
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>

            </Box>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 4, mb: 2, textAlign: 'center' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: 4 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon sx={{ color: 'gray', fontSize: '1rem' }} />
            <Typography variant="body2">
              <a href="mailto:meteosarria@gmail.com" style={{ color: 'gray', textDecoration: 'none' }}>
                meteosarria@gmail.com
              </a>
            </Typography>
          </Box>
          <Typography variant="body2" style={{ color: 'gray' }}>
            ® www.meteosarria.com 2025
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default DesktopLayout; 