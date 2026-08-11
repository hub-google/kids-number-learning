import { useRef, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Star, RefreshCw, CheckCircle2 } from 'lucide-react';
import { generateCheckpoints } from '../utils/strokeData';

export default function TracingCanvas({ number, onComplete, soundEnabled, speak, triggerHaptic }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [progress, setProgress] = useState({ strokeIdx: 0, ptIdx: 0 });
  const [score, setScore] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 400 });

  // Initialize Canvas with High-DPI Retina Support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    
    const context = canvas.getContext('2d');

    const resizeCanvas = () => {
      if (containerRef.current && canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Reserve height for floating bottom action bar (approx 70px)
        const cssWidth = rect.width;
        const cssHeight = Math.max(200, rect.height - 80);
        
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;

        canvas.width = cssWidth * dpr;
        canvas.height = cssHeight * dpr;

        context.resetTransform();
        context.scale(dpr, dpr);

        setCtx(context);
        setDimensions({ width: cssWidth, height: cssHeight });

        const cps = generateCheckpoints(number, cssWidth, cssHeight);
        setCheckpoints(cps);
        setProgress({ strokeIdx: 0, ptIdx: 0 });
        setScore(null);
        
        drawGuide(context, cssWidth, cssHeight, cps);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [number]);

  const drawGuide = (context, w, h, cps) => {
    if (!context) return;
    context.clearRect(0, 0, w, h);
    
    const strokeWidth = Math.max(20, Math.min(42, Math.min(w, h) * 0.08));

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = strokeWidth;
    
    cps.forEach((stroke) => {
      context.beginPath();
      context.setLineDash([strokeWidth * 0.4, strokeWidth * 0.6]);
      context.strokeStyle = '#d3e0ea';
      stroke.forEach((pt, idx) => {
        if (idx === 0) context.moveTo(pt.x, pt.y);
        else context.lineTo(pt.x, pt.y);
      });
      context.stroke();
      
      // Draw starting dot
      context.beginPath();
      context.setLineDash([]);
      context.fillStyle = '#ff9a9e';
      context.arc(stroke[0].x, stroke[0].y, strokeWidth * 0.4, 0, Math.PI * 2);
      context.fill();
    });
    
    context.setLineDash([]);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    if (score !== null || !ctx) return;
    if (triggerHaptic) triggerHaptic();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    checkHit(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !ctx) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    
    const strokeWidth = Math.max(20, Math.min(42, Math.min(dimensions.width, dimensions.height) * 0.08));

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#ff7eb3';
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    checkHit(x, y);
  };

  const checkHit = (x, y) => {
    if (progress.strokeIdx >= checkpoints.length) return;
    
    const currentStroke = checkpoints[progress.strokeIdx];
    const targetPt = currentStroke[progress.ptIdx];
    
    const dist = Math.hypot(x - targetPt.x, y - targetPt.y);
    const HIT_RADIUS = Math.max(35, Math.min(60, dimensions.width * 0.12));
    
    if (dist < HIT_RADIUS) {
      const newCheckpoints = [...checkpoints];
      newCheckpoints[progress.strokeIdx][progress.ptIdx].hit = true;
      setCheckpoints(newCheckpoints);
      
      if (progress.ptIdx < currentStroke.length - 1) {
        setProgress({ strokeIdx: progress.strokeIdx, ptIdx: progress.ptIdx + 1 });
      } else {
        setProgress({ strokeIdx: progress.strokeIdx + 1, ptIdx: 0 });
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (ctx) ctx.closePath();
  };

  const handleReset = () => {
    if (triggerHaptic) triggerHaptic();
    if (ctx && canvasRef.current) {
      setProgress({ strokeIdx: 0, ptIdx: 0 });
      setScore(null);
      const newCps = checkpoints.map(stroke => stroke.map(pt => ({ ...pt, hit: false })));
      setCheckpoints(newCps);
      drawGuide(ctx, dimensions.width, dimensions.height, newCps);
    }
  };

  const handleDone = () => {
    if (triggerHaptic) triggerHaptic();
    if (score !== null) {
      onComplete();
      return;
    }

    let totalPts = 0;
    let hitPts = 0;
    checkpoints.forEach(stroke => {
      stroke.forEach(pt => {
        totalPts++;
        if (pt.hit) hitPts++;
      });
    });

    const hitRatio = totalPts === 0 ? 0 : hitPts / totalPts;
    let finalScore = 1;
    if (hitRatio > 0.75) finalScore = 3;
    else if (hitRatio > 0.35) finalScore = 2;
    
    setScore(finalScore);

    if (finalScore >= 2) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff9a9e', '#fecfef', '#a1c4fd', '#f6d365']
      });
    } else {
      if (soundEnabled && speak) {
        speak("哎呀，差一點點，再試一次吧！");
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        position: 'relative',
        padding: '10px 10px calc(10px + var(--safe-bottom)) 10px'
      }}
    >
      
      {/* Celebration / Score Overlay Modal */}
      {score !== null && (
        <div style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.96)',
          padding: '24px 36px',
          borderRadius: '28px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          zIndex: 30,
          width: '85%',
          maxWidth: '340px',
          animation: 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <h2 style={{ color: '#ff7eb3', margin: 0, fontSize: 'clamp(1.5rem, 6vw, 2.2rem)', fontWeight: '900' }}>
            {score === 3 ? '太棒了！' : score === 2 ? '不錯喔！' : '再試一次！'}
          </h2>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map(star => (
              <Star 
                key={star} 
                size={48} 
                fill={star <= score ? '#f6d365' : '#e0e0e0'} 
                color={star <= score ? '#f6d365' : '#e0e0e0'}
                style={{ 
                  animation: star <= score ? `pulse 1s ease-in-out ${star * 0.15}s infinite` : 'none' 
                }}
              />
            ))}
          </div>

          <button
            onClick={score === 3 ? onComplete : handleReset}
            style={{
              marginTop: '8px',
              padding: '10px 24px',
              fontSize: '18px',
              borderRadius: '25px',
              background: score === 3 ? '#a1c4fd' : '#ffecd2',
              color: score === 3 ? 'white' : '#fcb69f',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
            }}
          >
            {score === 3 ? '🎉 完成' : '🔄 重新挑戰'}
          </button>
        </div>
      )}

      {/* Drawing Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
        style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
          touchAction: 'none',
          opacity: score !== null ? 0.4 : 1,
          pointerEvents: score !== null ? 'none' : 'auto',
          flex: 1
        }}
      />

      {/* Floating Action Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        padding: '8px 12px',
        width: '100%',
        maxWidth: '420px',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleReset}
          aria-label="擦掉重寫"
          style={{
            flex: 1,
            padding: '12px 18px',
            fontSize: 'clamp(1rem, 4vw, 1.25rem)',
            borderRadius: '30px',
            background: '#ffecd2',
            color: '#fcb69f',
            fontWeight: 'bold',
            boxShadow: '0 5px 0 #fcb69f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(4px)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <RefreshCw size={20} /> 擦掉重寫
        </button>

        <button
          onClick={handleDone}
          className="animate-bounceIn"
          aria-label="寫好了"
          style={{
            flex: 1.2,
            padding: '12px 22px',
            fontSize: 'clamp(1rem, 4vw, 1.25rem)',
            borderRadius: '30px',
            background: '#a1c4fd',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 5px 0 #7ca2ed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(4px)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <CheckCircle2 size={22} /> 寫好了！
        </button>
      </div>

    </div>
  );
}

