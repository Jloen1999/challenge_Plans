import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import '../../assets/styles/components/MarkdownRenderer.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    // Usar marked de manera síncrona
    const processMarkdown = async () => {
      try {
        // Hay dos maneras de resolver esto:
        
        // Opción 1: Usar marked.parse si es asíncrono
        const rawMarkup = await marked.parse(content || '');
        
        // Alternativa: Si marked.parse no está disponible o da error
        // const rawMarkup = await marked(content || '');
        
        // Sanitizar HTML para prevenir XSS
        const cleanHtml = DOMPurify.sanitize(rawMarkup);
        setHtml(cleanHtml);
      } catch (error) {
        console.error('Error procesando markdown:', error);
        setHtml('<p>Error al renderizar el contenido markdown</p>');
      }
    };

    processMarkdown();
  }, [content]);

  return (
    <div 
      className={`markdown-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// Alternativa: Si prefieres usar la versión síncrona explícitamente
// Descomenta este código y comenta el componente anterior
/*
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  // Configurar marked para usar modo síncrono
  marked.setOptions({
    async: false // Forzar modo síncrono
  });

  const createMarkup = () => {
    try {
      // Esto ahora debería ser síncrono
      const rawMarkup = marked.parse(content || '');
      // Sanitizar HTML para prevenir XSS
      const cleanHtml = DOMPurify.sanitize(rawMarkup);
      return { __html: cleanHtml };
    } catch (error) {
      console.error('Error procesando markdown:', error);
      return { __html: '<p>Error al renderizar el contenido markdown</p>' };
    }
  };

  return (
    <div 
      className={`markdown-content ${className}`.trim()}
      dangerouslySetInnerHTML={createMarkup()}
    />
  );
};
*/

export default MarkdownRenderer;
