import React, { useState } from 'react';

interface PDFViewerProps {
  url: string;
  title: string;
  fallbackMessage?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, title, fallbackMessage }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  return (
    <div className="pdf-viewer-container">
      {isLoading && (
        <div className="pdf-loading">
          <p>Cargando documento...</p>
          <div className="loader"></div>
        </div>
      )}
      
      {error ? (
        <div className="pdf-error">
          <p>{fallbackMessage || 'No se pudo cargar el documento. Por favor, descárgalo para abrirlo localmente.'}</p>
          <div className="pdf-actions">
            <a 
              href={url} 
              className="btn btn-primary"
              download={`${title}.pdf`}
            >
              Descargar PDF
            </a>
            <a 
              href={url} 
              className="btn btn-outline"
              target="_blank" 
              rel="noopener noreferrer"
            >
              Abrir en nueva ventana
            </a>
          </div>
        </div>
      ) : (
        <iframe
          src={url}
          title={title}
          width="100%"
          height="600px"
          frameBorder="0"
          onLoad={handleLoad}
          onError={handleError}
        ></iframe>
      )}
    </div>
  );
};

export default PDFViewer;
