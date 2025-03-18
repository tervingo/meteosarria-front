import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Snackbar } from '@mui/material';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Comprobar si ya se ha aceptado previamente
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setOpen(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        position: 'fixed',
        bottom: '24px !important',
        left: '50% !important',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '600px',
        '& .MuiSnackbarContent-root': {
          width: '100%',
          backgroundColor: 'transparent',
          padding: 0,
          minWidth: 'auto',
        }
      }}
    >
      <Box
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: 3,
          borderRadius: 1,
          width: '100%',
          margin: '0 16px',
          boxSizing: 'border-box',
        }}
      >
        <Typography variant="body2" sx={{ mb: 2 }}>
          Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. 
          Al continuar navegando, aceptas nuestra{' '}
          <Link to="/politica-cookies" style={{ color: '#4CAF50', textDecoration: 'underline' }}>
            política de cookies
          </Link>.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={handleReject}
          >
            Rechazar
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleAccept}
          >
            Aceptar
          </Button>
        </Box>
      </Box>
    </Snackbar>
  );
};

export default CookieConsent; 