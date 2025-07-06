import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, LabelList } from 'recharts';
import { BACKEND_URI } from './constants';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    records: null,
    tendenciaAnual: null,
    comparativaAño: null,
    heatmap: null,
    estadisticas: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());
  const [displayMonth, setDisplayMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Llamadas separadas: datos actuales + datos históricos
      const [...dashboardResponses] = await Promise.all([
        axios.get(BACKEND_URI + '/api/live'),  // Datos actuales
        axios.get(BACKEND_URI + '/api/dashboard/records'),
        axios.get(BACKEND_URI + '/api/dashboard/tendencia-anual'),
        axios.get(BACKEND_URI + `/api/dashboard/comparativa-año/${displayYear}`),
        axios.get(BACKEND_URI + '/api/dashboard/heatmap'),
        axios.get(BACKEND_URI + `/api/dashboard/estadisticas/${displayYear}/${displayMonth}`)
      ]);
  
      // Debug: Log responses
      console.log('Dashboard responses:', {
        records: dashboardResponses[1]?.data,
        tendenciaAnual: dashboardResponses[2]?.data,
        comparativaAño: dashboardResponses[3]?.data,
        heatmap: dashboardResponses[4]?.data,
        estadisticas: dashboardResponses[5]?.data
      });
 
      setDashboardData({
        records: dashboardResponses[1].data,
        tendenciaAnual: dashboardResponses[2].data,
        comparativaAño: dashboardResponses[3].data,
        heatmap: dashboardResponses[4].data,
        estadisticas: dashboardResponses[5].data
      });
  
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Error cargando datos del dashboard');
    } finally {
      setLoading(false);
    }
  }, [displayYear, displayMonth]); // Agregadas las dependencias faltantes
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Función separada para cargar solo las estadísticas del mes
  const fetchEstadisticasMes = useCallback(async (year, month) => {
    try {
      setLoadingEstadisticas(true);
      
      const response = await axios.get(BACKEND_URI + `/api/dashboard/estadisticas/${year}/${month}`);
      
      setDashboardData(prev => ({
        ...prev,
        estadisticas: response.data
      }));
      
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

  const getTrendIcon = (tendencia) => {
    switch (tendencia) {
      case 'ascendente': return '📈';
      case 'descendente': return '📉';
      default: return '➡️';
    }
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

  const HeatmapCell = ({ year, month, temp, minTemp, maxTemp }) => {
    const intensity = temp ? (temp - minTemp) / (maxTemp - minTemp) : 0;
    const backgroundColor = temp ? 
      `rgb(${Math.round(255 * intensity)}, ${Math.round(255 * (1 - intensity) * 0.5)}, ${Math.round(255 * (1 - intensity))})` : 
      '#f0f0f0';
    
    return (
      <div 
        className="heatmap-cell" 
        style={{ backgroundColor }}
        title={`${year}-${month}: ${formatTemperature(temp)}`}
      >
        {temp ? Math.round(temp) : ''}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Helmet>
          <title>Estadísticas - Meteo Sarria</title>
        </Helmet>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { records, tendenciaAnual, comparativaAño, heatmap, estadisticas } = dashboardData || {};

  console.log('mes_seleccionado:', estadisticas.mes_seleccionado);

  const franjasDataMax = [
    { rango: '< 0°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_lte_0) || 0, color: '#0066cc' },
    { rango: '< 5°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_lte_5) || 0, color: '#4da6ff' },
    { rango: '< 10°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_lte_10) || 0, color: '#66b3ff' },
    { rango: '< 15°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_lte_15) || 0, color: '#80d0ff' },
    { rango: '< 20°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_lte_20) || 0, color: '#ff6600' },
    { rango: '> 20°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_gt_20) || 0, color: '#ff6600' },
    { rango: '> 25°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_gte_25) || 0, color: '#ff9933' },
    { rango: '> 30°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_gte_30) || 0, color: '#ff6600' },
    { rango: '> 35°C', dias: Number(estadisticas.mes_seleccionado?.dias_max_gte_35) || 0, color: '#ff3300' }
  ];

  const franjasDataMin = [
    { rango: '< 0°C', dias: Number(estadisticas.mes_seleccionado?.dias_min_lte_0) || 0, color: '#0066cc' },
    { rango: '< 5°C', dias: Number(estadisticas.mes_seleccionado?.dias_min_lte_5) || 0, color: '#4da6ff' },
    { rango: '< 10°C', dias: Number(estadisticas.mes_seleccionado?.dias_min_lte_10) || 0, color: '#66b3ff' },
    { rango: '< 15°C', dias: Number(estadisticas.mes_seleccionado?.dias_min_lte_15) || 0, color: '#80d0ff' },
    { rango: '< 20°C', dias: Number(estadisticas.mes_seleccionado?.dias_min_lte_20) || 0, color: '#ff6600' },
    { rango: '> 20°C', dias: Number(estadisticas.mes_seleccionado?.dias_min_gte_20) || 0, color: '#ff9933' },
    { rango: '> 25°C', dias: Number(estadisticas.mes_seleccionado?.dias_min_gte_25) || 0, color: '#ffcc66' },
    { rango: '> 30°C', dias: Number(estadisticas.mes_seleccionado?.dias_min_gte_30) || 0, color: '#ff6600' }
  ];

  console.log('franjasDataMax:', franjasDataMax);
  console.log('franjasDataMin:', franjasDataMin);

  return (
    <div className="dashboard-container">
      <Helmet>
        <title>Estadísticas Históricas - Meteo Sarria</title>
        <meta name="description" content="Estadísticas meteorológicas históricas de Sarria desde 2009" />
      </Helmet>

      {/* Header */}
      <header className="dashboard-header">
        <Link to="/" className="back-link">← Volver</Link>
        <div className="header-content">
          <h1>📊 Estadísticas Históricas  (en construcción)</h1>
          <p>Datos meteorológicos de Sarria • 2009-{new Date().getFullYear()}</p>
        </div>
      </header>

      {/* Resumen Actual */}
      <section className="dashboard-section">
        <h2>🌡️ Valores Extremos (2009-2025)</h2>
        <div className="metrics-grid">
          <MetricCard
            title="Máxima más alta histórica"
            value={formatTemperature(records?.maxima_masalta_historica?.valor)}
            subtitle={formatDate(records?.maxima_masalta_historica?.fecha)}
            icon="🔥"
            color={getTemperatureColor(records?.maxima_masalta_historica?.valor)}
          />
          <MetricCard
            title="Máxima más baja histórica"
            value={formatTemperature(records?.maxima_masbaja_historica?.valor)}
            subtitle={formatDate(records?.maxima_masbaja_historica?.fecha)}
            icon="🌡️"
            color={getTemperatureColor(records?.maxima_masbaja_historica?.valor)}
          />
          <MetricCard
            title="Mínima más baja histórica"
            value={formatTemperature(records?.minima_masbaja_historica?.valor)}
            subtitle={formatDate(records?.minima_masbaja_historica?.fecha)}
            icon="🧊"
            color="#2563eb"
          />
          <MetricCard
            title="Mínima más alta histórica"
            value={formatTemperature(records?.minima_masalta_historica?.valor)}
            subtitle={formatDate(records?.minima_masalta_historica?.fecha)}
            icon="🧊"
            color="#2563eb"
          />

        </div>
      </section>

      {/* Estadísticas Destacadas */}
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
              {Array.from({length: Math.max(0, new Date().getFullYear() - 2009 + 1)}, (_, i) => 2009 + i)
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
        
        {estadisticas && estadisticas.mes_seleccionado && estadisticas.rachas && (
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
        </div>
      )}
    </section>

      {/* Tendencia Anual */}
      <section className="dashboard-section">
        <h2>📈 Evolución Anual de Temperaturas</h2>
        {tendenciaAnual && (
          <div className="chart-container">
            <div className="chart-info">
              <p>
                {getTrendIcon(tendenciaAnual.tendencia)} 
                Tendencia: <strong>{tendenciaAnual.tendencia}</strong>
                {tendenciaAnual.incremento_decada !== 0 && (
                  <span> ({tendenciaAnual.incremento_decada > 0 ? '+' : ''}{tendenciaAnual.incremento_decada}°C por década)</span>
                )}
              </p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={(tendenciaAnual?.años || []).map((año, idx) => ({
                año,
                media: tendenciaAnual?.temperaturas_medias?.[idx],
                maxima: tendenciaAnual?.temperaturas_maximas?.[idx],
                minima: tendenciaAnual?.temperaturas_minimas?.[idx]
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="año" />
                <YAxis label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value, name) => [`${value}°C`, 
                    name === 'media' ? 'Media' : name === 'maxima' ? 'Máxima' : 'Mínima'
                  ]}
                  labelFormatter={(año) => `Año ${año}`}
                />
                <Area type="monotone" dataKey="maxima" stackId="1" stroke="#ff6b6b" fill="#ffebee" />
                <Area type="monotone" dataKey="minima" stackId="2" stroke="#42a5f5" fill="#e3f2fd" />
                <Line type="monotone" dataKey="media" stroke="#2e7d32" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Comparativa Año Actual */}
      <section className="dashboard-section">
        <h2>📅 {selectedYear} vs Promedio Histórico</h2>
        <div className="year-selector">
          <label>Año a comparar: </label>
          <select 
            value={displayYear} 
            onChange={(e) => {
              setDisplayYear(parseInt(e.target.value));
              // Actualizar comparativa cuando cambie el año
              fetchDashboardData();
            }}
          >
            {Array.from({length: Math.max(0, new Date().getFullYear() - 2009 + 1)}, (_, i) => 2009 + i)
              .reverse()
              .map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
          </select>
        </div>
        
        {comparativaAño && (
                      <ResponsiveContainer width="100%" height={350}>
              <BarChart data={(comparativaAño?.meses || []).map((mes, idx) => ({
                mes,
                actual: comparativaAño?.año_actual?.[idx],
                historico: comparativaAño?.promedio_historico?.[idx],
                diferencia: comparativaAño?.diferencias?.[idx]
              }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value, name) => [
                  value !== null ? `${value}°C` : 'N/A', 
                  name === 'actual' ? `${displayYear}` : 'Promedio histórico'
                ]}
              />
              <Bar dataKey="historico" fill="#94a3b8" name="historico" />
              <Bar dataKey="actual" fill="#3b82f6" name="actual" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Mapa de Calor */}
      <section className="dashboard-section">
        <h2>🗓️ Mapa de Calor Mensual (Últimos 6 años)</h2>
        {heatmap && (
          <div className="heatmap-container">
            <div className="heatmap-grid">
              <div className="heatmap-header">
                <div></div>
                {(['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] || []).map(mes => (
                  <div key={mes} className="month-label">{mes}</div>
                ))}
              </div>
              {(heatmap?.años || []).map(año => (
                <div key={año} className="heatmap-row">
                  <div className="year-label">{año}</div>
                  {Array.from({length: 12}, (_, mes) => {
                    const data = heatmap?.data?.find(d => d.año === año && d.mes === mes + 1);
                    return (
                      <HeatmapCell
                        key={`${año}-${mes}`}
                        year={año}
                        month={mes + 1}
                        temp={data?.temperatura}
                        minTemp={heatmap?.rango_temperaturas?.min}
                        maxTemp={heatmap?.rango_temperaturas?.max}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="heatmap-legend">
              <span>Frío</span>
              <div className="legend-gradient"></div>
              <span>Calor</span>
            </div>
          </div>
        )}
      </section>



      {/* Footer */}
      <footer className="dashboard-footer">
        <p>Datos históricos desde abril 2009 • Actualizado cada 30 minutos</p>
        <Link to="/" className="home-link">🏠 Volver al inicio</Link>
      </footer>
    </div>
  );
};

export default Dashboard;