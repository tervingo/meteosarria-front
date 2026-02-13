import React from 'react';
import PropTypes from 'prop-types';

const RainBar = ({ 
  label,           
  value,           
  maxValue,        
  barWidth = 12,   
  isLoading = false,
  referenceValue = null,
  referenceLabel = null
}) => {
  // Calcular el porcentaje de altura de la barra
  const barHeight = value ? (value / maxValue) * 100 : 0;
  
  // Calcular el porcentaje de altura de la línea de referencia
  const referenceHeight = referenceValue ? (referenceValue / maxValue) * 100 : 0;
  
  // Formatear el valor para mostrar
  const formattedValue = value !== undefined && !isLoading 
    ? `${value.toFixed(1)} mm` 
    : 'Cargando...';

  // Mapeo de anchos a clases específicas de Tailwind
  const widthClasses = {
    12: 'w-12',
    16: 'w-16',
    20: 'w-20',
    24: 'w-24',
    32: 'w-32'
  };

  // Obtener la clase de ancho correcta o usar un valor por defecto
  const widthClass = widthClasses[barWidth] || 'w-12';

  return (
    <div className="flex flex-col items-center">
      {/* Etiqueta superior */}
      <p className="text-sm mb-2 text-white">
        {label}
      </p>

      {/* Contenedor de la barra */}
      <div className={`relative ${widthClass} h-48 border border-white`}>
        {/* Etiqueta del valor máximo */}
        <div className="absolute -right-14 top-0 text-xs text-gray-400">
          {maxValue} mm
        </div>

        {/* Línea de referencia 2025 (si existe) */}
        {referenceValue !== null && referenceValue !== undefined && (
          <>
            <div 
              className="absolute left-0 right-0 border-t-2 border-blue-300 transition-all duration-300"
              style={{ 
                bottom: `${referenceHeight}%`,
                borderColor: '#60A5FA'
              }}
            />
            {/* Etiqueta de la línea de referencia */}
            <div 
              className="absolute text-xs text-blue-300 whitespace-nowrap"
              style={{ 
                bottom: `${referenceHeight}%`,
                left: '100%',
                marginLeft: '8px',
                transform: 'translateY(50%)'
              }}
            >
              {referenceLabel || '2025'}: {referenceValue.toFixed(1)} mm
            </div>
          </>
        )}

        {/* Barra de lluvia */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-300"
          style={{ 
            height: `${barHeight}%`,
            backgroundColor: barHeight > 0 ? '#3B82F6' : 'transparent'
          }}
        />
      </div>

      {/* Valor actual */}
      <div className="text-base mt-2 text-white">
        {formattedValue}
      </div>
    </div>
  );
};

// Validación de PropTypes
RainBar.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  maxValue: PropTypes.number.isRequired,
  barWidth: PropTypes.number,
  isLoading: PropTypes.bool,
  referenceValue: PropTypes.number,
  referenceLabel: PropTypes.string
};

// Valores por defecto
RainBar.defaultProps = {
  barWidth: 12,
  isLoading: false
};

export default RainBar;
