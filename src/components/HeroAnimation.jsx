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

  const heroEmoji = type === 'transformer' ? '🤖' : '🦸‍♂️';
  const heroName = type === 'transformer' ? '變形金剛' : '奧特曼';

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(255,255,255,0.8)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      backdropFilter: 'blur(5px)'
    }}>
      
      <div className="animate-bounceIn" style={{ textAlign: 'center' }}>
        {/* Animated Hero Icon */}
        <div 
          className="animate-shake" 
          style={{ 
            fontSize: '150px', 
            textShadow: '0 10px 30px rgba(0,0,0,0.2)',
            animationIterationCount: 'infinite',
            animationDuration: '1s'
          }}
        >
          {heroEmoji}
        </div>
        
        {/* Glowing Text */}
        <h2 style={{
          fontSize: '48px',
          color: '#ff6b6b',
          textShadow: '0 0 20px #fecfef, 2px 2px 0px #fff',
          marginTop: '20px',
          fontFamily: "'Comic Sans MS', cursive, sans-serif"
        }}>
          太棒了！{heroName}為你拍拍手！
        </h2>
        
        {/* Clapping Hands */}
        <div style={{ fontSize: '60px', marginTop: '10px' }} className="animate-pop">
          👏👏👏
        </div>
      </div>

    </div>
  );
}
