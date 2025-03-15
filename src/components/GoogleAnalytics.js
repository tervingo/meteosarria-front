import { useEffect } from 'react';

const GoogleAnalytics = () => {
  useEffect(() => {
    // Enviar evento de vista de página cuando se carga el componente
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: window.location.pathname,
        page_title: document.title
      });
    }
  }, []); // Solo se ejecuta una vez al montar el componente

  return null;
};

export default GoogleAnalytics; 