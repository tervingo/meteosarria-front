import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Enviar evento de vista de página cuando cambia la ruta
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
        page_title: document.title
      });
    }
  }, [location]);

  return null;
};

export default GoogleAnalytics; 