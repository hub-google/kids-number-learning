import { useRef, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Star } from 'lucide-react';
import { generateCheckpoints } from '../utils/strokeData';

export default function TracingCanvas({ number, onComplete, soundEnabled, speak }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [progress, setProgress] = useState({ strokeIdx: 0, ptIdx: 0 });
  const [score, setScore] = useState(null);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    setCtx(context);

    const resizeCanvas = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.offsetWidth;
        canvas.height = containerRef.current.offsetHeight - 80;
        
        const cps = generateCheckpoints(number, canvas.width, canvas.height);
        setCheckpoints(cps);
        setProgress({ strokeIdx: 0, ptIdx: 0 });
        setScore(null);
        drawGuide(context, canvas.width, canvas.height, cps);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [number]);

  const drawGuide = (context, w, h, cps) => {
    context.clearRect(0, 0, w, h);
    
    // Draw standard dashed paths based on checkpoints
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 40;
    
    cps.forEach((stroke) => {
      context.beginPath();
      context.setLineDash([15, 25]);
      context.strokeStyle = '#d3e0ea';
      stroke.forEach((pt, idx) => {
        if (idx === 0) context.moveTo(pt.x, pt.y);
        else context.lineTo(pt.x, pt.y);
      });
      context.stroke();
      
      // Draw a small starting dot for the very first point of each stroke to guide the kid
      context.beginPath();
      context.setLineDash([]);
      context.fillStyle = '#ff9a9e';
      context.arc(stroke[0].x, stroke[0].y, 15, 0, Math.PI * 2);
      context.fill();
    });
    
    context.setLineDash([]); // Reset dash for user drawing
  };

  const startDrawing = (e) => {
    e.preventDefault();
    if (score !== null) return; // Don't draw if already scored
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    checkHit(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#ff7eb3';
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    checkHit(x, y);
  };

  const checkHit = (x, y) => {
    if (progress.strokeIdx >= checkpoints.length) return; // All done
    
    const currentStroke = checkpoints[progress.strokeIdx];
    const targetPt = currentStroke[progress.ptIdx];
    
    const dist = Math.hypot(x - targetPt.x, y - targetPt.y);
    const HIT_RADIUS = 50; // generous radius for kids
    
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

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
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

  const handleReset = () => {
    if (ctx && canvasRef.current) {
      setProgress({ strokeIdx: 0, ptIdx: 0 });
      setScore(null);
      const newCps = checkpoints.map(stroke => stroke.map(pt => ({ ...pt, hit: false })));
      setCheckpoints(newCps);
      drawGuide(ctx, canvasRef.current.width, canvasRef.current.height, newCps);
    }
  };

  const handleDone = () => {
    if (score !== null) {
      // Already scored, this acts as a "next" button if handled by parent
      // but parent handles next by just closing view, so we just trigger onComplete
      onComplete();
      return;
    }

    // Calculate score based on checkpoints hit
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
    if (hitRatio > 0.8) finalScore = 3;
    else if (hitRatio > 0.4) finalScore = 2;
    
    setScore(finalScore);

    if (finalScore >= 2) {
      confetti({
        particleCount: 150,
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
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      
      {score !== null && (
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '30px 50px',
          borderRadius: '30px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          zIndex: 20,
          animation: 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <h2 style={{ color: '#ff7eb3', margin: 0, fontSize: '32px' }}>
            {score === 3 ? '太棒了！' : score === 2 ? '不錯喔！' : '再試一次！'}
          </h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[1, 2, 3].map(star => (
              <Star 
                key={star} 
                size={60} 
                fill={star <= score ? '#f6d365' : '#e0e0e0'} 
                color={star <= score ? '#f6d365' : '#e0e0e0'}
                style={{ 
                  animation: star <= score ? `pulse 1s ease-in-out ${star * 0.1}s infinite` : 'none' 
                }}
              />
            ))}
          </div>
          <button
            onClick={score === 3 ? onComplete : handleReset}
            style={{
              marginTop: '10px',
              padding: '12px 30px',
              fontSize: '20px',
              borderRadius: '30px',
              background: score === 3 ? '#a1c4fd' : '#ffecd2',
              color: score === 3 ? 'white' : '#fcb69f',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {score === 3 ? '完成' : '重新挑戰'}
          </button>
        </div>
      )}

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
          borderRadius: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          margin: '20px',
          touchAction: 'none',
          opacity: score !== null ? 0.5 : 1,
          pointerEvents: score !== null ? 'none' : 'auto'
        }}
      />

      <div style={{ display: 'flex', gap: '20px', padding: '10px' }}>
        <button
          onClick={handleReset}
          style={{
            padding: '15px 30px',
            fontSize: '24px',
            borderRadius: '40px',
            background: '#ffecd2',
            color: '#fcb69f',
            border: 'none',
            fontWeight: 'bold',
            boxShadow: '0 6px 0 #fcb69f',
            cursor: 'pointer'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(6px)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          🧹 擦掉重寫
        </button>

        <button
          onClick={handleDone}
          className="animate-bounceIn"
          style={{
            padding: '15px 40px',
            fontSize: '24px',
            borderRadius: '40px',
            background: '#a1c4fd',
            color: 'white',
            border: 'none',
            fontWeight: 'bold',
            boxShadow: '0 6px 0 #7ca2ed',
            cursor: 'pointer'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(6px)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          ✨ 寫好了！
        </button>
      </div>
    </div>
  );
}
