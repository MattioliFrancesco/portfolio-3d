import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/3d/Scene';
import './styles/main.css';

const copy = {
  it: { lang: 'EN', cv: 'CV ↗', hint: 'cerca le isole', title: 'Francesco Mattioli', role: 'ingegneria informatica · web · prodotti digitali' },
  en: { lang: 'IT', cv: 'CV ↗', hint: 'find the islands', title: 'Francesco Mattioli', role: 'computer engineering · web · digital products' },
};

function App() {
  const [language, setLanguage] = useState('it');
  const text = copy[language];

  useEffect(() => {
    document.documentElement.lang = language;
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, [language]);

  return (
    <div className="city-experience archipelago-experience">
      <div className="city-stage"><Canvas camera={{ position: [0, 2.25, 13], fov: 52 }} dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: 'high-performance' }}><Scene language={language} /></Canvas></div>
      <header className="city-header"><a className="city-mark" href="#city-start">FM</a><div className="city-name">{text.title}</div><nav><a href="/CV - Francesco Mattioli (definitivo 2026).pdf" target="_blank" rel="noreferrer">{text.cv}</a><button type="button" onClick={() => setLanguage(language === 'it' ? 'en' : 'it')}>{language.toUpperCase()} ↔ {text.lang}</button></nav></header>
      <div className="city-instruction" id="city-start"><span>{text.hint}</span><b>↓</b></div>
      <div className="city-meter"><span>00</span><i /></div>
      <div className="city-role">{text.role}</div>
    </div>
  );
}

export default App;
