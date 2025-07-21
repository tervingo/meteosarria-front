import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useTemperature } from './TemperatureContext';
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
import { BACKEND_URI, MAX_VALUE_X, MAX_VALUE_Y, MAX_TIME_X, MAX_TIME_Y, MIN_VALUE_X, MIN_VALUE_Y, MIN_TIME_X, MIN_TIME_Y } from './constants';
import GetTempColour, { calculateHeatIndexAemet } from './GetTempColour';

const TemperatureChart = ({ timeRange, isMobile: propIsMobile, isTablet: propIsTablet }) => {
  const [data, setData] = useState([]);
  const { setValidTemperatures } = useTemperature();
  
  const isMobileHook = useMediaQuery('(max-width:600px)');
  const isTabletHook = useMediaQuery('(min-width:601px) and (max-width:960px)');

  const isMobile = typeof propIsMobile === 'boolean' ? propIsMobile : isMobileHook;
  const isTablet = typeof propIsTablet === 'boolean' ? propIsTablet : isTabletHook;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(BACKEND_URI + '/api/meteo-data', {
          params: { timeRange },
        });
        const fetchedData = response.data;

        let lastValidTemperature = null;
        const formattedData = fetchedData.map((entry) => {
          const [datePart, timePart] = entry.timestamp.split(' ');
          const [day, month, year] = datePart.split('-');
          const formattedDate = `${year}-${month}-${day}T${timePart}`;
          const dateObj = new Date(formattedDate);

          let currentTemp = Number(entry.external_temperature);

          if (currentTemp <= 45) {
            lastValidTemperature = currentTemp;
          } else {
            currentTemp = lastValidTemperature !== null ? lastValidTemperature : null;
          }

          // Calculate heat index for this data point
          const heatIndex = currentTemp !== null && entry.humidity && currentTemp >= 26 && entry.humidity >= 40 ? 
            calculateHeatIndexAemet(currentTemp, entry.humidity) : null;

          return {
            fullTimestamp: entry.timestamp,
            dateTime: dateObj,
            external_temperature: currentTemp,
            heat_index: heatIndex,
          };
        }).filter((item) => item.external_temperature !== null);

        const sortedData = formattedData
          .filter((item) => !isNaN(item.dateTime))
          .sort((a, b) => a.dateTime - b.dateTime);

        setData(sortedData);

        // Update valid temperatures in context
        if (sortedData.length > 0) {
          // Get today's date at 00:00h
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Filter data for current day only, regardless of timeRange
          const todayData = sortedData.filter(item => {
            const itemDate = new Date(item.dateTime);
            return itemDate.getDate() === today.getDate() &&
                   itemDate.getMonth() === today.getMonth() &&
                   itemDate.getFullYear() === today.getFullYear();
          });

          if (todayData.length > 0) {
            const validTemps = todayData
              .map(d => ({
                temp: d.external_temperature,
                time: d.fullTimestamp
              }))
              .filter(item => item.temp !== null && item.temp <= 45);
            
            if (validTemps.length > 0) {
              const maxTempData = validTemps.reduce((max, current) => 
                current.temp > max.temp ? current : max
              );
              const minTempData = validTemps.reduce((min, current) => 
                current.temp < min.temp ? current : min
              );

              setValidTemperatures({
                maxTemp: maxTempData.temp,
                minTemp: minTempData.temp,
                maxTempTime: maxTempData.time,
                minTempTime: minTempData.time
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching temperature data:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [timeRange, setValidTemperatures]);

  const chart = useMemo(() => {
    if (data.length === 0) {
      return <div className="text-center p-4">Loading...</div>;
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
    
    const minTemp = Math.floor(overallMinTemp / 5) * 5; // Redondear hacia abajo al múltiplo de 5 más cercano 
    const maxTemp = Math.ceil(overallMaxTemp / 5) * 5; // Redondear hacia arriba al múltiplo de 5 más cercano 

    
    // Generar ticks en múltiplos de 5
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
      const [DatePart] = fecha.split(' ');
      const [day, month] = DatePart.split('-');
      const hora = fecha.split(' ')[1];
      return day + '/' + month + ' ' + hora;
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
          {/* Franjas de temperatura */}
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
          {/* Etiquetas de extremos */}
          <text
            x = {MAX_VALUE_X}
            y = {MAX_VALUE_Y}
            fill="azure"
            fontSize={getFontSize()}
            textAnchor="end"
          >
            {`Tmáx = ${absMaxTemp.toFixed(1)}°`}
          </text>
          <text
            x = {MAX_TIME_X}
            y = {MAX_TIME_Y}
            fill="azure"
            fontSize={getFontSize()}
            textAnchor="end"
          >
            {`(${getFechaHora(maxTempTime)})`}
          </text>
          <text
            x = {MIN_VALUE_X}
            y = {MIN_VALUE_Y}
            fill="azure"
            fontSize={getFontSize()}
            textAnchor="end"
          >
            {`Tmín = ${absMinTemp.toFixed(1)}°`}
          </text>
          <text
            x = {MIN_TIME_X}
            y = {MIN_TIME_Y}
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
        height: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '10px' : '10px',
      }}
    >
      {chart}
    </div>
  );
};

export default TemperatureChart;