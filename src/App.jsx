import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Home, RotateCw } from 'lucide-react';
import NumberGrid from './components/NumberGrid';
import TracingCanvas from './components/TracingCanvas';
import HeroAnimation from './components/HeroAnimation';
import { getRandomClap, getRandomHeroPraise } from './utils/praiseData';

export default function App() {
  const [view, setView] = useState('grid'); // 'grid' or 'trace'
  const [currentNumber, setCurrentNumber] = useState(null);
  const [heroActive, setHeroActive] = useState(false);
  const [heroType, setHeroType] = useState('transformer'); // 'transformer' or 'ultraman'
  const [heroPraiseText, setHeroPraiseText] = useState('');

  // Global settings
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Track active audio instances so we can stop them on navigation
  const activeAudiosRef = useRef([]);
  const heroTimeoutRef = useRef(null);

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

  const speak = useCallback((text) => {
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
  }, [soundEnabled]);

  // Stop ALL currently playing audio & TTS
  const stopAllAudio = useCallback(() => {
    try {
      // Stop TTS
      const synth = window.speechSynthesis;
      if (synth) synth.cancel();
    } catch (e) { /* ignore */ }
    // Stop all tracked Audio instances
    activeAudiosRef.current.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) { /* ignore */ }
    });
    activeAudiosRef.current = [];
  }, []);

  // Play a tracked audio file (so we can stop it later)
  const playTrackedAudio = useCallback((url) => {
    const audio = new Audio(url);
    activeAudiosRef.current.push(audio);
    audio.addEventListener('ended', () => {
      activeAudiosRef.current = activeAudiosRef.current.filter(a => a !== audio);
    });
    audio.play().catch(() => {});
    return audio;
  }, []);

  const getAssetUrl = (fileName) => {
    const baseUrl = import.meta.env.BASE_URL || './';
    return baseUrl.endsWith('/') ? `${baseUrl}${fileName}` : `${baseUrl}/${fileName}`;
  };

  const playClap = useCallback(() => {
    if (!soundEnabled) return;
    playTrackedAudio(getAssetUrl('clap.mp3'));
    const praise = getRandomClap();
    speak(praise.text);
  }, [soundEnabled, speak, playTrackedAudio]);

  const handleNumberSelect = (num) => {
    triggerHaptic();
    speak(num.toString());
    setCurrentNumber(num);
    setView('trace');
  };

  const handleNextNumber = () => {
    stopAllAudio();
    triggerHaptic();
    // Also dismiss hero if active
    if (heroActive) {
      setHeroActive(false);
      if (heroTimeoutRef.current) clearTimeout(heroTimeoutRef.current);
    }
    const nextNum = (currentNumber || 1) + 1;
    setCurrentNumber(nextNum);
    speak(nextNum.toString());
  };

  const handlePrevNumber = () => {
    if (!currentNumber || currentNumber <= 1) return;
    stopAllAudio();
    triggerHaptic();
    // Also dismiss hero if active
    if (heroActive) {
      setHeroActive(false);
      if (heroTimeoutRef.current) clearTimeout(heroTimeoutRef.current);
    }
    const prevNum = currentNumber - 1;
    setCurrentNumber(prevNum);
    speak(prevNum.toString());
  };

  const handleBackToGrid = () => {
    triggerHaptic();
    setView('grid');
  };

  const handleDismissHero = useCallback(() => {
    setHeroActive(false);
    stopAllAudio();
    if (heroTimeoutRef.current) {
      clearTimeout(heroTimeoutRef.current);
      heroTimeoutRef.current = null;
    }
  }, [stopAllAudio]);

  const handleTriggerHero = () => {
    const hero = Math.random() > 0.5 ? 'transformer' : 'ultraman';
    setHeroType(hero);
    triggerHaptic();

    // Pick a random praise for this hero
    const praise = getRandomHeroPraise(hero);
    setHeroPraiseText(praise.display || praise.text);

    setHeroActive(true);

    if (soundEnabled) {
      playTrackedAudio(getAssetUrl('cheer.mp3'));
      speak(praise.text);
    }

    // Clear previous timeout
    if (heroTimeoutRef.current) clearTimeout(heroTimeoutRef.current);
    heroTimeoutRef.current = setTimeout(() => {
      setHeroActive(false);
      heroTimeoutRef.current = null;
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
        <HeroAnimation
          type={heroType}
          praiseText={heroPraiseText}
          onDismiss={handleDismissHero}
        />
      )}
    </div>
  );
}

