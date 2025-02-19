import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { Box, Typography, CircularProgress, useMediaQuery } from '@mui/material';
import { BACKEND_URI, WIDTH_PC, HEIGHT_PC } from './constants';
import GetTempColour from './GetTempColour';

const TemperatureHistoryChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [extremes, setExtremes] = useState({ max: null, min: null });

  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(min-width:601px) and (max-width:960px)');

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(BACKEND_URI + '/api/yearly-data');
        if (response.data && response.data.data) {
          const processedData = response.data.data.map(day => ({
            ...day,
            max: parseFloat(day.max),
            min: parseFloat(day.min),
            mean: parseFloat(day.mean)
          }));
          
          // Calcular extremos
          const maxTemp = Math.max(...processedData.map(d => d.max));
          const minTemp = Math.min(...processedData.map(d => d.min));
          const maxDay = processedData.find(d => d.max === maxTemp);
          const minDay = processedData.find(d => d.min === minTemp);
          
          setExtremes({
            max: {
              temp: maxTemp,
              date: new Date(maxDay.date).toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit' 
              })
            },
            min: {
              temp: minTemp,
              date: new Date(minDay.date).toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit' 
              })
            }
          });
          
          setData(processedData);
        }
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError('Error al obtener datos históricos');
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, []);

  const chart = useMemo(() => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box p={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    const getFontSize = () => {
      if (isMobile) return '10px';
      if (isTablet) return '12px';
      return '14px';
    };

    const getMargin = () => ({
      top: isMobile ? 10 : 0,
      right: isMobile ? 80 : 30, 
      left: isMobile ? 5 : 20,
      bottom: isMobile ? 60 : 20,
    });

    const temperatureRanges = [
//      { start: -10, end: -5 },
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
          {temperatureRanges.map((range) => (
            <ReferenceArea
              key={`${range.start}-${range.end}`}
              y1={range.start}
              y2={range.end}
              fill={GetTempColour(range.start)}
              fillOpacity={0.1}
            />
          ))}
          
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="date"
            tickFormatter={(dateStr) => {
              const date = new Date(dateStr);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: getFontSize(), fill: 'silver' }}
          />
          <YAxis
            domain={[-5, 40]}
            ticks={[-5, 0, 5, 10, 15, 20, 25, 30, 35, 40]}
            label={{
              value: 'Temperatura (°C)',
              angle: -90,
              position: 'insideLeft',
              offset: isMobile ? 0 : 10,
              style: { fontSize: getFontSize(), fill: 'silver' }
            }}
            tick={{ fontSize: getFontSize(), fill: 'silver' }}
          />
          
          {/* Etiquetas de extremos */}
          {extremes.max && (
            <text
              x="72%"
              y="23%"
              fill="azure"
              fontSize={getFontSize()}
              textAnchor="end"
            >
              {`Tmáx = ${extremes.max.temp.toFixed(1)}°`}
            </text>
          )}
          {extremes.max && (
            <text
              x="65%"
              y="29%"
              fill="azure"
              fontSize={getFontSize()}
              textAnchor="end"
            >
              {`(${extremes.max.date})`}
            </text>
          )}
          {extremes.min && (
            <text
              x="72%"
              y="59%"
              fill="azure"
              fontSize={getFontSize()}
              textAnchor="end"
            >
              {`Tmín = ${extremes.min.temp.toFixed(1)}°`}
            </text>
          )}
          {extremes.min && (
            <text
              x="66%"
              y="65%"
              fill="azure"
              fontSize={getFontSize()}
              textAnchor="end"
            >
              {`(${extremes.min.date})`}
            </text>
          )}

          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid #999',
              borderRadius: '4px'
            }}
            labelStyle={{ color: 'silver' }}
            formatter={(value) => [`${value.toFixed(1)}°C`]}
          />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ fontSize: getFontSize() }}
          />
          <Line
            type="monotone"
            dataKey="max"
            name="Máxima"
            stroke="#ff0000"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="min"
            name="Mínima"
            stroke="#0088ff"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="mean"
            name="Media"
            stroke="#ffffff"
            strokeWidth={1.5}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }, [data, loading, error, isMobile, isTablet, extremes]);

  return (

    <Box 
      height={isMobile ? "250px" : isTablet ? "300px" : HEIGHT_PC}
      width={isMobile ? '500px' : isTablet ? '550px' : WIDTH_PC}
      maxWidth="1200px"
      margin="0 auto"
      padding={isMobile ? "10px" : "10px"}
    >
      {chart}
    </Box>
  );
};

export default TemperatureHistoryChart;