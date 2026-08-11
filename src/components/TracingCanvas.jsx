import { useRef, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export default function TracingCanvas({ number, onComplete, soundEnabled, speak }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    setCtx(context);

    // Set canvas size to fill container
    const resizeCanvas = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.offsetWidth;
        canvas.height = containerRef.current.offsetHeight - 80; // Leave space for toolbar
        drawGuide(context, canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [number]);

  const drawGuide = (context, w, h) => {
    context.clearRect(0, 0, w, h);
    context.font = `bold ${Math.min(w, h) * 0.8}px 'Nunito', 'Comic Sans MS', sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Draw dashed outline guide
    context.setLineDash([15, 15]);
    context.lineWidth = 10;
    context.strokeStyle = '#d3e0ea';
    context.strokeText(number.toString(), w / 2, h / 2);
    context.setLineDash([]); // Reset dash for user drawing
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    
    // Dynamic color: use a vibrant stroke
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#ff7eb3'; // Vibrant macaron color
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    ctx.closePath();
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
      drawGuide(ctx, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleErase = () => {
    // A simple erase could just set globalCompositeOperation to 'destination-out'
    // But then they'd erase the guide too. It's easier to just reset the whole canvas.
    handleReset();
  };

  const handleDone = () => {
    // Confetti effect
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff9a9e', '#fecfef', '#a1c4fd', '#f6d365']
    });
    onComplete();
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
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
          touchAction: 'none' // Prevent scrolling while tracing
        }}
      />

      <div style={{ display: 'flex', gap: '20px', padding: '10px' }}>
        <button
          onClick={handleErase}
          style={{
            padding: '15px 30px',
            fontSize: '24px',
            borderRadius: '40px',
            background: '#ffecd2',
            color: '#fcb69f',
            fontWeight: 'bold',
            boxShadow: '0 6px 0 #fcb69f'
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
            fontWeight: 'bold',
            boxShadow: '0 6px 0 #7ca2ed'
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
