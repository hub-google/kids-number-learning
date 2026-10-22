import { useRef, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Star, RefreshCw, CheckCircle2, ChevronLeft, ChevronRight, Home, ArrowRight, Eraser } from 'lucide-react';
import { generateCheckpoints, drawDigitPath, DIGIT_PATHS } from '../utils/strokeData';
import { getRandomScoreTitle } from '../utils/praiseData';
import { advanceTracing, eraseTracing, getTracingScore } from '../utils/tracingLogic';

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
  const bgCanvasRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasAreaRef = useRef(null);
  const activePointerRef = useRef(null);
  const lastPointRef = useRef(null);
  const [isEraser, setIsEraser] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [score, setScore] = useState(null);
  const [scoreTitle, setScoreTitle] = useState('');
  const [dimensions, setDimensions] = useState({ width: 300, height: 400 });

  // The canvases must match the actual drawing area, not the whole page.
  useEffect(() => {
    const canvas = canvasRef.current;
    const bgCanvas = bgCanvasRef.current;
    const area = canvasAreaRef.current;
    if (!canvas || !bgCanvas || !area) return;
    const context = canvas.getContext('2d');
    const bgCtx = bgCanvas.getContext('2d');
    if (!context || !bgCtx) return;

    let lastWidth = 0;
    let lastHeight = 0;
    let lastDpr = 0;
    const resizeCanvas = () => {
      const rect = area.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      const dpr = window.devicePixelRatio || 1;
      if (width < 1 || height < 1) return;
      if (width === lastWidth && height === lastHeight && dpr === lastDpr) return;
      lastWidth = width;
      lastHeight = height;
      lastDpr = dpr;

      for (const el of [canvas, bgCanvas]) {
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        el.width = Math.round(width * dpr);
        el.height = Math.round(height * dpr);
        el.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const cps = generateCheckpoints(number, width, height);
      setCtx(context);
      setDimensions({ width, height });
      setCheckpoints(cps);
      setScore(null);
      setScoreTitle('');
      activePointerRef.current = null;
      lastPointRef.current = null;
      drawGuide(bgCtx, width, height, cps);
    };

    resizeCanvas();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(resizeCanvas);
      observer.observe(area);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [number]);

  const drawGuide = (context, w, h, cps) => {
    if (!context) return;
    context.clearRect(0, 0, w, h);

    // ── 1. 田字格 ──────────────────────────────────────────────
    const padX = w * 0.05;
    const padY = h * 0.05;
    const gridW = w - padX * 2;
    const gridH = h - padY * 2;

    context.save();
    context.strokeStyle = '#d1d5db';
    context.lineWidth = 2.5;
    context.setLineDash([]);
    context.strokeRect(padX, padY, gridW, gridH);

    context.strokeStyle = '#e5e7eb';
    context.lineWidth = 1.2;
    context.setLineDash([7, 7]);
    context.beginPath();
    context.moveTo(padX, padY + gridH / 2);
    context.lineTo(padX + gridW, padY + gridH / 2);
    context.moveTo(padX + gridW / 2, padY);
    context.lineTo(padX + gridW / 2, padY + gridH);
    context.stroke();
    context.setLineDash([]);
    context.restore();

    // ── 2. 數字輪廓 (用貝塞爾曲線畫出正確的數字形狀) ────────────
    const numStr = String(number);
    const digits = numStr.split('');
    const numDigits = digits.length;
    const pX = w * (numDigits === 1 ? 0.18 : 0.06);
    const pY = h * 0.08;
    const useW = w - pX * 2;
    const useH = h - pY * 2;
    const gap = Math.min(16, useW * 0.04);
    const dW = (useW - gap * (numDigits - 1)) / numDigits;

    // Cap stroke width lower for 3-digit numbers to keep proportions
    const guideStrokeW = Math.max(18, Math.min(numDigits >= 3 ? 28 : 38, dW * 0.18));

    // ── Inset: shrink each digit's drawing rect so thick strokes stay inside ──
    const inset = guideStrokeW / 2 + 4; // half stroke + 4px safety

    digits.forEach((digit, dIdx) => {
      const paths = DIGIT_PATHS[digit] || DIGIT_PATHS['0'];
      const baseX = pX + dIdx * (dW + gap);
      const baseY = pY;

      // Apply inset so strokes don't overflow the grid boundary
      const innerX = baseX + inset;
      const innerY = baseY + inset;
      const innerW = dW - inset * 2;
      const innerH = useH - inset * 2;

      paths.forEach((cmds, sIdx) => {
        // Shadow / glow for readability
        context.save();
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = guideStrokeW + 6;
        context.strokeStyle = 'rgba(0,0,0,0.06)';
        context.setLineDash([]);
        drawDigitPath(context, cmds, innerX, innerY, innerW, innerH);
        context.stroke();

        // Main guide line – light blue dashed
        context.lineWidth = guideStrokeW;
        context.strokeStyle = 'rgba(147,197,253,0.75)'; // light blue
        context.setLineDash([guideStrokeW * 0.6, guideStrokeW * 0.5]);
        drawDigitPath(context, cmds, innerX, innerY, innerW, innerH);
        context.stroke();
        context.setLineDash([]);
        context.restore();

        // Start-dot badge with stroke number
        const firstCmd = cmds[0];
        if (firstCmd && firstCmd.cmd === 'M') {
          const bx = innerX + firstCmd.x * innerW;
          const by = innerY + firstCmd.y * innerH;
          const br = Math.max(10, guideStrokeW * 0.55);
          const colors = ['#ef4444', '#f97316', '#8b5cf6'];
          context.save();
          context.beginPath();
          context.arc(bx, by, br, 0, Math.PI * 2);
          context.fillStyle = colors[sIdx % colors.length];
          context.fill();
          context.strokeStyle = '#fff';
          context.lineWidth = 2;
          context.stroke();
          context.fillStyle = '#fff';
          context.font = `bold ${Math.round(br * 1.15)}px system-ui,sans-serif`;
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(String(sIdx + 1), bx, by + 1);
          context.restore();
        }
      });
    });
  };

  const getCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const strokeWidth = Math.max(16, Math.min(38, Math.min(dimensions.width, dimensions.height) * 0.07));
  const hitRadius = Math.max(16, Math.min(30, dimensions.width / String(number).length * 0.16));

  const startDrawing = (e) => {
    if (score !== null || !ctx || activePointerRef.current !== null) return;
    e.preventDefault();
    if (triggerHaptic) triggerHaptic();
    activePointerRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = getCoordinates(e);
    lastPointRef.current = point;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    if (isEraser) {
      setCheckpoints(prev => eraseTracing(prev, point, point, strokeWidth));
    } else {
      setCheckpoints(prev => advanceTracing(prev, point, point, hitRadius));
      ctx.fillStyle = '#ff7eb3';
      ctx.beginPath();
      ctx.arc(point.x, point.y, strokeWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    }
  };

  const draw = (e) => {
    if (activePointerRef.current !== e.pointerId || !ctx) return;
    e.preventDefault();
    const point = getCoordinates(e);
    const previous = lastPointRef.current || point;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(point.x, point.y);
    ctx.lineWidth = isEraser ? strokeWidth * 1.5 : strokeWidth;
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.strokeStyle = '#ff7eb3';
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';

    if (isEraser) {
      setCheckpoints(prev => eraseTracing(prev, previous, point, strokeWidth));
    } else {
      setCheckpoints(prev => advanceTracing(prev, previous, point, hitRadius));
    }
    lastPointRef.current = point;
  };

  const stopDrawing = (e) => {
    if (e && activePointerRef.current !== e.pointerId) return;
    if (e && e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    activePointerRef.current = null;
    lastPointRef.current = null;
    if (ctx) ctx.closePath();
  };

  const handleReset = () => {
    if (triggerHaptic) triggerHaptic();
    if (ctx && canvasRef.current) {
      setScore(null);
      setScoreTitle('');
      const newCps = checkpoints.map(stroke => stroke.map(pt => ({ ...pt, hit: false })));
      setCheckpoints(newCps);
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    }
  };

  const handleDone = () => {
    if (triggerHaptic) triggerHaptic();
    if (score !== null) {
      return;
    }

    const finalScore = getTracingScore(checkpoints);
    setScore(finalScore);
    setScoreTitle(getRandomScoreTitle(finalScore));

    if (finalScore >= 2) {
      if (onComplete) onComplete(finalScore);
      confetti({
        particleCount: 140,
        spread: 80,
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
    // Stop all audio/TTS when navigating
    try {
      const synth = window.speechSynthesis;
      if (synth) synth.cancel();
    } catch (e) { /* ignore */ }
    setScore(null);
    setScoreTitle('');
    if (onNextNumber) onNextNumber();
  };

  const handlePrevClick = () => {
    // Stop all audio/TTS when navigating
    try {
      const synth = window.speechSynthesis;
      if (synth) synth.cancel();
    } catch (e) { /* ignore */ }
    setScore(null);
    setScoreTitle('');
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
          disabled={number >= 1000}
          aria-label="下一個數字"
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            background: number >= 1000 ? '#e0e0e0' : '#ff9a9e',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            opacity: number >= 1000 ? 0.4 : 1,
            cursor: number >= 1000 ? 'not-allowed' : 'pointer',
            border: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
          }}
        >
          下一個 <ChevronRight size={18} />
        </button>
      </div>
      
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
          maxWidth: '360px'
        }}>
          <h2 style={{ color: '#ff7eb3', margin: 0, fontSize: 'clamp(1.5rem, 6vw, 2.2rem)', fontWeight: '900' }}>
            {scoreTitle}
          </h2>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map(star => (
              <Star 
                key={star} 
                size={46} 
                fill={star <= score ? '#f6d365' : '#e0e0e0'} 
                color={star <= score ? '#f6d365' : '#e0e0e0'}
              />
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '6px' }}>
            <button
              onClick={number >= 1000 ? onBackToGrid : handleNextClick}
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
              {number >= 1000 ? '全部完成！回主頁' : `下一個數字 (${number + 1})`} <ArrowRight size={22} />
            </button>

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

      <div ref={canvasAreaRef} style={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        width: '100%',
        borderRadius: '24px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        background: 'white',
        opacity: score !== null ? 0.4 : 1,
        pointerEvents: score !== null ? 'none' : 'auto'
      }}>
        <canvas
          ref={bgCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none'
          }}
        />
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onLostPointerCapture={stopDrawing}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            background: 'transparent',
            touchAction: 'none',
          }}
        />
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        padding: '8px 12px',
        width: '100%',
        maxWidth: '420px',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => {
            if (triggerHaptic) triggerHaptic();
            setIsEraser(!isEraser);
          }}
          aria-label="橡皮擦"
          style={{
            flex: 0.8,
            padding: '12px 12px',
            fontSize: 'clamp(0.9rem, 3.5vw, 1.15rem)',
            borderRadius: '30px',
            background: isEraser ? '#ff9a9e' : '#f8f9fa',
            color: isEraser ? 'white' : '#6c757d',
            fontWeight: 'bold',
            boxShadow: isEraser ? '0 5px 0 #ff7eb3' : '0 5px 0 #dee2e6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            border: 'none'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(4px)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Eraser size={20} /> 擦除
        </button>

        <button
          onClick={handleReset}
          aria-label="重寫"
          style={{
            flex: 1,
            padding: '12px 12px',
            fontSize: 'clamp(0.9rem, 3.5vw, 1.15rem)',
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
          <RefreshCw size={20} /> 重寫
        </button>

        <button
          onClick={handleDone}
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


