import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NumberGrid({ onSelectNumber, onTriggerHero, soundEnabled, speak }) {
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(1000);
  const [currentRowStart, setCurrentRowStart] = useState(1);
  const [rowsNavigated, setRowsNavigated] = useState(0);

  // When start range changes, reset currentRowStart
  useEffect(() => {
    setCurrentRowStart(start);
  }, [start]);

  const handleNextRow = () => {
    if (currentRowStart + 10 <= end) {
      setCurrentRowStart(prev => prev + 10);
      const newCount = rowsNavigated + 1;
      setRowsNavigated(newCount);
      if (newCount % 3 === 0) {
        onTriggerHero();
      }
    }
  };

  const handlePrevRow = () => {
    if (currentRowStart - 10 >= start) {
      setCurrentRowStart(prev => prev - 10);
      // We do not trigger hero on going backwards, or maybe we do? Requirement says "每當切換累積滿 3 行". Let's just count all row navigations.
      const newCount = rowsNavigated + 1;
      setRowsNavigated(newCount);
      if (newCount % 3 === 0) {
        onTriggerHero();
      }
    }
  };

  const totalRows = Math.ceil((end - start + 1) / 10);
  const currentRowIndex = Math.floor((currentRowStart - start) / 10) + 1;

  const rowNumbers = Array.from({ length: 10 }, (_, i) => currentRowStart + i).filter(n => n <= end);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      
      {/* Settings / Range Config */}
      <div style={{
        display: 'flex',
        gap: '20px',
        background: 'white',
        padding: '10px 20px',
        borderRadius: '30px',
        marginBottom: '40px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        alignItems: 'center'
      }}>
        <label style={{ fontWeight: 'bold', color: '#ff9a9e' }}>
          從: <input type="number" value={start} onChange={(e) => setStart(Number(e.target.value) || 1)} style={{ width: '80px', borderRadius: '10px', border: '2px solid #fecfef', padding: '5px', textAlign: 'center', fontSize: '18px' }}/>
        </label>
        <label style={{ fontWeight: 'bold', color: '#ff9a9e' }}>
          到: <input type="number" value={end} onChange={(e) => setEnd(Number(e.target.value) || 1000)} style={{ width: '80px', borderRadius: '10px', border: '2px solid #fecfef', padding: '5px', textAlign: 'center', fontSize: '18px' }}/>
        </label>
        <label style={{ fontWeight: 'bold', color: '#a1c4fd', marginLeft: '10px' }}>
          快速跳行:
          <select 
            value={currentRowStart} 
            onChange={(e) => setCurrentRowStart(Number(e.target.value))}
            style={{ marginLeft: '10px', borderRadius: '10px', border: '2px solid #a1c4fd', padding: '5px', fontSize: '16px' }}
          >
            {Array.from({ length: totalRows }, (_, i) => {
              const rowStart = start + i * 10;
              const rowEnd = Math.min(rowStart + 9, end);
              return (
                <option key={rowStart} value={rowStart}>
                  第 {i + 1} 行 ({rowStart} ~ {rowEnd})
                </option>
              );
            })}
          </select>
        </label>
      </div>

      {/* Grid Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        
        {/* Prev Button */}
        <button 
          onClick={handlePrevRow} 
          disabled={currentRowStart <= start}
          style={{
            fontSize: '40px',
            background: currentRowStart <= start ? '#e0e0e0' : '#ff9a9e',
            color: 'white',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            opacity: currentRowStart <= start ? 0.5 : 1
          }}
        >
          <ChevronLeft size={40} />
        </button>

        {/* 10 Numbers Container */}
        <div style={{ display: 'flex', gap: '15px' }}>
          {rowNumbers.map(num => (
            <button
              key={num}
              onClick={() => onSelectNumber(num)}
              className="animate-pop"
              style={{
                width: '80px',
                height: '80px',
                fontSize: num > 99 ? '32px' : '40px',
                fontWeight: '900',
                background: 'white',
                border: '4px solid #a1c4fd',
                borderRadius: '20px',
                color: '#555',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 0 #a1c4fd',
                transition: 'all 0.1s'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(6px)';
                e.currentTarget.style.boxShadow = '0 0px 0 #a1c4fd';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 0 #a1c4fd';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 0 #a1c4fd';
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'translateY(6px)';
                e.currentTarget.style.boxShadow = '0 0px 0 #a1c4fd';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 0 #a1c4fd';
              }}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button 
          onClick={handleNextRow}
          disabled={currentRowStart + 10 > end}
          style={{
            fontSize: '40px',
            background: currentRowStart + 10 > end ? '#e0e0e0' : '#ff9a9e',
            color: 'white',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            opacity: currentRowStart + 10 > end ? 0.5 : 1
          }}
        >
          <ChevronRight size={40} />
        </button>

      </div>

      <div style={{ marginTop: '40px', fontSize: '24px', fontWeight: 'bold', color: '#a1c4fd', background: 'white', padding: '10px 30px', borderRadius: '30px' }}>
        第 {currentRowIndex} 行 / 共 {totalRows || 1} 行
      </div>

    </div>
  );
}
