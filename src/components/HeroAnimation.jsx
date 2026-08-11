import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function HeroAnimation({ type }) {
  useEffect(() => {
    // Fire confetti when hero appears
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff0000', '#00ff00', '#0000ff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff0000', '#00ff00', '#0000ff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const baseUrl = import.meta.env.BASE_URL || './';
  const heroFileName = type === 'transformer' ? 'transformer.png' : 'ultraman.png';
  const heroImage = baseUrl.endsWith('/') ? `${baseUrl}${heroFileName}` : `${baseUrl}/${heroFileName}`;
  const heroName = type === 'transformer' ? '變形金剛' : '奧特曼';

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(255,255,255,0.88)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      backdropFilter: 'blur(8px)',
      padding: '20px'
    }}>
      
      <div className="animate-bounceIn" style={{ textAlign: 'center', maxWidth: '90%' }}>
        {/* Animated Hero Image */}
        <div 
          className="animate-shake" 
          style={{ 
            animationIterationCount: 'infinite',
            animationDuration: '1s',
            display: 'inline-block'
          }}
        >
          <img 
            src={heroImage} 
            alt={heroName}
            style={{
              width: '100%',
              maxWidth: '220px',
              maxHeight: '30vh',
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))'
            }}
          />
        </div>
        
        {/* Glowing Text */}
        <h2 style={{
          fontSize: 'clamp(1.4rem, 6vw, 2.5rem)',
          color: '#ff6b6b',
          textShadow: '0 0 15px #fecfef, 2px 2px 0px #fff',
          marginTop: '16px',
          marginBottom: '8px',
          fontFamily: "'Comic Sans MS', cursive, sans-serif"
        }}>
          太棒了！{heroName}為你拍拍手！
        </h2>
        
        {/* Clapping Hands */}
        <div style={{ fontSize: 'clamp(36px, 10vw, 56px)', marginTop: '8px' }} className="animate-pop">
          👏👏👏
        </div>
      </div>

    </div>
  );
}

