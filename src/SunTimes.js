import React from 'react';
import { Box, Typography } from '@mui/material';

/*
 * Salida / puesta de sol y duración del día calculadas en el cliente.
 * Algoritmo NOAA (mismo que usa SunCalc, MIT) — no necesita backend ni librerías.
 * Las horas se formatean en la zona horaria Europe/Madrid (Barcelona y Burgos).
 */
const PI = Math.PI;
const rad = PI / 180;
const dayMs = 86400000;
const J1970 = 2440588;
const J2000 = 2451545;
const e = rad * 23.4397; // oblicuidad de la eclíptica

const toJulian = (date) => date.valueOf() / dayMs - 0.5 + J1970;
const fromJulian = (j) => new Date((j + 0.5 - J1970) * dayMs);
const toDays = (date) => toJulian(date) - J2000;

const declination = (l, b) =>
  Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));

const solarMeanAnomaly = (d) => rad * (357.5291 + 0.98560028 * d);

const eclipticLongitude = (M) => {
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const P = rad * 102.9372;
  return M + C + P + PI;
};

const J0 = 0.0009;
const julianCycle = (d, lw) => Math.round(d - J0 - lw / (2 * PI));
const approxTransit = (Ht, lw, n) => J0 + (Ht + lw) / (2 * PI) + n;
const solarTransitJ = (ds, M, L) => J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
const hourAngle = (h, phi, dec) =>
  Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)));

const getSunTimes = (date, lat, lng) => {
  const lw = rad * -lng;
  const phi = rad * lat;
  const d = toDays(date);
  const n = julianCycle(d, lw);
  const ds = approxTransit(0, lw, n);
  const M = solarMeanAnomaly(ds);
  const L = eclipticLongitude(M);
  const dec = declination(L, 0);
  const Jnoon = solarTransitJ(ds, M, L);
  const h0 = -0.833 * rad; // ángulo estándar de salida/puesta (incluye refracción)
  const Jset = solarTransitJ(approxTransit(hourAngle(h0, phi, dec), lw, n), M, L);
  const Jrise = Jnoon - (Jset - Jnoon);
  return { sunrise: fromJulian(Jrise), sunset: fromJulian(Jset) };
};

const fmtHora = (d) =>
  d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });

const SunTimes = ({ lat, lon }) => {
  const { sunrise, sunset } = getSunTimes(new Date(), lat, lon);

  if (!sunrise || !sunset || isNaN(sunrise.getTime()) || isNaN(sunset.getTime())) {
    return null;
  }

  const totalMin = Math.round((sunset - sunrise) / 60000);
  const horas = Math.floor(totalMin / 60);
  const minutos = totalMin % 60;

  const itemStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
  const labelStyle = { fontSize: '0.85rem', color: 'lightblue' };
  const valueStyle = { fontSize: '1.1rem', color: 'azure', fontWeight: 500 };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
        mt: 0.5,
        mb: 1
      }}
    >
      <Box sx={itemStyle}>
        <Typography sx={labelStyle}>🌅 Salida</Typography>
        <Typography sx={valueStyle}>{fmtHora(sunrise)}</Typography>
      </Box>
      <Box sx={itemStyle}>
        <Typography sx={labelStyle}>🌇 Puesta</Typography>
        <Typography sx={valueStyle}>{fmtHora(sunset)}</Typography>
      </Box>
      <Box sx={itemStyle}>
        <Typography sx={labelStyle}>⏱ Duración</Typography>
        <Typography sx={valueStyle}>{horas}h {minutos}min</Typography>
      </Box>
    </Box>
  );
};

export default SunTimes;
