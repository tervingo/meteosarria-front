import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import { useMediaQuery } from '@mui/material';
import { BACKEND_URI } from './constants';
import GetTempColour, { calculateHeatIndexAemet } from './GetTempColour';

const BurgosTemperatureChart = ({ timeRange = '24h', isMobile: propIsMobile, isTablet: propIsTablet }) => {
  const [data, setData] = useState([]);
  
  const isMobileHook = useMediaQuery('(max-width:600px)');
  const isTabletHook = useMediaQuery('(min-width:601px) and (max-width:960px)');

  const isMobile = typeof propIsMobile === 'boolean' ? propIsMobile : isMobileHook;
  const isTablet = typeof propIsTablet === 'boolean' ? propIsTablet : isTabletHook;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Request more historical data - try to get enough for the time range
        let limit = 144; // Default for 24h (every 10 mins = 144 records per day)
        switch (timeRange) {
          case '48h':
            limit = 288; // 48h * 6 records/hour
            break;
          case '7d':
            limit = 1008; // 7 days * 144 records/day
            break;
          default:
            limit = 144;
        }
        
        const response = await axios.get(`${BACKEND_URI}/api/weather/history`, {
          params: { limit: limit }
        });
        const fetchedData = response.data.data;

        if (!fetchedData || fetchedData.length === 0) {
          console.log("No Burgos weather data available");
          return;
        }

        // Calculate the time range for filtering in local time
        const nowLocal = new Date();
        let startTimeLocal;
        
        switch (timeRange) {
          case '24h':
            startTimeLocal = new Date(nowLocal.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '48h':
            startTimeLocal = new Date(nowLocal.getTime() - 48 * 60 * 60 * 1000);
            break;
          case '7d':
            startTimeLocal = new Date(nowLocal.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          default:
            startTimeLocal = new Date(nowLocal.getTime() - 24 * 60 * 60 * 1000);
        }

        console.log('Filtering data from:', startTimeLocal.toLocaleString('es-ES'));
        console.log('Until now:', nowLocal.toLocaleString('es-ES'));
        
        // Debug available data range
        if (fetchedData.length > 0) {
          const firstEntry = fetchedData[fetchedData.length - 1]; // Oldest
          const lastEntry = fetchedData[0]; // Newest
          console.log('Available data range:');
          console.log('  Oldest:', firstEntry.timestamp);
          console.log('  Newest:', lastEntry.timestamp);
        }

        // Filter data by time range, converting UTC timestamps to local time for comparison
        const filteredData = fetchedData.filter(entry => {
          // Parse UTC timestamp from database
          let utcDate;
          if (typeof entry.timestamp === 'string') {
            // Add Z if missing to ensure it's interpreted as UTC
            if (!entry.timestamp.endsWith('Z') && !entry.timestamp.includes('+')) {
              utcDate = new Date(entry.timestamp + 'Z');
            } else {
              utcDate = new Date(entry.timestamp);
            }
          } else {
            utcDate = new Date(entry.timestamp);
          }

          // Convert UTC to Madrid local time (considering DST)
          // Madrid is UTC+1 in winter, UTC+2 in summer (DST)
          // But let's check what the actual offset should be
          const now = new Date();
          const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
          const madridNow = new Date(utcNow.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
          const actualOffset = (madridNow.getTime() - utcNow.getTime()) / (60 * 60 * 1000);
          
          const localTime = new Date(utcDate.getTime() + actualOffset * 60 * 60 * 1000);
          
          const isInRange = localTime >= startTimeLocal && localTime <= nowLocal;
          
          // Debug first few entries
          if (fetchedData.indexOf(entry) < 3) {
            console.log('Entry timestamp (UTC):', entry.timestamp);
            console.log('Parsed UTC date:', utcDate.toISOString());
            console.log('Calculated offset (hours):', actualOffset);
            console.log('Converted local time:', localTime.toLocaleString('es-ES'));
            console.log('Start time:', startTimeLocal.toLocaleString('es-ES'));
            console.log('End time:', nowLocal.toLocaleString('es-ES'));
            console.log('In range:', isInRange);
            console.log('---');
          }
          
          return isInRange;
        });

        console.log(`Filtered ${filteredData.length} records from ${fetchedData.length} total records`);

        let lastValidTemperature = null;
        const formattedData = filteredData.map((entry) => {
          // Parse UTC timestamp correctly
          let utcDate;
          if (typeof entry.timestamp === 'string') {
            if (!entry.timestamp.endsWith('Z') && !entry.timestamp.includes('+')) {
              utcDate = new Date(entry.timestamp + 'Z');
            } else {
              utcDate = new Date(entry.timestamp);
            }
          } else {
            utcDate = new Date(entry.timestamp);
          }

          // Convert to local time for display using the same offset calculation
          const now = new Date();
          const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
          const madridNow = new Date(utcNow.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
          const actualOffset = (madridNow.getTime() - utcNow.getTime()) / (60 * 60 * 1000);
          
          const localTime = new Date(utcDate.getTime() + actualOffset * 60 * 60 * 1000);
          
          // Extract temperature from Burgos data structure
          let currentTemp = null;
          if (entry.google_weather_burgos_center?.temperature !== undefined) {
            currentTemp = parseFloat(entry.google_weather_burgos_center.temperature);
          } else if (entry.raw_data?.temperature?.degrees !== undefined) {
            currentTemp = parseFloat(entry.raw_data.temperature.degrees);
          }

          // Validate temperature
          if (currentTemp !== null && currentTemp <= 45 && currentTemp >= -20) {
            lastValidTemperature = currentTemp;
          } else {
            currentTemp = lastValidTemperature;
          }

          // Extract humidity for heat index calculation
          let humidity = null;
          if (entry.google_weather_burgos_center?.humidity !== undefined) {
            humidity = parseFloat(entry.google_weather_burgos_center.humidity);
          } else if (entry.raw_data?.relativeHumidity !== undefined) {
            humidity = parseFloat(entry.raw_data.relativeHumidity);
          }

          // Calculate heat index for this data point
          const heatIndex = currentTemp !== null && humidity !== null && currentTemp >= 26 && humidity >= 40 ? 
            calculateHeatIndexAemet(currentTemp, humidity) : null;

          // Format timestamp for display in local time
          const formattedTimestamp = localTime.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/(\d{2})\/(\d{2}),\s(\d{2}):(\d{2})/, '$1-$2 $3:$4');

          return {
            fullTimestamp: formattedTimestamp,
            dateTime: localTime, // Use local time for sorting and display
            external_temperature: currentTemp,
            heat_index: heatIndex,
          };
        }).filter((item) => item.external_temperature !== null);

        const sortedData = formattedData
          .filter((item) => !isNaN(item.dateTime))
          .sort((a, b) => a.dateTime - b.dateTime);

        setData(sortedData);

      } catch (error) {
        console.error('Error fetching Burgos temperature data:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(intervalId);
  }, [timeRange]);

  const chart = useMemo(() => {
    if (data.length === 0) {
      return <div className="text-center p-4">Cargando datos de Burgos...</div>;
    }

    const absMinTemp = Math.min(...data.map((d) => d.external_temperature));
    const absMaxTemp = Math.max(...data.map((d) => d.external_temperature));
    
    // Calculate min/max for heat index to determine Y-axis range
    const heatIndexValues = data.map(d => d.heat_index).filter(val => val !== null);
    const absMinHeatIndex = heatIndexValues.length > 0 ? Math.min(...heatIndexValues) : absMinTemp;
    const absMaxHeatIndex = heatIndexValues.length > 0 ? Math.max(...heatIndexValues) : absMaxTemp;
    
    // Use the wider range for Y-axis
    const overallMinTemp = Math.min(absMinTemp, absMinHeatIndex);
    const overallMaxTemp = Math.max(absMaxTemp, absMaxHeatIndex);
    
    const minTemp = Math.floor(overallMinTemp / 5) * 5; // Round down to nearest multiple of 5
    const maxTemp = Math.ceil(overallMaxTemp / 5) * 5; // Round up to nearest multiple of 5

    // Generate ticks in multiples of 5
    const generateTicks = (min, max) => {
      const ticks = [];
      for (let i = min; i <= max; i += 5) {
        ticks.push(i);
      }
      return ticks;
    };

    const minTempData = data.find((d) => d.external_temperature === absMinTemp);
    const maxTempData = data.find((d) => d.external_temperature === absMaxTemp);
    const minTempTime = minTempData ? minTempData.fullTimestamp : 'N/A';
    const maxTempTime = maxTempData ? maxTempData.fullTimestamp : 'N/A';

    const getFechaHora = (fecha) => {
      // Handle format: "24-08 11:50" or "24/08, 11:50"
      if (fecha.includes('/')) {
        // Format: "24/08, 11:50"
        const [datePart, timePart] = fecha.split(', ');
        const [day, month] = datePart.split('/');
        return `${day}/${month} ${timePart}`;
      } else if (fecha.includes(' ')) {
        // Format: "24-08 11:50"
        const [datePart, timePart] = fecha.split(' ');
        const [day, month] = datePart.split('-');
        return `${day}/${month} ${timePart}`;
      }
      // Fallback
      return fecha;
    }

    // Responsive configurations
    const getFontSize = () => {
      if (isMobile) return '10px';
      if (isTablet) return '12px';
      return '14px';
    };

    const getMargin = () => ({
      top: isMobile ? 10 : 10,
      right: isMobile ? 5 : isTablet ? 60 : 30,
      left: isMobile ? 5 : isTablet ? 60 : 20,
      bottom: isMobile ? 60 : 20,
    });

    const getTickInterval = () => {
      if (isMobile) return Math.ceil(data.length / 4);
      if (isTablet) return Math.ceil(data.length / 6);
      return 'preserveStartEnd';
    };

    const temperatureRanges = [
      { start: -5, end: 0 },
      { start: 0, end: 5 },
      { start: 5, end: 10 },
      { start: 10, end: 15 },
      { start: 15, end: 20 },
      { start: 20, end: 25 },
      { start: 25, end: 30 },
      { start: 30, end: 35 },
      { start: 35, end: 40 }
    ];

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={getMargin()}
        >
          {/* Temperature ranges */}
          {temperatureRanges.map((range) => (
            <ReferenceArea
              key={`${range.start}-${range.end}`}
              y1={range.start}
              y2={range.end}
              fill={GetTempColour(range.start)}
              fillOpacity={0.2}
            />
          ))}
          
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="fullTimestamp"
            tickFormatter={(timeStr) => {
              const [datePart, timePart] = timeStr.split(' ');
              if (timeRange === '7d') {
                const [day, month] = datePart.split('-');
                return `${day}/${month}`;
              }
              return timePart;
            }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={getTickInterval()}
            tick={{ fontSize: getFontSize(), fill: 'silver' }}
          />
          <YAxis
            domain={[minTemp, maxTemp]}
            ticks={generateTicks(minTemp, maxTemp)}
            label={{
              value: 'Temperatura (°C)',
              angle: -90,
              position: 'insideLeft',
              offset: isMobile ? 0 : 10,
              style: { fontSize: getFontSize(), fill: 'silver' }
            }}
            tick={{ fontSize: getFontSize(), fill: 'silver' }}
          />
          {/* Temperature extremes labels */}
          <text
            x="95%"
            y="10%"
            fill="azure"
            fontSize={getFontSize()}
            textAnchor="end"
          >
            {`Tmáx = ${absMaxTemp.toFixed(1)}°`}
          </text>
          <text
            x="95%"
            y="15%"
            fill="azure"
            fontSize={getFontSize()}
            textAnchor="end"
          >
            {`(${getFechaHora(maxTempTime)})`}
          </text>
          <text
            x="95%"
            y="90%"
            fill="azure"
            fontSize={getFontSize()}
            textAnchor="end"
          >
            {`Tmín = ${absMinTemp.toFixed(1)}°`}
          </text>
          <text
            x="95%"
            y="95%"
            fill="azure"
            fontSize={getFontSize()}
            textAnchor="end"
          >
            {`(${getFechaHora(minTempTime)})`}
          </text>
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'external_temperature') {
                return [`${value.toFixed(1)}°C`, 'Temperatura'];
              } else if (name === 'heat_index') {
                return [`${value.toFixed(1)}°C`, 'Sensación'];
              }
              return [value, name];
            }}
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid #999',
              borderRadius: '4px',
              fontSize: getFontSize()
            }}
            labelStyle={{ color: 'silver' }}
          />
          {!isMobile && (
            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{ fontSize: getFontSize() }}
            />
          )}
          <Line
            type="monotone"
            dataKey="external_temperature"
            name="Temperatura"
            stroke="chartreuse"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          {(() => {
            // Check if there are enough valid heat index values to warrant showing the line
            const validHeatIndexCount = data.filter(d => d.heat_index !== null).length;
            const totalDataPoints = data.length;
            const hasSignificantHeatIndex = validHeatIndexCount > 0 && (validHeatIndexCount / totalDataPoints) > 0.1; // At least 10% of points have heat index
            
            return hasSignificantHeatIndex ? (
              <Line
                type="monotone"
                dataKey="heat_index"
                name="Sensación"
                stroke="#ff6600"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            ) : null;
          })()}
        </LineChart>
      </ResponsiveContainer>
    );
  }, [data, timeRange, isMobile, isTablet]);

  return (
    <div
      style={{
        width: '100%',
        height: '300px', // Fixed height for Burgos chart
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '10px' : '10px',
      }}
    >
      {chart}
    </div>
  );
};

export default BurgosTemperatureChart;