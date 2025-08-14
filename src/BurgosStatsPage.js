import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, LabelList, ReferenceArea, Legend } from 'recharts';
import { BACKEND_URI } from './constants';
import './Dashboard.css';


const BurgosStatsPage = () => {
  const [burgosData, setBurgosData] = useState({
    recordsAbsolutos: null,
    recordsPorDecada: null,
    tempMediaPorDecada: null,
    diasCalurososAnual: null,
    diasTorridosAnual: null,
    rachasCalurosasAnual: null,
    rachasTorridasAnual: null,
    nochesTropicalesAnual: null,
    estadisticas: null
  });
  const [lastRecordDate, setLastRecordDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());
  const [displayMonth, setDisplayMonth] = useState(new Date().getMonth() + 1);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  const [datosDiarios, setDatosDiarios] = useState(null);

  const fetchBurgosData = useCallback(async () => {
    try {
      setLoading(true);
      
      const responses = await Promise.all([
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/records-absolutos'),
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/records-por-decada'),
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/temperatura-media-decada'),
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/dias-calurosos-anual'),
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/dias-torridos-anual'),
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/rachas-calurosas-anual'),
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/rachas-torridas-anual'),
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/noches-tropicales-anual'),
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/ultimo-registro'),
        axios.get(BACKEND_URI + `/api/burgos-estadisticas/estadisticas/${displayYear}/${displayMonth}`)
      ]);

      setBurgosData({
        recordsAbsolutos: responses[0].data,
        recordsPorDecada: responses[1].data,
        tempMediaPorDecada: responses[2].data,
        diasCalurososAnual: responses[3].data,
        diasTorridosAnual: responses[4].data,
        rachasCalurosasAnual: responses[5].data,
        rachasTorridasAnual: responses[6].data,
        nochesTropicalesAnual: responses[7].data,
        estadisticas: responses[9].data
      });

      setLastRecordDate(responses[8].data.ultimaFecha);
      console.log('Última Fecha BD', responses[8].data.ultimaFecha);
      setError(null);
    } catch (error) {
      console.error('Error fetching Burgos data:', error);
      setError('Error cargando datos de Burgos');
    } finally {
      setLoading(false);
    }
  }, [displayYear, displayMonth]);

  useEffect(() => {
    fetchBurgosData();
  }, [fetchBurgosData]);

  // Cargar datos diarios del mes actual al montar el componente
  useEffect(() => {
    const loadInitialDatosDiarios = async () => {
      try {
        const response = await axios.get(BACKEND_URI + `/api/burgos-estadisticas/estadisticas-datos-diarios/${displayYear}/${displayMonth}`);
        setDatosDiarios(response.data);
      } catch (error) {
        console.error('Error loading initial datos diarios:', error);
      }
    };

    loadInitialDatosDiarios();
  }, [displayYear, displayMonth]);

  // Función separada para cargar solo las estadísticas del mes
  const fetchEstadisticasMes = useCallback(async (year, month) => {
    try {
      setLoadingEstadisticas(true);
      
      // Cargar estadísticas y datos diarios en paralelo
      const [estadisticasResponse, datosDiariosResponse] = await Promise.all([
        axios.get(BACKEND_URI + `/api/burgos-estadisticas/estadisticas/${year}/${month}`),
        axios.get(BACKEND_URI + `/api/burgos-estadisticas/estadisticas-datos-diarios/${year}/${month}`)
      ]);
      
      console.log('Estadisticas response:', estadisticasResponse.data);
      console.log('Datos diarios response:', datosDiariosResponse.data);
      
      setBurgosData(prev => ({
        ...prev,
        estadisticas: estadisticasResponse.data
      }));
      
      setDatosDiarios(datosDiariosResponse.data);
      
    } catch (error) {
      console.error('Error fetching estadisticas:', error);
    } finally {
      setLoadingEstadisticas(false);
    }
  }, []);

  const formatTemperature = (temp) => {
    return temp !== null ? `${temp}°C` : 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatDateDDMMYYYY = (dateString) => {
    if (!dateString) return new Date().getFullYear();
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getTemperatureColor = (temp) => {
    if (temp === null) return '#999';
    if (temp < 0) return '#0066cc';
    if (temp < 10) return '#4da6ff';
    if (temp < 20) return '#66b3ff';
    if (temp < 25) return '#80d0ff';
    if (temp < 30) return '#ffcc66';
    if (temp < 35) return '#ff9933';
    return '#ff3300';
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const MetricCard = ({ title, value, subtitle, icon, color = '#2563eb' }) => (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-icon">{icon}</span>
        <h3 className="metric-title">{title}</h3>
      </div>
      <div className="metric-value" style={{ color }}>
        {value}
      </div>
      {subtitle && (
        <div className="metric-subtitle">
          {subtitle}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <Helmet>
          <title>Estadísticas de Burgos - Meteo Sarria</title>
        </Helmet>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando estadísticas de Burgos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchBurgosData} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { recordsAbsolutos, recordsPorDecada, tempMediaPorDecada, diasCalurososAnual, diasTorridosAnual, rachasCalurosasAnual, rachasTorridasAnual, nochesTropicalesAnual, estadisticas } = burgosData;

  const franjasDataMax = estadisticas?.mes_seleccionado ? [
    { rango: '< 0°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_lte_0) || 0, color: '#0066cc' },
    { rango: '< 5°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_lte_5) || 0, color: '#4da6ff' },
    { rango: '< 10°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_lte_10) || 0, color: '#66b3ff' },
    { rango: '< 15°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_lte_15) || 0, color: '#80d0ff' },
    { rango: '< 20°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_lte_20) || 0, color: '#ff6600' },
    { rango: '> 20°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_gt_20) || 0, color: '#ff6600' },
    { rango: '> 25°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_gte_25) || 0, color: '#ff9933' },
    { rango: '> 30°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_gte_30) || 0, color: '#ff6600' },
    { rango: '> 35°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_gte_35) || 0, color: '#ff3300' }
  ] : [];

  const franjasDataMin = estadisticas?.mes_seleccionado ? [
    { rango: '< 0°C', dias: Number(estadisticas.mes_seleccionado?.dias_min_lte_0) || 0, color: '#0066cc' },
    { rango: '< 5°C', dias: Number(estadisticas.mes_seleccionado?.dias_min_lte_5) || 0, color: '#4da6ff' },
    { rango: '< 10°C', dias: Number(estadisticas.mes_seleccionado?.dias_min_lte_10) || 0, color: '#66b3ff' },
    { rango: '< 15°C', dias: Number(estadisticas.mes_seleccionado?.dias_min_lte_15) || 0, color: '#80d0ff' },
    { rango: '< 20°C', dias: Number(estadisticas.mes_seleccionado?.dias_min_lte_20) || 0, color: '#ff6600' },
    { rango: '> 20°C', dias: Number(estadisticas.mes_seleccionado?.dias_min_gte_20) || 0, color: '#ff9933' },
    { rango: '> 25°C', dias: Number(estadisticas.mes_seleccionado?.dias_min_gte_25) || 0, color: '#ffcc66' },
    { rango: '> 30°C', dias: Number(estadisticas.mes_seleccionado?.dias_min_gte_30) || 0, color: '#ff6600' }
  ] : [];

  return (
    <div className="dashboard-container">
      <Helmet>
        <title>Estadísticas Históricas de Burgos - Meteo Sarria</title>
        <meta name="description" content="Estadísticas meteorológicas históricas de Burgos (Villafría) desde 1970" />
      </Helmet>

      {/* Header */}
      <header className="dashboard-header">
        <Link to="/" className="back-link">← Volver</Link>
        <div className="header-content">
          <h1>📊 Estadísticas de Burgos (Villafría)</h1>
          <p>Datos meteorológicos históricos - 1 ene 1970 - {formatDateDDMMYYYY(lastRecordDate)}</p>
        </div>
      </header>

      {/* Récords Absolutos */}
      <section className="dashboard-section">
        <h2>🌡️ Valores Extremos Absolutos (1970-2025)</h2>
        {recordsAbsolutos && (
          <div className="metrics-grid">
            <MetricCard
              title="Temperatura máxima absoluta"
              value={formatTemperature(recordsAbsolutos.temp_max_absoluta?.valor)}
              subtitle={formatDate(recordsAbsolutos.temp_max_absoluta?.fecha)}
              icon="🔥"
              color={getTemperatureColor(recordsAbsolutos.temp_max_absoluta?.valor)}
            />
            <MetricCard
              title="Temperatura mínima absoluta"
              value={formatTemperature(recordsAbsolutos.temp_min_absoluta?.valor)}
              subtitle={formatDate(recordsAbsolutos.temp_min_absoluta?.fecha)}
              icon="🧊"
              color="#2563eb"
            />
            <MetricCard
              title="Temperatura mínima más alta"
              value={formatTemperature(recordsAbsolutos.temp_min_mas_alta?.valor)}
              subtitle={formatDate(recordsAbsolutos.temp_min_mas_alta?.fecha)}
              icon="🌡️"
              color={getTemperatureColor(recordsAbsolutos.temp_min_mas_alta?.valor)}
            />
            <MetricCard
              title="Temperatura máxima más baja"
              value={formatTemperature(recordsAbsolutos.temp_max_mas_baja?.valor)}
              subtitle={formatDate(recordsAbsolutos.temp_max_mas_baja?.fecha)}
              icon="❄️"
              color={getTemperatureColor(recordsAbsolutos.temp_max_mas_baja?.valor)}
            />
          </div>
        )}
      </section>

      {/* Estadísticas del Mes */}
      <section className="dashboard-section">
        <h2>🏆 Estadísticas del Mes</h2>
        
        {/* Selectores de año y mes */}
        <div className="month-selector" style={{ 
          display: 'flex', 
          gap: '16px', 
          alignItems: 'center', 
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: '500', color: '#374151' }}>Año:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                fontSize: '14px',
                minWidth: '100px'
              }}
            >
              {Array.from({length: Math.max(0, new Date().getFullYear() - 1970 + 1)}, (_, i) => 1970 + i)
                .reverse()
                .map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: '500', color: '#374151' }}>Mes:</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                fontSize: '14px',
                minWidth: '140px'
              }}
            >
              {monthNames.map((month, index) => (
                <option key={index + 1} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={() => {
              setDisplayYear(selectedYear);
              setDisplayMonth(selectedMonth);
              fetchEstadisticasMes(selectedYear, selectedMonth);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            disabled={loadingEstadisticas}
          >
            {loadingEstadisticas ? 'Cargando...' : 'Ver'}
          </button>
        </div>
        
        {estadisticas && estadisticas.mes_seleccionado && (
        <div className="stats-grid">
          {loadingEstadisticas && (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '20px',
              color: '#6b7280'
            }}>
              <div className="loading-spinner" style={{ margin: '0 auto 10px' }}></div>
              <p>Cargando estadísticas del mes...</p>
            </div>
          )}
          <div className="stat-group">
            <h3>{estadisticas.mes_seleccionado?.nombre_mes || 'N/A'} {estadisticas.mes_seleccionado?.año || 'N/A'}</h3>
            <div className="stat-items">
              <div className="stat-item">
                <span className="stat-label">Temp. máxima:</span>
                <span className="stat-value">{formatTemperature(estadisticas.mes_seleccionado?.temperatura_maxima)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Temp. mínima:</span>
                <span className="stat-value">{formatTemperature(estadisticas.mes_seleccionado?.temperatura_minima)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Temp. media:</span>
                <span className="stat-value">{formatTemperature(estadisticas.mes_seleccionado?.temperatura_media)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Noches tropicales (Tmin &gt; 20º):</span>
                <span className="stat-value">{estadisticas.mes_seleccionado?.dias_min_gte_20 || 0} días</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Noches tórridas (Tmin &gt; 25º):</span>
                <span className="stat-value">{estadisticas.mes_seleccionado?.dias_min_gte_25 || 0} días</span>
              </div>
              {estadisticas.mes_seleccionado?.record_mes && (
                <div className="stat-item record">
                  <span className="stat-label">🏆 Récord mensual!</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="stat-group">
            <h3>Franjas de temperatura máxima</h3>
            <div className="temperature-chart-container" style={{ height: '400px', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={franjasDataMax}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="rango" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <YAxis 
                    label={{ value: 'Número de días', angle: -90, position: 'insideLeft' }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} días`, 'Días']}
                    labelFormatter={(rango) => `Rango: ${rango}`}
                  />
                  <Bar dataKey="dias" barSize={40}>
                    {franjasDataMax.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <LabelList 
                      dataKey="dias" 
                      position="top" 
                      style={{ fontSize: '12px', fill: '#374151', fontWeight: 'bold' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="stat-group">
            <h3>Franjas de temperatura mínima</h3>
            <div className="temperature-chart-container" style={{ height: '400px', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={franjasDataMin}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="rango" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <YAxis 
                    label={{ value: 'Número de días', angle: -90, position: 'insideLeft' }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} días`, 'Días']}
                    labelFormatter={(rango) => `Rango: ${rango}`}
                  />
                  <Bar dataKey="dias" barSize={40}>
                    {franjasDataMin.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <LabelList 
                      dataKey="dias" 
                      position="top" 
                      style={{ fontSize: '12px', fill: '#374151', fontWeight: 'bold' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Gráfica de temperaturas diarias */}
          {datosDiarios?.datos_diarios?.length > 0 && (
            <div
              className="stat-group"
              style={{ gridColumn: '1 / -1', width: '100%' }}
            >
              <h3>Temperaturas diarias - {datosDiarios.nombre_mes} {datosDiarios.año}</h3>
              <div className="temperature-chart-container" style={{ height: '400px', width: '100%', marginTop: '16px' }}>
                <ResponsiveContainer width="90%" height="100%">
                  <LineChart
                    data={datosDiarios.datos_diarios}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    {/* Franjas de temperatura de fondo */}
                    {[
                      { start: -5, end: 0, color: '#0066cc' },
                      { start: 0, end: 5, color: '#4da6ff' },
                      { start: 5, end: 10, color: '#66b3ff' },
                      { start: 10, end: 15, color: '#80d0ff' },
                      { start: 15, end: 20, color: '#ffcc66' },
                      { start: 20, end: 25, color: '#ff9933' },
                      { start: 25, end: 30, color: '#ff6600' },
                      { start: 30, end: 35, color: '#ff3300' },
                      { start: 35, end: 40, color: '#ff0000' }
                    ].map((range) => (
                      <ReferenceArea
                        key={`${range.start}-${range.end}`}
                        y1={range.start}
                        y2={range.end}
                        fill={range.color}
                        fillOpacity={0.3}
                      />
                    ))}
                    
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="dia" 
                      label={{ value: 'Día del mes', position: 'insideBottom', offset: -10 }}
                      tick={{ fontSize: 12 }}
                      interval={0}
                    />
                    <YAxis 
                      label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 12 }}
                      ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40]}
                      domain={[0, 40]}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value}°C`, 
                        name === 'maxima' ? 'Máxima' : name === 'minima' ? 'Mínima' : 'Media'
                      ]}
                      labelFormatter={(dia) => `Día ${dia}`}
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid #999',
                        borderRadius: '2px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="maxima"
                      name="Máxima"
                      stroke="#ff6b6b"
                      strokeWidth={2}
                      dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 2 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="minima"
                      name="Mínima"
                      stroke="#42a5f5"
                      strokeWidth={2}
                      dot={{ fill: '#42a5f5', strokeWidth: 2, r: 2 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="media"
                      name="Media"
                      stroke="#2e7d32"
                      strokeWidth={3}
                      dot={{ fill: '#2e7d32', strokeWidth: 2, r: 2 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </section>

      {/* Récords por Década */}
      <section className="dashboard-section">
        <h2>📅 Valores Extremos por Década</h2>
        {recordsPorDecada && recordsPorDecada.length > 0 && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={recordsPorDecada.map(decada => ({
                decada: `${decada.decada}s`,
                temp_max: decada.temp_max,
                temp_min: decada.temp_min,
                fecha_max: decada.fecha_max,
                fecha_min: decada.fecha_min
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="decada" />
                <YAxis 
                  label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip 
                  formatter={(value, name, props) => {
                    const isMax = name === 'temp_max';
                    const fecha = isMax ? props.payload.fecha_max : props.payload.fecha_min;
                    return [
                      `${value}°C`, 
                      isMax ? 'Temperatura Máxima' : 'Temperatura Mínima',
                      fecha ? ` (${formatDate(fecha)})` : ''
                    ];
                  }}
                  labelFormatter={(decada) => `Década ${decada}`}
                />
                <Bar dataKey="temp_max" fill="#ff6b6b" name="temp_max" />
                <Bar dataKey="temp_min" fill="#42a5f5" name="temp_min" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Temperatura Media por Década */}
      <section className="dashboard-section">
        <h2>📈 Temperatura Media por Década</h2>
        {tempMediaPorDecada && tempMediaPorDecada.length > 0 && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={tempMediaPorDecada}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="decada" />
                <YAxis 
                  label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip 
                  formatter={(value) => [`${value}°C`, 'Temperatura Media']}
                />
                <Bar dataKey="temp_media" barSize={60}>
                  {tempMediaPorDecada.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getTemperatureColor(entry.temp_media)} />
                  ))}
                  <LabelList 
                    dataKey="temp_media" 
                    position="top" 
                    style={{ fontSize: '12px', fill: '#374151', fontWeight: 'bold' }}
                    formatter={(value) => `${value}°C`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Días Calurosos por Año */}
      <section className="dashboard-section">
        <h2>🔥 Días con Temperatura Máxima > 30°C por Año</h2>
        {diasCalurososAnual && diasCalurososAnual.length > 0 && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={diasCalurososAnual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="año" />
                <YAxis 
                  label={{ value: 'Número de días', angle: -90, position: 'insideLeft' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value) => [`${value} días`, 'Días > 30°C']}
                  labelFormatter={(año) => `Año ${año}`}
                />
                <Line
                  type="monotone"
                  dataKey="dias_max_gt_30"
                  stroke="#ff6b6b"
                  strokeWidth={2}
                  dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Días Tórridos por Año */}
      <section className="dashboard-section">
        <h2>🌡️ Días con Temperatura Máxima > 35°C por Año</h2>
        {diasTorridosAnual && diasTorridosAnual.length > 0 && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={diasTorridosAnual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="año" />
                <YAxis 
                  label={{ value: 'Número de días', angle: -90, position: 'insideLeft' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value) => [`${value} días`, 'Días > 35°C']}
                  labelFormatter={(año) => `Año ${año}`}
                />
                <Line
                  type="monotone"
                  dataKey="dias_max_gt_35"
                  stroke="#ff3300"
                  strokeWidth={2}
                  dot={{ fill: '#ff3300', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Rachas Calurosas por Año */}
      <section className="dashboard-section">
        <h2>🔥 Días Consecutivos con Temp Máx > 30°C por Año</h2>
        {rachasCalurosasAnual && rachasCalurosasAnual.length > 0 && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={rachasCalurosasAnual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="año" />
                <YAxis 
                  label={{ value: 'Días consecutivos', angle: -90, position: 'insideLeft' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value) => [`${value} días`, 'Racha > 30°C']}
                  labelFormatter={(año) => `Año ${año}`}
                />
                <Line
                  type="monotone"
                  dataKey="racha_max_gt_30"
                  stroke="#ff9933"
                  strokeWidth={2}
                  dot={{ fill: '#ff9933', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Rachas Tórridas por Año */}
      <section className="dashboard-section">
        <h2>🌡️ Días Consecutivos con Temp Máx > 35°C por Año</h2>
        {rachasTorridasAnual && rachasTorridasAnual.length > 0 && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={rachasTorridasAnual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="año" />
                <YAxis 
                  label={{ value: 'Días consecutivos', angle: -90, position: 'insideLeft' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value) => [`${value} días`, 'Racha > 35°C']}
                  labelFormatter={(año) => `Año ${año}`}
                />
                <Line
                  type="monotone"
                  dataKey="racha_max_gt_35"
                  stroke="#ff0000"
                  strokeWidth={2}
                  dot={{ fill: '#ff0000', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Noches Tropicales por Año */}
      <section className="dashboard-section">
        <h2>🌙 Noches con Temperatura Mínima > 20°C por Año</h2>
        {nochesTropicalesAnual && nochesTropicalesAnual.length > 0 && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={nochesTropicalesAnual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="año" />
                <YAxis 
                  label={{ value: 'Número de noches', angle: -90, position: 'insideLeft' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value) => [`${value} noches`, 'Noches > 20°C']}
                  labelFormatter={(año) => `Año ${año}`}
                />
                <Line
                  type="monotone"
                  dataKey="noches_min_gt_20"
                  stroke="#ff6600"
                  strokeWidth={2}
                  dot={{ fill: '#ff6600', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>Datos históricos de Burgos (Villafría) desde 1970 • Fuente: AEMET</p>
        <Link to="/" className="home-link">🏠 Volver al inicio</Link>
      </footer>
    </div>
  );
};

export default BurgosStatsPage;