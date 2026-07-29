import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BACKEND_URI } from '../constants';

// Orden categórico fijo (paleta validada: separación CVD + contraste sobre
// el fondo oscuro de la tarjeta, #1a1d27) — no reordenar según los datos.
const PROVIDERS = [
  { key: 'open_meteo', label: 'Open-Meteo', color: '#3987e5' },
  { key: 'aemet', label: 'AEMET', color: '#d95926' },
  { key: 'ecmwf', label: 'ECMWF', color: '#199e70' },
  { key: 'gfs', label: 'GFS', color: '#c98500' },
  { key: 'icon', label: 'ICON', color: '#d55181' },
];

const formatCell = (value) => {
  if (!value || value.tmax === null || value.tmax === undefined) return '—';
  const base = `${value.tmax}° / ${value.tmin}°`;
  if (value.precip_prob !== undefined && value.precip_prob !== null) {
    return `${base} · ${value.precip_prob}%`;
  }
  return base;
};

const shortDayLabel = (row) => `${row.day.slice(0, 2).toLowerCase()} ${row.date}`;

const buildChartData = (rows) => rows.map((row) => {
  const point = { date: shortDayLabel(row) };
  PROVIDERS.forEach((p) => {
    const v = row[p.key];
    const hasValue = v && v.tmax !== null && v.tmax !== undefined;
    point[p.key] = hasValue ? v.tmax : null;
    point[`${p.key}_min`] = hasValue && v.tmin !== null && v.tmin !== undefined ? v.tmin : null;
  });
  return point;
});

const ForecastComparisonTable = ({ city, styles, isMobile }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    axios.get(`${BACKEND_URI}/api/forecast-comparison/${city}`)
      .then((response) => {
        if (isMounted) setData(response.data);
      })
      .catch(() => {
        if (isMounted) setError(true);
      });
    return () => { isMounted = false; };
  }, [city]);

  if (error) {
    return (
      <Typography style={{ ...styles.resumen, marginTop: '20px' }}>
        No se ha podido cargar la comparación de previsiones.
      </Typography>
    );
  }

  if (!data) {
    return (
      <Typography style={{ ...styles.resumen, marginTop: '20px' }}>
        Cargando comparación de previsiones...
      </Typography>
    );
  }

  const cellStyle = { color: 'azure', fontSize: isMobile ? '0.75rem' : '0.9rem', whiteSpace: 'nowrap' };
  const headerStyle = { ...cellStyle, color: 'lightblue', fontWeight: 'bold' };
  const chartData = buildChartData(data.rows);

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell style={headerStyle}>Día</TableCell>
              <TableCell style={headerStyle}>Fecha</TableCell>
              {PROVIDERS.map((p) => (
                <TableCell key={p.key} style={headerStyle}>{p.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow key={row.date}>
                <TableCell style={cellStyle}>{row.day}</TableCell>
                <TableCell style={cellStyle}>{row.date}</TableCell>
                {PROVIDERS.map((p) => (
                  <TableCell key={p.key} style={cellStyle}>{formatCell(row[p.key])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {data.stale && (
        <Typography style={{ ...styles.resumen, marginTop: '8px', color: '#e0a030' }}>
          Datos de la última consulta con éxito (una fuente ha fallado momentáneamente).
        </Typography>
      )}

      <Typography style={{ ...styles.resumen, marginTop: '20px', marginBottom: '4px' }}>
        Temperatura estimada por proveedor (línea continua = máxima, discontinua = mínima)
      </Typography>
      <Box sx={{ width: '100%', height: isMobile ? 320 : 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
          >
            <CartesianGrid stroke="#2c2c2a" vertical={false} />
            <XAxis
              type="category"
              dataKey="date"
              tick={{ fill: '#c3c2b7', fontSize: 12 }}
              stroke="#383835"
            />
            <YAxis
              type="number"
              unit="°"
              domain={['dataMin - 2', 'dataMax + 2']}
              tick={{ fill: '#898781', fontSize: 12 }}
              stroke="#383835"
              width={44}
            />
            <Tooltip
              contentStyle={{ background: '#1a1d27', border: '1px solid #383835', borderRadius: 6 }}
              labelStyle={{ color: '#c3c2b7' }}
              itemStyle={{ color: '#e0e0e0' }}
            />
            <Legend wrapperStyle={{ color: '#c3c2b7', fontSize: 12 }} />
            {PROVIDERS.map((p) => (
              <Line
                key={p.key}
                type="monotone"
                dataKey={p.key}
                name={p.label}
                stroke={p.color}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, stroke: '#1a1d27' }}
                connectNulls={false}
              />
            ))}
            {PROVIDERS.map((p) => (
              <Line
                key={`${p.key}_min`}
                type="monotone"
                dataKey={`${p.key}_min`}
                name={`${p.label} (mín)`}
                legendType="none"
                stroke={p.color}
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ r: 4, strokeWidth: 2, stroke: '#1a1d27' }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default ForecastComparisonTable;
