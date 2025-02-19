const Rain = ({ rainRate, totalRain }) => {
    totalRain = totalRain + 60;
    const rateHeight = Math.min((rainRate / 50) * 100, 100);
    const totalHeight = Math.min((totalRain / 700) * 100, 100);
  
    return (
      <div className="flex flex-col items-center">
        {/* Removemos el mb-5 del título y usamos un margen más pequeño */}
        <div className="flex flex-row items-end space-x-4">
          {/* Resto del código igual */}
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-48 border border-white">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-300"
                style={{ height: `${rateHeight}%` }}
              />
            </div>
            <div className="text-sm mt-2 text-white">
              <p>Litros/hora</p>
              {rainRate.toFixed(1)} mm/h
            </div>
          </div>
  
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-48 border border-white">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-300"
                style={{ height: `${totalHeight}%` }}
              />
            </div>
            <div className="text-sm mt-2 text-white">
              <p>Total año</p>
              {totalRain.toFixed(1)} mm
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default Rain;