import { useState, useEffect } from 'react';
import NumberGrid from './components/NumberGrid';
import TracingCanvas from './components/TracingCanvas';
import HeroAnimation from './components/HeroAnimation';

export default function App() {
  const [view, setView] = useState('grid'); // 'grid' or 'trace'
  const [currentNumber, setCurrentNumber] = useState(null);
  const [heroActive, setHeroActive] = useState(false);
  const [heroType, setHeroType] = useState('transformer'); // 'transformer' or 'ultraman'

  // Global settings
  const [soundEnabled, setSoundEnabled] = useState(true);

  const speak = (text) => {
    if (!soundEnabled) return;
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW';
    utterance.rate = 0.9;
    utterance.pitch = 1.2; // Childlike pitch
    synth.speak(utterance);
  };

  const playClap = () => {
    if (!soundEnabled) return;
    // In a real app, you'd load a real audio file. For this demo we'll use speech synthesis as a fallback if no audio file exists, or just a simple beep.
    speak("你好厲害！拍拍手！");
  };

  const handleNumberSelect = (num) => {
    // Speak the number first
    speak(num.toString());
    setCurrentNumber(num);
    setView('trace');
  };

  const handleTriggerHero = () => {
    setHeroType(Math.random() > 0.5 ? 'transformer' : 'ultraman');
    setHeroActive(true);
    if (soundEnabled) {
      speak("太棒了！為你拍拍手！繼續加油！");
    }
    setTimeout(() => {
      setHeroActive(false);
    }, 4000);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #fdfbf7 0%, #e0f2f1 100%)',
      position: 'relative'
    }}>
      {/* Simple Header/Controls */}
      <div style={{
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.7)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        zIndex: 10
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#ff7eb3' }}>
          ✨ 數字好好玩 ✨
        </h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: '8px 15px',
              borderRadius: '20px',
              background: soundEnabled ? '#a8edea' : '#fed6e3',
              fontWeight: 'bold',
              color: '#333'
            }}
          >
            {soundEnabled ? '🔊 音效開' : '🔇 音效關'}
          </button>
          {view === 'trace' && (
            <button
              onClick={() => setView('grid')}
              style={{
                padding: '8px 15px',
                borderRadius: '20px',
                background: '#ff9a9e',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              🏠 回到主格
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {view === 'grid' && (
          <NumberGrid 
            onSelectNumber={handleNumberSelect} 
            onTriggerHero={handleTriggerHero}
            soundEnabled={soundEnabled}
            speak={speak}
          />
        )}
        
        {view === 'trace' && (
          <TracingCanvas 
            number={currentNumber} 
            onComplete={() => {
              playClap();
            }}
            soundEnabled={soundEnabled}
            speak={speak}
          />
        )}
      </div>

      {/* Hero Animation Overlay */}
      {heroActive && (
        <HeroAnimation type={heroType} />
      )}
    </div>
  );
}
