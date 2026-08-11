import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Home, RotateCw } from 'lucide-react';
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

  // Background Auto-Update Check
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.version) {
          const localVer = localStorage.getItem('app_version');
          if (localVer && localVer !== data.version) {
            localStorage.setItem('app_version', data.version);
            const url = new URL(window.location.href);
            url.searchParams.set('_v', data.version);
            window.location.replace(url.toString());
          } else {
            localStorage.setItem('app_version', data.version);
          }
        }
      } catch (e) {
        // Ignore network check failure
      }
    };

    checkVersion();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    const interval = setInterval(checkVersion, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(20);
      } catch (e) {
        // ignore if not supported or restricted
      }
    }
  };

  const speak = (text) => {
    if (!soundEnabled) return;
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel(); // cancel pending speeches
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-TW';
      utterance.rate = 0.9;
      utterance.pitch = 1.2; // Childlike pitch
      synth.speak(utterance);
    } catch (e) {
      // ignore TTS failures
    }
  };

  const getAssetUrl = (fileName) => {
    const baseUrl = import.meta.env.BASE_URL || './';
    return baseUrl.endsWith('/') ? `${baseUrl}${fileName}` : `${baseUrl}/${fileName}`;
  };

  const playClap = () => {
    if (!soundEnabled) return;
    const audio = new Audio(getAssetUrl('clap.mp3'));
    audio.play().catch(() => {
      // ignore if audio file not found
    });
    speak("你好厲害！拍拍手！");
  };

  const handleNumberSelect = (num) => {
    triggerHaptic();
    speak(num.toString());
    setCurrentNumber(num);
    setView('trace');
  };

  const handleNextNumber = () => {
    triggerHaptic();
    const nextNum = (currentNumber || 1) + 1;
    setCurrentNumber(nextNum);
    speak(nextNum.toString());
  };

  const handlePrevNumber = () => {
    if (!currentNumber || currentNumber <= 1) return;
    triggerHaptic();
    const prevNum = currentNumber - 1;
    setCurrentNumber(prevNum);
    speak(prevNum.toString());
  };

  const handleBackToGrid = () => {
    triggerHaptic();
    setView('grid');
  };

  const handleTriggerHero = () => {
    const hero = Math.random() > 0.5 ? 'transformer' : 'ultraman';
    setHeroType(hero);
    setHeroActive(true);
    triggerHaptic();
    if (soundEnabled) {
      const audio = new Audio(getAssetUrl('cheer.mp3'));
      audio.play().catch(() => {});
      
      const heroName = hero === 'transformer' ? '變形金剛' : '奧特曼';
      speak(`太棒了！${heroName}為你拍拍手！繼續加油！`);
    }
    setTimeout(() => {
      setHeroActive(false);
    }, 4000);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #fdfbf7 0%, #e0f2f1 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Mobile Responsive Header */}
      <header style={{
        paddingTop: 'calc(10px + var(--safe-top))',
        paddingBottom: '10px',
        paddingLeft: '16px',
        paddingRight: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        zIndex: 10,
        flexShrink: 0
      }}>
        <h1 style={{
          margin: 0,
          fontSize: 'clamp(1.1rem, 4.5vw, 1.6rem)',
          color: '#ff7eb3',
          fontWeight: '900',
          letterSpacing: '0.5px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          ✨ 數字好好玩 ✨
        </h1>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={() => {
              triggerHaptic();
              const url = new URL(window.location.href);
              url.searchParams.set('_v', Date.now().toString());
              if ('caches' in window) {
                caches.keys().then((names) => {
                  names.forEach((name) => caches.delete(name));
                });
              }
              window.location.replace(url.toString());
            }}
            aria-label="刷新最新版"
            style={{
              padding: '6px 10px',
              borderRadius: '20px',
              background: '#e0c3fc',
              fontWeight: 'bold',
              fontSize: 'clamp(0.75rem, 3vw, 0.9rem)',
              color: '#4a154b',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <RotateCw size={15} />
            <span>刷新</span>
          </button>

          <button 
            onClick={() => {
              triggerHaptic();
              setSoundEnabled(!soundEnabled);
            }}
            aria-label={soundEnabled ? '關閉音效' : '開啟音效'}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              background: soundEnabled ? '#a8edea' : '#fed6e3',
              fontWeight: 'bold',
              fontSize: 'clamp(0.8rem, 3.2vw, 0.95rem)',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />} 
            <span>{soundEnabled ? '音效開' : '音效關'}</span>
          </button>

          {view === 'trace' && (
            <button
              onClick={handleBackToGrid}
              aria-label="回到主頁格"
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                background: '#ff9a9e',
                color: 'white',
                fontWeight: 'bold',
                fontSize: 'clamp(0.8rem, 3.2vw, 0.95rem)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Home size={18} /> <span>主格</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden', width: '100%', display: 'flex' }}>
        {view === 'grid' && (
          <NumberGrid 
            onSelectNumber={handleNumberSelect} 
            onTriggerHero={handleTriggerHero}
            soundEnabled={soundEnabled}
            speak={speak}
            triggerHaptic={triggerHaptic}
          />
        )}
        
        {view === 'trace' && (
          <TracingCanvas 
            number={currentNumber} 
            onComplete={(finalScore) => {
              playClap();
              if (finalScore === 3) {
                setTimeout(() => {
                  handleTriggerHero();
                }, 1200);
              }
            }}
            onNextNumber={handleNextNumber}
            onPrevNumber={handlePrevNumber}
            onBackToGrid={handleBackToGrid}
            soundEnabled={soundEnabled}
            speak={speak}
            triggerHaptic={triggerHaptic}
          />
        )}
      </main>

      {/* Hero Animation Overlay */}
      {heroActive && (
        <HeroAnimation type={heroType} />
      )}
    </div>
  );
}

