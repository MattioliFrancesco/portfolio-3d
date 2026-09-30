import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/3d/Scene';
import ErrorBoundary from './components/ErrorBoundary';
import { ACTS } from './components/3d/acts';

const SECTIONS = [
  { id: 'act-0', tag: 'Act I — The Machine', align: 'center-align' },
  { id: 'act-1', tag: 'Act II — Code as Instrument', align: 'left-align' },
  { id: 'act-2', tag: 'Act III — The Synthesis', align: 'right-align' },
  { id: 'act-3', tag: 'Act IV — Dynamics', align: 'left-align' },
  { id: 'act-4', tag: 'Act V — The Cycle', align: 'center-align' },
];

function App() {
  const [progress, setProgress] = useState(0);
  const [activeAct, setActiveAct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        setProgress(p);
        setActiveAct(Math.min(SECTIONS.length - 1, Math.floor(p * 5 + 0.25)));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const onMove = (e) => {
      document.documentElement.style.setProperty('--mx', `${e.clientX}px`);
      document.documentElement.style.setProperty('--my', `${e.clientY}px`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.35 },
    );
    document.querySelectorAll('.content-box').forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  const accent = ACTS[activeAct]?.color ?? ACTS[0].color;

  return (
    <div className="app-container" style={{ '--accent': accent }}>
      {/* Fixed 3D stage behind everything */}
      <div className="canvas-container">
        <Canvas
          camera={{ position: [0, 0, 7], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
        >
          <ErrorBoundary>
            <Scene />
          </ErrorBoundary>
        </Canvas>
      </div>

      {/* Cinematic UI chrome */}
      <header className="site-header">
        <a className="brand" href="#act-0">
          <span className="brand-mark" />
          F. Mattioli
        </a>
        <div className="header-links">
          <a href="mailto:franci.mdnet@gmail.com">Contact</a>
          <a href="/CV - Francesco Mattioli (definitivo 2026).pdf" target="_blank" rel="noreferrer" className="cv-pill">
            CV ↓
          </a>
        </div>
      </header>

      <nav className="act-nav" aria-label="Sections">
        {SECTIONS.map((s, i) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`act-dot ${i === activeAct ? 'is-active' : ''}`}
            title={s.tag}
          >
            <span className="dot" />
            <span className="dot-label">{s.tag}</span>
          </a>
        ))}
      </nav>

      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />

      <div className="cursor-glow" />

      {/* Scroll-driven story */}
      <div className="scroll-container">
        <section id="act-0" className="section center-align">
          <div className="hero-text">
            <p className="hero-kicker">Creative Engineer — Firenze, IT</p>
            <h1>
              FRANCESCO
              <br />
              MATTIOLI
            </h1>
            <p className="hero-sub">Computer Engineering @ Unifi</p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#act-1">
                Enter the machine
              </a>
              <a className="btn btn-ghost" href="/CV - Francesco Mattioli (definitivo 2026).pdf" target="_blank" rel="noreferrer">
                Download CV
              </a>
            </div>
            <p className="drag-hint">◈ Drag anywhere to orbit the 3D world</p>
          </div>
          <div className="scroll-hint" aria-hidden="true">
            <span>Scroll</span>
            <div className="scroll-line" />
          </div>
        </section>

        <section id="act-1" className="section left-align">
          <div className="content-box glass tilt" data-act-tag={SECTIONS[1].tag}>
            <span className="act-index">02</span>
            <h2>Code as Instrument</h2>
            <p>
              I build interfaces and scalable architectures. With <strong>TAPP-v2</strong>, I designed a full-stack
              ecosystem (PHP, MySQL, GSAP) supporting volunteer associations in the daily management of services,
              vehicles and people.
            </p>
            <ul className="chip-row">
              <li>Full-stack</li>
              <li>Systems design</li>
              <li>Automation</li>
            </ul>
          </div>
        </section>

        <section id="act-2" className="section right-align">
          <div className="content-box glass tilt" data-act-tag={SECTIONS[2].tag}>
            <span className="act-index">03</span>
            <h2>Aesthetic Equilibrium</h2>
            <p>
              Design must communicate without noise. In the rebranding for <strong>Hockey Club Pistoia (HCPT)</strong>,
              I deconstructed the city's symbols into minimalist geometry, applying them to the visual identity and the
              technical design of the sportswear.
            </p>
            <ul className="chip-row">
              <li>Brand identity</li>
              <li>Minimal geometry</li>
              <li>Art direction</li>
            </ul>
          </div>
        </section>

        <section id="act-3" className="section left-align">
          <div className="content-box glass tilt" data-act-tag={SECTIONS[3].tag}>
            <span className="act-index">04</span>
            <h2>Dynamics &amp; Systems</h2>
            <p>
              Whether analyzing models for <strong>Foundations of Automatics</strong>, tuning a custom V12 physics setup
              in BeamNG.drive, or competing in Serie A Élite field hockey — my focus is always on the logical rules that
              move the system.
            </p>
            <ul className="chip-row">
              <li>Control theory</li>
              <li>Physics sim</li>
              <li>Élite sport</li>
              <li>Interactive 3D</li>
            </ul>
          </div>
        </section>

        <section id="act-4" className="section center-align">
          <div className="content-box glass contact-box" data-act-tag={SECTIONS[4].tag}>
            <span className="act-index">05</span>
            <h2>Let's build together</h2>
            <p>An idea without form. Write to me.</p>
            <div className="contact-actions">
              <a className="btn btn-primary" href="mailto:franci.mdnet@gmail.com">
                franci.mdnet@gmail.com
              </a>
              <a className="btn btn-ghost" href="/CV - Francesco Mattioli (definitivo 2026).pdf" target="_blank" rel="noreferrer">
                Open CV
              </a>
            </div>
            <span className="hand-sign">— Francesco</span>
          </div>
          <footer className="site-footer">
            <span>© {new Date().getFullYear()} Francesco Mattioli</span>
            <span>Built as a real-time 3D experience</span>
          </footer>
        </section>
      </div>
    </div>
  );
}

export default App;
