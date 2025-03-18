import React from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CookiePolicy = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, position: 'relative' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ 
            position: 'absolute',
            top: 16,
            right: 16,
          }}
        >
          Volver
        </Button>

        <Typography variant="h4" component="h1" gutterBottom>
          Política de Cookies
        </Typography>

        <Typography variant="body1" paragraph>
          En meteosarria.com, utilizamos cookies para mejorar tu experiencia de navegación. 
          Esta política de cookies te ayudará a entender qué son las cookies, cómo las utilizamos 
          y cómo puedes gestionarlas.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          ¿Qué son las cookies?
        </Typography>
        <Typography variant="body1" paragraph>
          Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando 
          visitas nuestro sitio web. Estas cookies nos ayudan a hacer que nuestro sitio web 
          funcione correctamente y a mejorar nuestros servicios.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Tipos de cookies que utilizamos
        </Typography>
        <Typography variant="body1" paragraph>
          En meteosarria.com utilizamos los siguientes tipos de cookies:
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Typography component="li" paragraph>
            <strong>Cookies técnicas:</strong> Son necesarias para el funcionamiento del sitio web 
            y no pueden ser desactivadas. Incluyen, por ejemplo, las cookies que permiten 
            recordar tu preferencia de consentimiento de cookies.
          </Typography>
          <Typography component="li" paragraph>
            <strong>Cookies de análisis:</strong> Nos ayudan a entender cómo los visitantes 
            interactúan con nuestro sitio web, recopilando información de forma anónima.
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          ¿Cómo gestionar las cookies?
        </Typography>
        <Typography variant="body1" paragraph>
          Puedes gestionar y eliminar las cookies en cualquier momento. Ten en cuenta que 
          al desactivar las cookies, algunas funciones de nuestro sitio web podrían no 
          funcionar correctamente.
        </Typography>

        <Typography variant="body1" paragraph>
          Para eliminar las cookies de tu navegador, puedes seguir estas instrucciones:
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Typography component="li" paragraph>
            <strong>Chrome:</strong> Configuración → Privacidad y seguridad → Eliminar datos de navegación
          </Typography>
          <Typography component="li" paragraph>
            <strong>Firefox:</strong> Opciones → Privacidad y Seguridad → Cookies y datos del sitio
          </Typography>
          <Typography component="li" paragraph>
            <strong>Safari:</strong> Preferencias → Privacidad → Gestionar datos del sitio web
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Actualizaciones de la política
        </Typography>
        <Typography variant="body1" paragraph>
          Nos reservamos el derecho de modificar esta política de cookies en cualquier momento. 
          Cualquier cambio será publicado en esta página.
        </Typography>

        <Typography variant="body1" paragraph sx={{ mt: 4 }}>
          Si tienes alguna pregunta sobre nuestra política de cookies, no dudes en contactarnos.
        </Typography>
      </Paper>
    </Container>
  );
};

export default CookiePolicy; 