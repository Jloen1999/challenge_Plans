import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import '../assets/styles/pages/About.css';

const About: React.FC = () => {
  return (
    <MainLayout>
      <div className="about-page">
        <section className="about-hero">
          <h1>Acerca de Challenge Plans</h1>
          <p className="about-tagline">Transformando la forma de aprender y mejorar habilidades de programación</p>
        </section>

        <section className="about-mission">
          <h2>Nuestra Misión</h2>
          <div className="mission-content">
            <div className="mission-text">
              <p>En Challenge Plans creemos que el aprendizaje es más efectivo cuando se combina con retos prácticos, colaboración y una estructura clara. Nuestra misión es proporcionar una plataforma donde los desarrolladores puedan mejorar sus habilidades a través de planes de estudio personalizados y retos diarios.</p>
              <p>Nos esforzamos por crear un entorno que motive a los usuarios a mantenerse constantes en su aprendizaje, compartir conocimientos y apoyarse mutuamente en su crecimiento profesional.</p>
            </div>
            <div className="mission-image">
              <img src="/images/about-mission.svg" alt="Misión de Challenge Plans" />
            </div>
          </div>
        </section>

        <section className="about-values">
          <h2>Nuestros Valores</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Aprendizaje Continuo</h3>
              <p>Creemos que el aprendizaje es un viaje de toda la vida, no un destino.</p>
            </div>
            <div className="value-card">
              <h3>Colaboración</h3>
              <p>El conocimiento compartido es más valioso y genera mejores resultados.</p>
            </div>
            <div className="value-card">
              <h3>Excelencia</h3>
              <p>Buscamos la calidad en todo lo que hacemos y promovemos las mejores prácticas.</p>
            </div>
            <div className="value-card">
              <h3>Inclusión</h3>
              <p>Construimos una comunidad diversa donde todos tienen espacio para crecer.</p>
            </div>
          </div>
        </section>

        <section className="about-team">
          <h2>Nuestro Equipo</h2>
          <div className="team-members">
            <div className="team-member">
              <img src="/images/team/founder.jpg" alt="Fundador" className="member-photo" />
              <h3>Carlos Martínez</h3>
              <p className="member-role">Fundador & CEO</p>
              <p className="member-bio">Desarrollador Full Stack con más de 10 años de experiencia y pasión por la educación.</p>
            </div>
            <div className="team-member">
              <img src="/images/team/cto.jpg" alt="CTO" className="member-photo" />
              <h3>Ana Rodríguez</h3>
              <p className="member-role">CTO</p>
              <p className="member-bio">Arquitecta de software especializada en plataformas educativas y sistemas de gamificación.</p>
            </div>
            <div className="team-member">
              <img src="/images/team/cmo.jpg" alt="CMO" className="member-photo" />
              <h3>Pablo Sánchez</h3>
              <p className="member-role">Director de Contenido</p>
              <p className="member-bio">Educador con experiencia en desarrollo curricular y metodologías de enseñanza innovadoras.</p>
            </div>
          </div>
        </section>

        <section className="about-contact">
          <h2>Contáctanos</h2>
          <p>¿Tienes alguna pregunta o sugerencia? Nos encantaría saber de ti.</p>
          <div className="contact-info">
            <div className="contact-method">
              <h3>Email</h3>
              <p>contacto@challengeplans.com</p>
            </div>
            <div className="contact-method">
              <h3>Dirección</h3>
              <p>Calle Innovación, 123<br/>28001 Madrid, España</p>
            </div>
            <div className="contact-method">
              <h3>Redes Sociales</h3>
              <div className="social-links">
                <a href="https://twitter.com/challengeplans" target="_blank" rel="noopener noreferrer">Twitter</a>
                <a href="https://linkedin.com/company/challengeplans" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a href="https://github.com/challengeplans" target="_blank" rel="noopener noreferrer">GitHub</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default About;
