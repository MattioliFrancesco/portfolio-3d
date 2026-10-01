import { Canvas } from '@react-three/fiber';
import Scene from './components/3d/Scene';

function App() {
  return (
    <div className="app-container">
      <div className="canvas-container">
        {/* Allontanato leggermente la camera a Z:7 per far respirare le forme ampie */}
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: 'high-performance' }}>
          <Scene />
        </Canvas>
      </div>

      <div className="scroll-container">
        
        {/* Atto 1: Hero (Centrato) */}
        <section className="section center-align">
          <div className="hero-text">
            <h1>FRANCESCO MATTIOLI</h1>
            <p>Computer Engineering @ Unifi</p>
          </div>
        </section>

        {/* Atto 2: La Macchina (Allineato a Sinistra) */}
        <section className="section left-align">
          <div className="content-box">
            <h2>Codice come Strumento</h2>
            <p>Sviluppo interfacce e architetture scalabili. Con <strong>TAPP-v2</strong>, ho progettato un ecosistema full-stack (PHP, MySQL, GSAP) per supportare le associazioni di volontariato nella gestione quotidiana di servizi, mezzi e persone.</p>
          </div>
        </section>

        {/* Atto 3: La Sintesi (Allineato a Destra) */}
        <section className="section right-align">
          <div className="content-box">
            <h2>Equilibrio Estetico</h2>
            <p>Il design deve comunicare senza rumore. Nel rebranding per l'<strong>Hockey Club Pistoia (HCPT)</strong>, ho destrutturato i simboli della città in geometrie minimaliste, applicandole all'identità visiva e al design tecnico delle divise sportive.</p>
          </div>
        </section>

        {/* Atto 4: La Dinamica (Allineato a Sinistra) */}
        <section className="section left-align">
          <div className="content-box">
            <h2>Dinamiche e Sistemi</h2>
            <p>Che si tratti di analizzare modelli per Fondamenti di Automatica, configurare la fisica di un V12 custom su BeamNG.drive, o competere nella Serie A Élite di hockey su prato, il mio focus è sempre sulle regole logiche che muovono il sistema.</p>
          </div>
        </section>

        {/* Atto 5: Il Ciclo (Centrato) */}
        <section className="section center-align">
          <div className="content-box">
            <h2>Lavoriamo Insieme</h2>
            <p>Un'idea senza forma. Scrivimi.</p>
            {/* Qui andrà il form Formspree */}
          </div>
        </section>

      </div>
    </div>
  );
}

export default App;