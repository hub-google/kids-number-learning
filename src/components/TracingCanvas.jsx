import { useRef, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Star, RefreshCw, CheckCircle2, ChevronLeft, ChevronRight, Home, ArrowRight } from 'lucide-react';
import { generateCheckpoints } from '../utils/strokeData';

export default function TracingCanvas({
  number,
  onComplete,
  onNextNumber,
  onPrevNumber,
  onBackToGrid,
  soundEnabled,
  speak,
  triggerHaptic
}) {
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
        
        // Reserve height for top nav bar (~40px) & bottom action bar (~70px)
        const cssWidth = rect.width;
        const cssHeight = Math.max(180, rect.height - 120);
        
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
      if (onComplete) onComplete();
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

  const handleNextClick = () => {
    setScore(null);
    if (onNextNumber) onNextNumber();
  };

  const handlePrevClick = () => {
    setScore(null);
    if (onPrevNumber) onPrevNumber();
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
        padding: '6px 10px calc(10px + var(--safe-bottom)) 10px'
      }}
    >
      {/* Top Number Navigation Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '420px',
        padding: '4px 8px'
      }}>
        <button
          onClick={handlePrevClick}
          disabled={number <= 1}
          aria-label="上一個數字"
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            background: number <= 1 ? '#e0e0e0' : '#ff9a9e',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            opacity: number <= 1 ? 0.4 : 1,
            cursor: number <= 1 ? 'not-allowed' : 'pointer',
            border: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
          }}
        >
          <ChevronLeft size={18} /> 上一個
        </button>

        <div style={{
          fontSize: 'clamp(1.2rem, 5vw, 1.6rem)',
          fontWeight: '900',
          color: '#ff7eb3',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '4px 18px',
          borderRadius: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          數字 {number}
        </div>

        <button
          onClick={handleNextClick}
          aria-label="下一個數字"
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            background: '#ff9a9e',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            cursor: 'pointer',
            border: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
          }}
        >
          下一個 <ChevronRight size={18} />
        </button>
      </div>
      
      {/* Celebration / Score Overlay Modal */}
      {score !== null && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.98)',
          padding: '24px 28px',
          borderRadius: '28px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          zIndex: 30,
          width: '90%',
          maxWidth: '360px',
          animation: 'bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <h2 style={{ color: '#ff7eb3', margin: 0, fontSize: 'clamp(1.5rem, 6vw, 2.2rem)', fontWeight: '900' }}>
            {score === 3 ? '🎉 太棒了！' : score === 2 ? '👍 不錯喔！' : '💪 再試一次！'}
          </h2>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map(star => (
              <Star 
                key={star} 
                size={46} 
                fill={star <= score ? '#f6d365' : '#e0e0e0'} 
                color={star <= score ? '#f6d365' : '#e0e0e0'}
                style={{ 
                  animation: star <= score ? `pulse 1s ease-in-out ${star * 0.15}s infinite` : 'none' 
                }}
              />
            ))}
          </div>

          {/* Action Buttons in Modal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '6px' }}>
            {/* Primary Action Button: Next Number */}
            <button
              onClick={handleNextClick}
              style={{
                width: '100%',
                padding: '12px 20px',
                fontSize: '18px',
                borderRadius: '25px',
                background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
                color: '#2b508e',
                border: 'none',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(161, 196, 253, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              下一個數字 ({number + 1}) <ArrowRight size={22} />
            </button>

            {/* Secondary Action Row */}
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                onClick={handleReset}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  fontSize: '14px',
                  borderRadius: '20px',
                  background: '#ffecd2',
                  color: '#d97746',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <RefreshCw size={16} /> 再寫一次
              </button>

              {number > 1 && (
                <button
                  onClick={handlePrevClick}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    fontSize: '14px',
                    borderRadius: '20px',
                    background: '#f0f4f8',
                    color: '#555',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <ChevronLeft size={16} /> 上一個 ({number - 1})
                </button>
              )}

              <button
                onClick={() => {
                  setScore(null);
                  if (onBackToGrid) onBackToGrid();
                }}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  fontSize: '14px',
                  borderRadius: '20px',
                  background: '#ffe5ec',
                  color: '#ff4d6d',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Home size={16} /> 主頁
              </button>
            </div>
          </div>
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
            gap: '6px',
            border: 'none'
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
            gap: '6px',
            border: 'none'
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


