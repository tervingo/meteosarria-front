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
import { BACKEND_URI } from '../constants';

const AiForecastTable = ({ city, styles, isMobile }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    axios.get(`${BACKEND_URI}/api/ai-forecast/${city}`)
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
        No se ha podido cargar la previsión.
      </Typography>
    );
  }

  if (!data) {
    return (
      <Typography style={{ ...styles.resumen, marginTop: '20px' }}>
        Cargando previsión...
      </Typography>
    );
  }

  const cellStyle = { color: 'azure', fontSize: isMobile ? '0.8rem' : '0.95rem' };
  const headerStyle = { ...cellStyle, color: 'lightblue', fontWeight: 'bold' };

  return (
    <Box sx={{ width: '100%', maxWidth: '600px', marginTop: '20px' }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell style={headerStyle}>Día</TableCell>
              <TableCell style={headerStyle}>Fecha</TableCell>
              <TableCell style={headerStyle} align="right">Máx (°C)</TableCell>
              <TableCell style={headerStyle} align="right">Mín (°C)</TableCell>
              <TableCell style={headerStyle} align="right">Prob. precip.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow key={row.date}>
                <TableCell style={cellStyle}>{row.day}</TableCell>
                <TableCell style={cellStyle}>{row.date}</TableCell>
                <TableCell style={cellStyle} align="right">{row.tmax}</TableCell>
                <TableCell style={cellStyle} align="right">{row.tmin}</TableCell>
                <TableCell style={cellStyle} align="right">{row.precip_prob}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {data.comment && (
        <Typography style={{ ...styles.resumen, marginTop: '15px' }}>
          {data.comment}
        </Typography>
      )}
    </Box>
  );
};

export default AiForecastTable;
