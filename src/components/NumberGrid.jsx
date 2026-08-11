import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NumberGrid({ onSelectNumber, onTriggerHero, soundEnabled, speak, triggerHaptic }) {
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(1000);
  const [currentRowStart, setCurrentRowStart] = useState(1);
  const [rowsNavigated, setRowsNavigated] = useState(0);

  // Responsive screen detection
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset current view start when range start changes
  useEffect(() => {
    setCurrentRowStart(start);
  }, [start]);

  // Numbers per page depending on screen width
  // Desktop: 2 rows of 10 = 20 numbers
  // Mobile: 2 rows of 5 = 10 numbers (or 4 rows of 5 = 20 numbers).
  // Let's use 20 numbers per page (Desktop: 2 rows x 10 cols; Mobile: 4 rows x 5 cols) for consistent chunking!
  const numbersPerPage = 20;
  const cols = isMobile ? 5 : 10;

  // Navigate forward
  const handleNextPage = () => {
    if (currentRowStart + numbersPerPage <= end) {
      if (triggerHaptic) triggerHaptic();
      const nextStart = currentRowStart + numbersPerPage;
      setCurrentRowStart(nextStart);
      const newCount = rowsNavigated + (numbersPerPage / 10);
      setRowsNavigated(newCount);
      if (Math.floor(newCount / 3) > Math.floor(rowsNavigated / 3)) {
        onTriggerHero();
      }
    }
  };

  // Navigate backward
  const handlePrevPage = () => {
    if (currentRowStart - numbersPerPage >= start) {
      if (triggerHaptic) triggerHaptic();
      setCurrentRowStart(prev => prev - numbersPerPage);
      const newCount = rowsNavigated + (numbersPerPage / 10);
      setRowsNavigated(newCount);
      if (Math.floor(newCount / 3) > Math.floor(rowsNavigated / 3)) {
        onTriggerHero();
      }
    }
  };

  // Touch Swipe Gesture Handling
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;
    touchStartX.current = null;

    if (diffX > 50) {
      // Swiped Left -> Next
      handleNextPage();
    } else if (diffX < -50) {
      // Swiped Right -> Prev
      handlePrevPage();
    }
  };

  const totalNumbers = Math.max(0, end - start + 1);
  const totalPages = Math.ceil(totalNumbers / numbersPerPage);
  const currentPage = Math.floor((currentRowStart - start) / numbersPerPage) + 1;

  // Generate current page's numbers
  const pageNumbers = Array.from({ length: numbersPerPage }, (_, i) => currentRowStart + i).filter(n => n <= end);

  // Group page numbers into rows based on column count
  const rows = [];
  for (let i = 0; i < pageNumbers.length; i += cols) {
    rows.push(pageNumbers.slice(i, i + cols));
  }

  const handlePreset = (presetStart, presetEnd) => {
    if (triggerHaptic) triggerHaptic();
    setStart(presetStart);
    setEnd(presetEnd);
    setCurrentRowStart(presetStart);
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '10px 12px calc(12px + var(--safe-bottom)) 12px',
        overflowY: 'auto'
      }}
    >
      
      {/* Config Bar & Quick Presets */}
      <div style={{
        width: '100%',
        maxWidth: '720px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '20px',
        padding: '8px 14px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center',
        flexShrink: 0
      }}>
        {/* Preset Range Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ff7eb3', alignSelf: 'center' }}>快速選題:</span>
          {[
            { label: '1~50', s: 1, e: 50 },
            { label: '1~100', s: 1, e: 100 },
            { label: '1~500', s: 1, e: 500 },
            { label: '1~1000', s: 1, e: 1000 }
          ].map(p => (
            <button
              key={p.label}
              onClick={() => handlePreset(p.s, p.e)}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                background: (start === p.s && end === p.e) ? '#ff9a9e' : '#f0f4f8',
                color: (start === p.s && end === p.e) ? 'white' : '#555',
                boxShadow: (start === p.s && end === p.e) ? '0 2px 6px rgba(255,154,158,0.4)' : 'none'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Inputs & Jump Select */}
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          <label style={{ color: '#ff9a9e', display: 'flex', alignItems: 'center', gap: '4px' }}>
            從:
            <input 
              type="number" 
              value={start} 
              onChange={(e) => setStart(Number(e.target.value) || 1)} 
              style={{ width: '60px', borderRadius: '10px', border: '2px solid #fecfef', padding: '3px 6px', textAlign: 'center', fontSize: '15px', fontWeight: 'bold', outline: 'none' }}
            />
          </label>

          <label style={{ color: '#ff9a9e', display: 'flex', alignItems: 'center', gap: '4px' }}>
            到:
            <input 
              type="number" 
              value={end} 
              onChange={(e) => setEnd(Number(e.target.value) || 1000)} 
              style={{ width: '65px', borderRadius: '10px', border: '2px solid #fecfef', padding: '3px 6px', textAlign: 'center', fontSize: '15px', fontWeight: 'bold', outline: 'none' }}
            />
          </label>

          <label style={{ color: '#667eea', display: 'flex', alignItems: 'center', gap: '4px' }}>
            跳頁:
            <select 
              value={currentRowStart} 
              onChange={(e) => {
                if (triggerHaptic) triggerHaptic();
                setCurrentRowStart(Number(e.target.value));
              }}
              style={{ borderRadius: '10px', border: '2px solid #a1c4fd', padding: '3px 6px', fontSize: '14px', fontWeight: 'bold', background: 'white', outline: 'none' }}
            >
              {Array.from({ length: totalPages }, (_, i) => {
                const pStart = start + i * numbersPerPage;
                const pEnd = Math.min(pStart + numbersPerPage - 1, end);
                return (
                  <option key={pStart} value={pStart}>
                    第 {i + 1} 頁 ({pStart} ~ {pEnd})
                  </option>
                );
              })}
            </select>
          </label>
        </div>
      </div>

      {/* Grid Container with Responsive Column Support */}
      <div style={{
        width: '100%',
        maxWidth: '840px',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 0'
      }}>
        
        {/* Previous Page Button (Side on desktop, inside container on mobile) */}
        {!isMobile && (
          <button 
            onClick={handlePrevPage} 
            disabled={currentRowStart <= start}
            aria-label="上一頁"
            style={{
              fontSize: '32px',
              background: currentRowStart <= start ? '#e0e0e0' : '#ff9a9e',
              color: 'white',
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              cursor: currentRowStart <= start ? 'not-allowed' : 'pointer',
              opacity: currentRowStart <= start ? 0.4 : 1,
              flexShrink: 0,
              marginRight: '12px'
            }}
          >
            <ChevronLeft size={36} />
          </button>
        )}

        {/* Rows of Number Cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '8px' : '12px',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {rows.map((rowNumbers, rowIdx) => (
            <div 
              key={rowIdx} 
              style={{
                display: 'flex',
                gap: isMobile ? '6px' : '10px',
                justifyContent: 'center',
                width: '100%',
                maxWidth: isMobile ? '380px' : '720px'
              }}
            >
              {rowNumbers.map(num => (
                <button
                  key={num}
                  onClick={() => onSelectNumber(num)}
                  className="animate-pop"
                  style={{
                    flex: '1 1 0px',
                    minWidth: isMobile ? '48px' : '58px',
                    maxWidth: isMobile ? '68px' : '72px',
                    height: isMobile ? '56px' : '68px',
                    fontSize: num > 999 ? '18px' : num > 99 ? (isMobile ? '20px' : '24px') : (isMobile ? '24px' : '32px'),
                    fontWeight: '900',
                    background: 'white',
                    border: `3px solid ${rowIdx % 2 === 0 ? '#a1c4fd' : '#c2e9fb'}`,
                    borderRadius: isMobile ? '14px' : '18px',
                    color: '#444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 ${isMobile ? 3 : 5}px 0 ${rowIdx % 2 === 0 ? '#a1c4fd' : '#c2e9fb'}`,
                    cursor: 'pointer',
                    transition: 'transform 0.1s, box-shadow 0.1s'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(3px)';
                    e.currentTarget.style.boxShadow = '0 0px 0 transparent';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 ${isMobile ? 3 : 5}px 0 ${rowIdx % 2 === 0 ? '#a1c4fd' : '#c2e9fb'}`;
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.transform = 'translateY(3px)';
                    e.currentTarget.style.boxShadow = '0 0px 0 transparent';
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 ${isMobile ? 3 : 5}px 0 ${rowIdx % 2 === 0 ? '#a1c4fd' : '#c2e9fb'}`;
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Next Page Button (Side on desktop) */}
        {!isMobile && (
          <button 
            onClick={handleNextPage}
            disabled={currentRowStart + numbersPerPage > end}
            aria-label="下一頁"
            style={{
              fontSize: '32px',
              background: currentRowStart + numbersPerPage > end ? '#e0e0e0' : '#ff9a9e',
              color: 'white',
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              cursor: currentRowStart + numbersPerPage > end ? 'not-allowed' : 'pointer',
              opacity: currentRowStart + numbersPerPage > end ? 0.4 : 1,
              flexShrink: 0,
              marginLeft: '12px'
            }}
          >
            <ChevronRight size={36} />
          </button>
        )}

      </div>

      {/* Mobile Navigation Controls & Page Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '420px',
        marginTop: '4px',
        flexShrink: 0
      }}>
        {/* Prev Mobile Arrow */}
        <button 
          onClick={handlePrevPage} 
          disabled={currentRowStart <= start}
          aria-label="上一頁"
          style={{
            padding: '8px 16px',
            borderRadius: '25px',
            background: currentRowStart <= start ? '#e0e0e0' : '#ff9a9e',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            opacity: currentRowStart <= start ? 0.4 : 1,
            boxShadow: '0 3px 8px rgba(0,0,0,0.1)'
          }}
        >
          <ChevronLeft size={20} /> 上一頁
        </button>

        {/* Page Badge */}
        <div style={{
          fontSize: 'clamp(12px, 3.5vw, 15px)',
          fontWeight: '900',
          color: '#667eea',
          background: 'rgba(255,255,255,0.9)',
          padding: '6px 14px',
          borderRadius: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          whiteSpace: 'nowrap'
        }}>
          第 {currentPage} / {totalPages || 1} 頁 {isMobile && <span style={{ fontSize: '11px', opacity: 0.7 }}>(左右滑動)</span>}
        </div>

        {/* Next Mobile Arrow */}
        <button 
          onClick={handleNextPage}
          disabled={currentRowStart + numbersPerPage > end}
          aria-label="下一頁"
          style={{
            padding: '8px 16px',
            borderRadius: '25px',
            background: currentRowStart + numbersPerPage > end ? '#e0e0e0' : '#ff9a9e',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            opacity: currentRowStart + numbersPerPage > end ? 0.4 : 1,
            boxShadow: '0 3px 8px rgba(0,0,0,0.1)'
          }}
        >
          下一頁 <ChevronRight size={20} />
        </button>
      </div>

    </div>
  );
}


