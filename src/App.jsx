import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Scene from './components/3d/Scene';
import HockeyStick from './components/3d/HockeyStick';

gsap.registerPlugin(SplitText, ScrollTrigger);

const chapters = [
  { id: 'inizio', label: 'Inizio' },
  { id: 'lavoro', label: 'Esperienze' },
  { id: 'percorso', label: 'Percorso' },
  { id: 'chi-sono', label: 'Chi sono' },
  { id: 'contatti', label: 'Contatti' },
];

const experiences = [
  {
    company: 'TAPP',
    role: 'Membro fondatore & sviluppatore web',
    period: 'Giugno 2024 — oggi',
    place: 'Pistoia',
    desc: <>Progettazione e sviluppo full-stack di una piattaforma gestionale per associazioni di volontariato: servizi, parco mezzi e gestione di personale e volontari.</>,
    tags: ['PHP', 'MySQL', 'JavaScript', 'Architettura software'],
  },
  {
    company: 'Shelfly',
    role: 'Founder & responsabile produzione',
    period: 'Settembre 2023 — Giugno 2024',
    place: 'Pistoia',
    desc: <>Dallo sviluppo del software alla realizzazione del prodotto fisico: pianificazione, prototipazione e strategie commerciali.</>,
    tags: ['Startup', 'Product design', 'Sviluppo software'],
  },
  {
    company: 'NASA/JPL & Logaut',
    role: 'Stage & progetti tecnici',
    period: 'Formazione sul campo',
    place: 'Pistoia / collaborazioni USA',
    desc: <>Esperienza formativa internazionale con NASA/JPL e stage in Logaut, tra automazione e programmazione industriale.</>,
    tags: ['Automazione', 'Software industriale', 'NASA/JPL'],
  },
];

const skills = [
  { title: 'Web', items: ['HTML / CSS', 'JavaScript', 'React', 'PHP', 'SQL / MySQL', 'Node.js', 'GSAP'] },
  { title: 'Linguaggi & strumenti', items: ['C / C++', 'C#', 'Java', 'Python', 'Unity 3D'] },
  { title: 'Lingue', items: ['Italiano · madrelingua', 'Inglese · fluente', 'Spagnolo · base'] },
];

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/MattioliFrancesco' },
  { label: 'Instagram', href: 'https://instagram.com/francesco_mattioli__?psln=MWNmZjEweGN2ZXl2eQ%3D%3D' },
];

function getRenderProfile() {
  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
  const pixelCount = window.innerWidth * window.innerHeight * devicePixelRatio ** 2;
  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory || 8;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const quality = pixelCount > 4_500_000 || cores <= 4 || memory <= 4
    ? 'low'
    : pixelCount > 2_400_000 || cores <= 6
      ? 'balanced'
      : 'high';

  return {
    quality,
    dpr: quality === 'low' ? 0.85 : quality === 'balanced' ? 1 : Math.min(devicePixelRatio, 1.25),
    reducedMotion,
  };
}

export default function App() {
  const appRef = useRef(null);
  const [activeExp, setActiveExp] = useState(0);
  const [activeChapter, setActiveChapter] = useState('inizio');
  const [copyStatus, setCopyStatus] = useState('idle');
  const [renderProfile, setRenderProfile] = useState(getRenderProfile);

  useEffect(() => {
    const updateRenderProfile = () => setRenderProfile(getRenderProfile());
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    window.addEventListener('resize', updateRenderProfile);
    motionPreference.addEventListener('change', updateRenderProfile);

    return () => {
      window.removeEventListener('resize', updateRenderProfile);
      motionPreference.removeEventListener('change', updateRenderProfile);
    };
  }, []);

  useLayoutEffect(() => {
    if (renderProfile.reducedMotion) return undefined;

    let disposed = false;
    const splits = [];
    const context = gsap.context(() => {}, appRef);

    document.fonts.ready.then(() => {
      if (disposed || !appRef.current) return;

      context.add(() => {
        appRef.current.querySelectorAll('.font-hand').forEach((element) => {
          const split = SplitText.create(element, {
            type: 'words,chars',
            wordsClass: 'hand-word',
            charsClass: 'hand-char',
            autoSplit: true,
            onSplit: (splitText) => gsap.from(splitText.chars, {
              autoAlpha: 0,
              yPercent: 18,
              rotation: -3,
              transformOrigin: '0% 100%',
              stagger: 0.04,
              duration: 0.24,
              ease: 'power1.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 90%',
                once: true,
              },
            }),
          });
          splits.push(split);
        });
        ScrollTrigger.refresh();
      });
    });

    return () => {
      disposed = true;
      splits.forEach((split) => split.revert());
      context.revert();
    };
  }, [renderProfile.reducedMotion]);

  useEffect(() => {
    const sections = chapters
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        setActiveChapter(visible.target.id);
      },
      { threshold: [0.2, 0.45, 0.7], rootMargin: '-10% 0px -10% 0px' },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('franci.mdnet@gmail.com');
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 2200);
    } catch {
      setCopyStatus('error');
      window.setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  return (
    <div className="app-container" ref={appRef}>
      <div className="canvas-container" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 7], fov: 45 }}
          dpr={renderProfile.dpr}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
        >
          <Scene quality={renderProfile.quality} reducedMotion={renderProfile.reducedMotion} />
        </Canvas>
      </div>
      <div className="cinema-wash" aria-hidden="true" />

      <header className="site-header">
        <a className="wordmark font-hand" href="#inizio" aria-label="Francesco Mattioli, inizio">
          FM<span>®</span>
        </a>
        <nav className="chapter-nav" aria-label="Navigazione principale">
          {chapters.map((chapter, index) => (
            <a
              key={chapter.id}
              className={`chapter-link ${activeChapter === chapter.id ? 'active' : ''}`}
              href={`#${chapter.id}`}
              aria-current={activeChapter === chapter.id ? 'location' : undefined}
            >
              <span className="chapter-link-num">0{index + 1}</span>
              <span>{chapter.label}</span>
            </a>
          ))}
        </nav>
        <a className="header-contact" href="#contatti">Disponibile per progetti <span>↗</span></a>
      </header>

      <main className="scroll-container">
        <section className="chapter hero-chapter" id="inizio">
          <div className="hero-layout">
            <div className="hero-copy">
              <span className="kicker"><span className="live-dot" /> 01 / Inizio · Portfolio personale 2026</span>
              <h1 className="hero-title">Francesco<br /><span>Mattioli</span></h1>
              <p className="hero-intro">
                Ingegneria informatica, sviluppo creativo e nuove idee.
                <span> Anche fuori dallo schermo, tra hockey e motori.</span>
              </p>
              <a className="text-link hero-link" href="#lavoro">
                Entra nel mio mondo <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="hero-portrait">
              <img src="/foto.png" alt="Francesco Mattioli" />
            </div>
          </div>
          <div className="chapter-foot">
            <span>01 / 05</span><span>Scorri per esplorare</span>
          </div>
        </section>

        <section className="chapter work-chapter" id="lavoro">
          <div className="chapter-heading">
            <span className="chapter-index font-hand">02 / Esperienze</span>
            <h2>Dal progetto<br /><em>al risultato online.</em></h2>
          </div>
          <div className="freelance-feature">
            <div className="freelance-intro">
              <span className="freelance-status"><span className="live-dot" /> Novembre 2024 — oggi</span>
              <h3>Freelance<br /><em>Full Stack Developer</em></h3>
              <p>
                Progetto e realizzo esperienze web su misura: interfacce curate,
                sviluppo full-stack e pubblicazione online, seguendo ogni progetto
                dall’idea al lancio.
              </p>
              <div className="freelance-tags"><span>Design & sviluppo</span><span>Responsive</span><span>End-to-end</span></div>
            </div>
            <div className="project-showcase">
              <a className="project-card project-art" href="https://ilcubodellarte.com" target="_blank" rel="noopener noreferrer">
                <span className="project-number">01 / VERSACE</span>
                <span className="project-monogram font-hand">C<span>.</span></span>
                <span className="project-info"><strong>Il Cubo dell’Arte</strong><small>Identità artistica · Sito web</small></span>
                <span className="project-open" aria-hidden="true">↗</span>
              </a>
              <a className="project-card project-mario" href="https://mariomarasa.eu" target="_blank" rel="noopener noreferrer">
                <span className="project-number">02 / MARAZÀ</span>
                <span className="project-monogram font-hand">M<span>.</span></span>
                <span className="project-info"><strong>Mario Marasa</strong><small>Portfolio personale · Sito web</small></span>
                <span className="project-open" aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <div className="other-work-label"><span>Altre esperienze</span><i /></div>
          <div className="work-layout">
            <div className="work-list" role="tablist" aria-label="Esperienze professionali">
              {experiences.map((experience, index) => (
                <button
                  key={experience.company}
                  className={`work-tab ${activeExp === index ? 'active' : ''}`}
                  id={`experience-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={activeExp === index}
                  aria-controls="experience-detail"
                  onClick={() => setActiveExp(index)}
                >
                  <span className="work-tab-number">0{index + 1}</span>
                  <span>{experience.company}</span>
                  <span className="work-tab-arrow" aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
            <article
              className="work-detail"
              id="experience-detail"
              role="tabpanel"
              aria-labelledby={`experience-tab-${activeExp}`}
              key={activeExp}
            >
              <div className="detail-meta"><span>{experiences[activeExp].period}</span><span>{experiences[activeExp].place}</span></div>
              <h3>{experiences[activeExp].role}</h3>
              <p>{experiences[activeExp].desc}</p>
              <div className="detail-tags">
                {experiences[activeExp].tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </article>
          </div>
          <div className="chapter-foot"><span>02 / 05</span><span>Freelance, startup & collaborazioni</span></div>
        </section>

        <section className={`chapter education-chapter ${activeChapter === 'percorso' ? 'is-active' : ''}`} id="percorso">
          <div className="chapter-heading">
            <span className="chapter-index font-hand">03 / Percorso</span>
            <h2>Studio, pratica,<br /><em>nuove possibilità.</em></h2>
          </div>
          <div className="education-layout">
            <div className="education-intro">
              <span className="education-orbit" aria-hidden="true">FM</span>
              <p>Le tappe che hanno costruito il mio metodo: curiosità, basi solide e voglia di mettermi alla prova.</p>
            </div>
            <div className="education-list timeline">
              <article className="education-item timeline-item">
                <span className="education-date">In corso · 3° anno</span>
                <div><h3>Ingegneria Informatica</h3><p>Università degli Studi di Firenze (UNIFI)</p><p>Algoritmi, automatica, architetture hardware e sistemi distribuiti.</p></div>
                <span className="education-arrow" aria-hidden="true">↗</span>
              </article>
              <article className="education-item timeline-item">
                <span className="education-date">2024</span>
                <div><h3>Diploma · Informatica</h3><p>ITTS Fedi-Fermi, Pistoia · laboratori, Logaut e progetto NASA/JPL.</p></div>
                <span className="education-arrow" aria-hidden="true">↗</span>
              </article>
              <article className="education-item timeline-item">
                <span className="education-date">2022</span>
                <div><h3>Cambridge English · B2</h3><p>Cambridge Assessment English, Pisa</p></div>
                <span className="education-arrow" aria-hidden="true">↗</span>
              </article>
            </div>
            <aside className={`skills-panel ${activeChapter === 'percorso' ? 'is-active' : ''}`}>
              <span className="skills-kicker font-hand">Il mio toolkit</span>
              <h3>Competenze</h3>
              {skills.map((group) => (
                <div className="skills-group" key={group.title}>
                  <h4>{group.title}</h4>
                  <div>{group.items.map((item) => <span key={item}>{item}</span>)}</div>
                </div>
              ))}
            </aside>
          </div>
          <div className="chapter-foot"><span>03 / 05</span><span>Formazione & competenze</span></div>
        </section>

        <section className="chapter identity-chapter" id="chi-sono">
          <div className="chapter-heading identity-heading">
            <span className="chapter-index font-hand">04 / Chi sono</span>
            <h2>Fuori dal lavoro,<br /><em>la mia vita.</em></h2>
            <p>Le passioni, le persone e i luoghi che fanno parte di me.</p>
          </div>
          <div className="identity-layout">
            <div className="identity-story">
              <div className="identity-place">
                <span className="identity-kicker">Le mie radici</span>
                <h3>Firenze è dove sono nato.<br /><em>Pistoia è casa, da sempre.</em></h3>
                <p>Vivo a Pistoia e mi muovo tra Pistoia e Firenze per studio, lavoro e nuovi progetti.</p>
              </div>
              <div className="identity-interests">
                <article className="identity-interest">
                  <span className="identity-interest-number">01</span>
                  <div><h3>Hockey su prato</h3><p>Gioco in Serie A con l’HC Pistoia. In campo ritrovo spirito di squadra, fiducia e voglia di migliorare.</p>
                    <a className="text-link club-link" href="https://www.hcpistoia.it/" target="_blank" rel="noopener noreferrer">
                      HC Pistoia · sito ufficiale <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </article>
                <article className="identity-interest">
                  <span className="identity-interest-number">02</span>
                  <div><h3>Motori</h3><p>Mi affascinano i motori e tutto ciò che unisce tecnologia, precisione e movimento.</p></div>
                </article>
                <article className="identity-interest">
                  <span className="identity-interest-number">03</span>
                  <div><h3>Pianoforte & cucina</h3><p>Due modi diversi di staccare, sperimentare e godermi il tempo libero.</p></div>
                </article>
              </div>
              <blockquote className="identity-quote">
                <p className="identity-quote-text font-hand">“La semplicità è l’ultima sofisticazione.”</p>
                <cite>Attribuita a Leonardo da Vinci</cite>
              </blockquote>
            </div>
            <div className="identity-visuals">
              <div className="hockey-object" role="group" aria-label="Mazza da hockey 3D interattiva">
                <Canvas
                  frameloop={activeChapter === 'chi-sono' && !renderProfile.reducedMotion ? 'always' : 'demand'}
                  camera={{ position: [0, 0, 4.2], fov: 38 }}
                  dpr={renderProfile.dpr}
                  gl={{ antialias: renderProfile.quality === 'high', alpha: true, powerPreference: 'high-performance' }}
                >
                  <ambientLight intensity={1.5} />
                  <directionalLight position={[3, 4, 5]} intensity={3} color="#fff1e7" />
                  <pointLight position={[-3, -2, 2]} intensity={2} color="#ff684d" />
                  <HockeyStick autoRotate={activeChapter === 'chi-sono' && !renderProfile.reducedMotion} />
                </Canvas>
                <span className="object-caption"><i /> HOCKEY STICK · HC PISTOIA</span>
                <span className="hockey-hint font-hand">Trascina per ruotare</span>
              </div>
            </div>
          </div>
          <div className="chapter-foot"><span>04 / 05</span><span>Passioni, luoghi & quotidianità</span></div>
        </section>

        <section className="chapter closing-chapter" id="contatti">
          <div className="closing-topline">
            <span className="chapter-index font-hand">05 / Contatti</span>
            <span className="closing-location">Pistoia / Firenze · Italia</span>
          </div>
          <div className="closing-main">
            <span className="kicker"><span className="live-dot" /> Il prossimo capitolo</span>
            <h2>Hai un’idea?<br /><em>Costruiamola.</em></h2>
            <div className="contact-row">
              <button className="email-button" type="button" onClick={copyEmail}>
                {copyStatus === 'copied' ? 'Email copiata ✓' : copyStatus === 'error' ? 'Copia non riuscita — riprova' : 'franci.mdnet@gmail.com'}
                <span aria-hidden="true">{copyStatus === 'copied' ? '✓' : '↗'}</span>
              </button>
              <a className="phone-link" href="tel:+393314809923">+39 331 480 9923</a>
            </div>
            <nav className="social-links" aria-label="Profili social">
              <span>Seguimi</span>
              {socialLinks.map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                  {label} <span aria-hidden="true">↗</span>
                </a>
              ))}
            </nav>
          </div>
          <footer className="site-footer">
            <span className="font-hand">Francesco Mattioli</span>
            <span>© 2026 · Fatto con curiosità.</span>
            <a href="#inizio">Torna all’inizio ↑</a>
          </footer>
          <div className="chapter-foot"><span>05 / 05</span><span>Fine della presentazione · inizio della conversazione</span></div>
        </section>
      </main>
    </div>
  );
}
