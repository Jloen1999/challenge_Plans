import React, { useState, useRef } from 'react';
import './DocumentUploader.css';

export interface DocumentUploaderProps {
  onFileSelected: (file: File) => void;
  allowedExtensions: string[];
  maxSizeMB: number;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ 
  onFileSelected, 
  allowedExtensions, 
  maxSizeMB 
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Verificar extensión
    const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!allowedExtensions.includes(fileExt)) {
      setError(`Tipo de archivo no permitido. Formatos permitidos: ${allowedExtensions.join(', ')}`);
      return;
    }
    
    // Verificar tamaño
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB} MB.`);
      return;
    }
    
    setError(null);
    onFileSelected(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="document-uploader-container">
      <div 
        className={`document-uploader ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="document-uploader-input"
          onChange={(e) => handleFileChange(e.target.files)}
          accept={allowedExtensions.join(',')}
        />
        
        <div className="document-uploader-content">
          <div className="document-uploader-icon">📄</div>
          <p className="document-uploader-text">
            Arrastra y suelta tu archivo aquí o haz clic para seleccionarlo
          </p>
          <p className="document-uploader-formats">
            Formatos permitidos: {allowedExtensions.join(', ')}
          </p>
          <p className="document-uploader-size">
            Tamaño máximo: {maxSizeMB} MB
          </p>
        </div>
      </div>
      
      {error && (
        <div className="document-uploader-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
