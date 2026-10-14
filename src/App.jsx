import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/3d/Scene';

export default function App() {
  // Tab attiva per le esperienze
  const [activeExp, setActiveExp] = useState(0);

  // Stato per la notifica di copia email
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText('franci.mdnet@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const experiences = [
    {
      company: 'Freelance',
      role: 'Full Stack Web Developer',
      period: 'Novembre 2024 - In corso',
      place: 'Pistoia / Remoto',
      desc: 'Sviluppo di siti web moderni, interattivi e responsive (tra cui <a href="https://ilcubodellarte.com" target="_blank" rel="noopener noreferrer">ilcubodellarte.com</a> e <a href="https://mariomarasa.eu" target="_blank" rel="noopener noreferrer">mariomarasa.eu</a>). Creazione di interfacce animate curate nei minimi dettagli, logiche server-side, hosting deployment e form di contatto.',
      tags: ['HTML5', 'CSS3', 'JavaScript', 'PHP', 'GSAP', 'Responsive UI']
    },
    {
      company: 'TAPP',
      role: 'Membro Fondatore & Sviluppatore Web',
      period: 'Giugno 2024 - In corso',
      place: 'Pistoia',
      desc: 'Progettazione e sviluppo full-stack di una piattaforma gestionale web per associazioni di volontariato (gestione integrata di servizi, parco mezzi e personale/volontari). Gestione diretta dei requisiti e dei rapporti con i clienti in un contesto operativo dinamico.',
      tags: ['PHP', 'MySQL', 'JavaScript', 'GSAP', 'Bootstrap', 'Architettura Software']
    },
    {
      company: 'Shelfly',
      role: 'Founder & Resp. Produzione',
      period: 'Settembre 2023 - Giugno 2024',
      place: 'Pistoia',
      desc: 'Sviluppo del software aziendale e ideazione/realizzazione del prodotto fisico. Gestione completa del ciclo di vita del progetto, dalla pianificazione tecnica e prototipazione fino alle strategie commerciali.',
      tags: ['Co-Founder', 'Sviluppo Software', 'Product Design', 'Problem Solving']
    },
    {
      company: 'NASA/JPL & Logaut',
      role: 'Stage & Progetti Tecnici',
      period: 'Formazione sul campo',
      place: 'Pistoia / USA Collaborations',
      desc: 'Esperienza internazionale formativa in collaborazione con NASA/JPL (USA) e stage tecnico presso Logaut dedicato all automazione e programmazione industriale, integrando rigore metodologico ed esigenze di produzione reale.',
      tags: ['Automazione', 'Software Industriale', 'NASA/JPL', 'Logaut']
    }
  ];

  return (
    <div className="app-container">
      {/* 3D Canvas con Scene.jsx invariato */}
      <div className="canvas-container">
        <Canvas
          camera={{ position: [0, 0, 7], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
        >
          <Scene />
        </Canvas>
      </div>

      <div className="scroll-container">

        {/* ATTO 1: HERO (Centrato) */}
        <section className="section center-align">
          <div className="content-box">
            <div className="hero-wrapper">

              <div className="photo-interactive-card">
                <img src="/foto.png" alt="Francesco Mattioli" />
              </div>

              <div>
                <h3 className="hero-title">FRANCESCO MATTIOLI</h3>
                <span className="hero-hand-tag font-hand glass-panel">Il sito è ancora in via di sviluppo, scusa per l'inconveniente!</span>
              </div>

            </div>
          </div>
        </section>

        {/* ATTO 2: ESPERIENZE & STARTUP (Allineato a Sinistra) */}
        <section className="section left-align">
          <div className="content-box wide">
            <div className="glass-panel">
              <h2>
                <span className="section-num font-hand">01 //</span> Esperienze & Startup
              </h2>

              {/* Selettore Tab interattivo */}
              <div className="experience-tabs">
                {experiences.map((exp, idx) => (
                  <button
                    key={idx}
                    className={`tab-btn ${activeExp === idx ? 'active' : ''}`}
                    onClick={() => setActiveExp(idx)}
                  >
                    {exp.company}
                  </button>
                ))}
              </div>

              {/* Dettaglio Esperienza attivo con animazione fluida */}
              <div className="exp-content" style={{ animation: 'fadeIn 0.4s ease-in-out' }}>
                <div className="exp-header">
                  <div className="exp-role">{experiences[activeExp].role}</div>
                  <div className="exp-period">{experiences[activeExp].period}</div>
                </div>
                <div className="exp-place">📍 {experiences[activeExp].place}</div>

                {/* Qui usiamo dangerouslySetInnerHTML per leggere correttamente i tag <a> */}
                <p dangerouslySetInnerHTML={{ __html: experiences[activeExp].desc }}></p>

                <div className="tag-container">
                  {experiences[activeExp].tags.map((t, i) => (
                    <span key={i} className="tag">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ATTO 3: FORMAZIONE ACCADEMICA (Allineato a Destra) */}
        <section className="section right-align">
          <div className="content-box">
            <div className="glass-panel">
              <h2>
                <span className="section-num font-hand">02 //</span> Formazione
              </h2>

              <div className="edu-card">
                <span className="edu-year">In corso (3° Anno)</span>
                <div className="edu-title">Laurea Triennale in Ingegneria Informatica</div>
                <div className="edu-school">Università degli Studi di Firenze (UNIFI)</div>
                <p>
                  Costruzione di solide basi teoriche e metodologiche: algoritmi, strutture dati,
                  fondamenti di automatica, architetture hardware e sistemi distribuiti.
                </p>
              </div>

              <div className="edu-card">
                <span className="edu-year">2024</span>
                <div className="edu-title">Diploma Istituto Tecnico - Informatica</div>
                <div className="edu-school">ITTS Fedi-Fermi, Pistoia</div>
                <p>
                  Intensa attività laboratoriale, avvio delle prime iniziative startup,
                  stage tecnico in Logaut e progetto formativo NASA/JPL.
                </p>
              </div>

              <div className="edu-card">
                <span className="edu-year">2022 • Cambridge English</span>
                <div className="edu-title">B2 Certificate</div>
                <div className="edu-school">Cambridge Assessment English, Pisa</div>
                <p>Certificazione di lingua inglese per contesti tecnici e internazionali.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ATTO 4: COMPETENZE & SPORT (Allineato a Sinistra) */}
        <section className="section left-align">
          <div className="content-box">
            <div className="glass-panel">
              <h2>
                <span className="section-num font-hand">03 //</span> Competenze & Metodo
              </h2>

              <div className="skills-category">
                <div className="skills-category-title">Web & Framework</div>
                <div className="tag-container">
                  <span className="tag">HTML / CSS</span>
                  <span className="tag">JavaScript (ES6+)</span>
                  <span className="tag">PHP</span>
                  <span className="tag">SQL / MySQL</span>
                  <span className="tag">React.js</span>
                  <span className="tag">Node.js</span>
                  <span className="tag">GSAP</span>
                  <span className="tag">Bootstrap</span>
                </div>
              </div>

              <div className="skills-category">
                <div className="skills-category-title">Linguaggi & Software</div>
                <div className="tag-container">
                  <span className="tag">C / C++</span>
                  <span className="tag">C#</span>
                  <span className="tag">Java</span>
                  <span className="tag">Python</span>
                  <span className="tag">Unity 3D</span>
                </div>
              </div>

              <div className="skills-category">
                <div className="skills-category-title">Visione & Hockey su Prato</div>
                <p style={{ fontSize: '0.95rem' }}>
                  Giocatore attivo nella squadra di Serie A dell'<strong>HC Pistoia</strong> (Hockey Club Pistoia).
                  La disciplina sportiva mi ha insegnato la gestione della pressione e l'importanza del collettivo.
                </p>
                <div className="tag-container">
                  <span className="tag">Teamwork</span>
                  <span className="tag">Problem Solving</span>
                  <span className="tag">Italiano (Madrelingua)</span>
                  <span className="tag">Inglese (Fluente)</span>
                  <span className="tag">Spagnolo (Base)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ATTO 5: CONTATTI & CHIUSURA (Centrato) */}
        <section className="section center-align">
          <div className="content-box">
            <div className="glass-panel">
              <h2>
                <span className="section-num font-hand">04 //</span> Parliamo Insieme
              </h2>

              <p className="hand-quote font-hand">
                "Dall'architettura del codice al lavoro di squadra sul campo: portare valore in ogni progetto."
              </p>

              <p>
                Se hai un'idea di sviluppo, un progetto da realizzare o un'opportunità da valutare,
                non esitare a scrivermi.
              </p>

              <div className="contact-actions">
                <button className="contact-btn" onClick={copyEmail}>
                  <span>✉️ {copied ? 'Email Copiata! ✓' : 'franci.mdnet@gmail.com'}</span>
                </button>
                <a className="contact-btn secondary" href="tel:+393314809923">
                  <span>📞 +39 331 4809923</span>
                </a>
              </div>

              <div style={{ marginTop: '1.2rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                📍 Pistoia / Firenze, Italia • Patente B, A1
              </div>

              <div className="signature font-hand">Francesco Mattioli</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}