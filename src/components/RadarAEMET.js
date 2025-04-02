// src/components/RadarAemet.js

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, ImageOverlay } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import styled from 'styled-components';
import { BACKEND_URI } from '../constants';

// Estilos para los componentes
const RadarContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const ControlPanel = styled.div`
  background-color: #f5f5f5;
  padding: 15px;
  border-bottom: 1px solid #ddd;
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Button = styled.button`
  background-color: #0078a8;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #005d85;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  margin-left: 10px;
  color: ${props => props.error ? '#d32f2f' : '#666'};
`;

const InfoPanel = styled.div`
  padding: 10px 15px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const MapWrapper = styled.div`
  flex-grow: 1;
  height: 600px;
  width: 100%;
  background-color: #f5f5f5;
  
  .leaflet-container {
    height: 100%;
    width: 100%;
    background-color: #e0e0e0;
  }
`;

const Timestamp = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 5px;
`;

// Componente principal
const RadarAemet = () => {
  // Estados para gestionar los datos y la UI
  const [radarUrl, setRadarUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  
  // Coordenadas ajustadas para la península
  const peninsulaBounds = [
    [35.9, -9.9],  // Esquina suroeste
    [43.9, 4.3]    // Esquina noreste
  ];
  
  // Referencia al intervalo de actualización automática
  const updateIntervalRef = useRef(null);
  
  // Función para cargar la imagen del radar
  const fetchRadarData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${BACKEND_URI}/api/radar/peninsula`);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      // Actualizar la URL de la imagen y el timestamp
      if (response.data.url) {
        setRadarUrl(response.data.url);
      } else if (response.data.datos && response.data.datos.url) {
        setRadarUrl(response.data.datos.url);
      } else {
        throw new Error('Formato de respuesta inesperado');
      }
      
      setTimestamp(response.data.timestamp || new Date().toISOString());
      
    } catch (err) {
      console.error('Error al cargar datos del radar:', err);
      setError(`Error: ${err.message || 'No se pudieron cargar los datos del radar'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar datos iniciales cuando el componente se monta
  useEffect(() => {
    fetchRadarData();
    
    // Configurar actualización automática cada 10 minutos
    updateIntervalRef.current = setInterval(fetchRadarData, 10 * 60 * 1000);
    
    // Limpiar al desmontar
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);
  
  // Formatear timestamp para mostrar
  const formatTimestamp = (isoString) => {
    if (!isoString) return '--';
    
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <RadarContainer>
      <ControlPanel>
        <Button 
          onClick={fetchRadarData} 
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Actualizar Radar'}
        </Button>
        
        {error && <StatusMessage error>{error}</StatusMessage>}
      </ControlPanel>
      
      <InfoPanel>
        <h3>Radar Meteorológico AEMET - Península Ibérica</h3>
        <p>Visualización de datos del radar meteorológico de la Agencia Estatal de Meteorología.</p>
        <Timestamp>
          Última actualización: {formatTimestamp(timestamp)}
        </Timestamp>
      </InfoPanel>
      
      <MapWrapper>
        <MapContainer 
          center={[39.9, -2.8]} 
          zoom={6.2} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          minZoom={5}
          maxZoom={8}
        >
          {radarUrl && (
            <ImageOverlay
              url={radarUrl}
              bounds={peninsulaBounds}
              opacity={0.5}
              zIndex={10}
            />
          )}
        </MapContainer>
      </MapWrapper>
    </RadarContainer>
  );
};

export default RadarAemet;