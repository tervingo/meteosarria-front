import React from 'react';
import { Typography, useMediaQuery } from '@mui/material';
import './App.css';

const WindDirectionIndicator = ({ direction, speed, rose }) => {
  const angleInRadians = (direction * Math.PI) / 180;
  const radius = 50; // Radius of the circle
  const circleRadius = 5; // Radius of the inner circle
  const borderwidth = 4; // Width of the border

  const x = radius + radius * Math.sin(angleInRadians) - circleRadius - borderwidth; 
  const y = radius - radius * Math.cos(angleInRadians) - circleRadius - borderwidth;

  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(min-width:601px) and (max-width:960px)');

  const styles = {
    titulo: {
    fontSize: isMobile ? '1rem' : isTablet ? '1.5rem' : '1.5rem',
    color: 'silver',
    marginBottom: '2rem'
    }
  };  
  return (
   
    <div className='wind-direction-container'>
      <Typography style={styles.titulo}>
          Viento
      </Typography>
 
      <div className="wind-direction-indicator">
        <div className="circle">
          <div className="label north">N</div>
          <div className="label east">E</div>
          <div className="label south">S</div>
          <div className="label west">W</div>
          <div 
            className="circle-indicator" 
            style={{
              top: `${y}px`,
              left: `${x}px`,
              width: `${2 * circleRadius}px`, // Set width and height for circle
              height: `${2 * circleRadius}px`,
            }} 
          />
          <div className="center-labels">
            <Typography>
              {speed} km/h
            </Typography>
            <Typography>
              {direction}°
            </Typography>
            <Typography>
              {rose}
            </Typography>           
          </div>
        </div>
      </div>
    </div>
  );
};

export default WindDirectionIndicator;