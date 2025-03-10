import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './TestimonialsSection.css';

const testimonials = [
  {
    id: 1,
    content: "Challenge Plans revolucionó mi forma de estudiar. Los retos me mantienen motivado y he aprendido más en 3 meses que en todo un semestre tradicional.",
    author: "Marcos Jiménez",
    role: "Estudiante de Ingeniería",
    avatar: "/images/avatars/marcos.jpg"
  },
  {
    id: 2,
    content: "Como profesora, la plataforma me permite crear planes de estudio interactivos que mis alumnos realmente disfrutan. Los sistemas de gamificación han aumentado la participación en un 80%.",
    author: "Claudia Moreno",
    role: "Profesora Universitaria",
    avatar: "/images/avatars/claudia.jpg"
  },
  {
    id: 3,
    content: "Increíble lo rápido que avancé en programación gracias a los retos colaborativos. La comunidad es super activa y siempre hay alguien dispuesto a ayudar.",
    author: "Roberto Sánchez",
    role: "Desarrollador Junior",
    avatar: "/images/avatars/roberto.jpg"
  },
  {
    id: 4,
    content: "Los apuntes compartidos me salvaron en muchas ocasiones. Y las insignias y recompensas por completar retos hacen que quieras seguir aprendiendo.",
    author: "Ana Torres",
    role: "Estudiante de Medicina",
    avatar: "/images/avatars/ana.jpg"
  }
];

const TestimonialsSection: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="section testimonials-section">
      <div className="section-container">
        <h2 className="section-title">Lo Que Dicen Nuestros Usuarios</h2>
        <p className="section-subtitle">
          Experiencias reales de estudiantes y profesores que utilizan Challenge Plans
        </p>

        <div className="testimonials-slider">
          <button 
            className="slider-control prev" 
            onClick={prevTestimonial}
            aria-label="Testimonio anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="testimonials-container">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={testimonial.id}
                className={`testimonial-card ${index === activeTestimonial ? 'active' : ''}`}
                initial={{ opacity: 0, x: 100 }}
                animate={{ 
                  opacity: index === activeTestimonial ? 1 : 0,
                  x: index === activeTestimonial ? 0 : 100
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="testimonial-content">
                  <svg className="quote-icon" xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M6.5 10c-.223 0-.437.034-.65.065c.069-.232.14-.468.254-.68c.114-.308.292-.575.469-.844c.148-.291.409-.488.601-.737c.201-.242.475-.403.692-.604c.213-.21.492-.315.714-.463c.232-.133.434-.28.65-.35c.208-.086.39-.16.539-.222c.302-.125.474-.197.474-.197l.484-.148l.122-.047l.042-.032l.014-.01l.003-.003l.002-.002c.003-.001.005-.002 0 0l-.002.003l-.004.005l-.012.015L11.5 6.8c-.5.4-1.989 1.57-2.5 2.6c-.547.935-1 1.773-1 3.4c0 1.1.89 2 2 2c1.1 0 2-.9 2-2c0-1.1-.9-2-2-2z"/>
                    <path fill="currentColor" d="M15.5 10c-.223 0-.437.034-.65.065c.069-.232.14-.468.254-.68c.114-.308.292-.575.469-.844c.148-.291.409-.488.601-.737c.201-.242.475-.403.692-.604c.213-.21.492-.315.714-.463c.232-.133.434-.28.65-.35c.208-.086.39-.16.539-.222c.302-.125.474-.197.474-.197l.484-.148l.122-.047l.042-.032l.014-.01l.003-.003l.002-.002c.003-.001.005-.002 0 0l-.002.003l-.004.005l-.012.015l-.688.5c-.5.4-1.989 1.57-2.5 2.6c-.547.935-1 1.773-1 3.4c0 1.1.89 2 2 2c1.1 0 2-.9 2-2c0-1.1-.9-2-2-2z"/>
                  </svg>
                  <p>{testimonial.content}</p>
                </div>
                <div className="testimonial-author">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author} 
                    className="author-avatar" 
                  />
                  <div className="author-info">
                    <h4 className="author-name">{testimonial.author}</h4>
                    <p className="author-role">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <button 
            className="slider-control next" 
            onClick={nextTestimonial}
            aria-label="Siguiente testimonio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === activeTestimonial ? 'active' : ''}`}
              onClick={() => setActiveTestimonial(index)}
              aria-label={`Ir al testimonio ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
