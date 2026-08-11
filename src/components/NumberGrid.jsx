import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NumberGrid({ onSelectNumber, onTriggerHero, soundEnabled, speak }) {
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(1000);
  const [currentRowStart, setCurrentRowStart] = useState(1);
  const [rowsNavigated, setRowsNavigated] = useState(0);

  // Reset current view start when range start changes
  useEffect(() => {
    setCurrentRowStart(start);
  }, [start]);

  // Navigate forward by 2 rows (20 numbers)
  const handleNextPage = () => {
    if (currentRowStart + 20 <= end || (currentRowStart + 10 <= end)) {
      const nextStart = currentRowStart + 20;
      setCurrentRowStart(nextStart);
      const newCount = rowsNavigated + 2;
      setRowsNavigated(newCount);
      if (Math.floor(newCount / 3) > Math.floor(rowsNavigated / 3)) {
        onTriggerHero();
      }
    }
  };

  // Navigate backward by 2 rows (20 numbers)
  const handlePrevPage = () => {
    if (currentRowStart - 20 >= start) {
      setCurrentRowStart(prev => prev - 20);
      const newCount = rowsNavigated + 2;
      setRowsNavigated(newCount);
      if (Math.floor(newCount / 3) > Math.floor(rowsNavigated / 3)) {
        onTriggerHero();
      }
    }
  };

  const totalNumbers = Math.max(0, end - start + 1);
  const totalRows = Math.ceil(totalNumbers / 10);
  const totalPages = Math.ceil(totalRows / 2);
  const currentFirstRow = Math.floor((currentRowStart - start) / 10) + 1;
  const currentSecondRow = Math.min(currentFirstRow + 1, totalRows);
  const currentPage = Math.ceil(currentFirstRow / 2);

  const row1Numbers = Array.from({ length: 10 }, (_, i) => currentRowStart + i).filter(n => n <= end);
  const row2Numbers = Array.from({ length: 10 }, (_, i) => currentRowStart + 10 + i).filter(n => n <= end);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
      
      {/* Settings / Range Config */}
      <div style={{
        display: 'flex',
        gap: '15px',
        background: 'white',
        padding: '8px 20px',
        borderRadius: '30px',
        marginBottom: '25px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <label style={{ fontWeight: 'bold', color: '#ff9a9e' }}>
          從: <input type="number" value={start} onChange={(e) => setStart(Number(e.target.value) || 1)} style={{ width: '80px', borderRadius: '10px', border: '2px solid #fecfef', padding: '5px', textAlign: 'center', fontSize: '18px' }}/>
        </label>
        <label style={{ fontWeight: 'bold', color: '#ff9a9e' }}>
          到: <input type="number" value={end} onChange={(e) => setEnd(Number(e.target.value) || 1000)} style={{ width: '80px', borderRadius: '10px', border: '2px solid #fecfef', padding: '5px', textAlign: 'center', fontSize: '18px' }}/>
        </label>
        <label style={{ fontWeight: 'bold', color: '#a1c4fd', marginLeft: '10px' }}>
          快速跳頁:
          <select 
            value={currentRowStart} 
            onChange={(e) => setCurrentRowStart(Number(e.target.value))}
            style={{ marginLeft: '10px', borderRadius: '10px', border: '2px solid #a1c4fd', padding: '5px', fontSize: '16px' }}
          >
            {Array.from({ length: totalPages }, (_, i) => {
              const pStart = start + i * 20;
              const pEnd = Math.min(pStart + 19, end);
              return (
                <option key={pStart} value={pStart}>
                  第 {i * 2 + 1}~{Math.min(i * 2 + 2, totalRows)} 行 ({pStart} ~ {pEnd})
                </option>
              );
            })}
          </select>
        </label>
      </div>

      {/* Grid Area with Left & Right Arrow Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* Prev Button */}
        <button 
          onClick={handlePrevPage} 
          disabled={currentRowStart <= start}
          style={{
            fontSize: '40px',
            background: currentRowStart <= start ? '#e0e0e0' : '#ff9a9e',
            color: 'white',
            width: '75px',
            height: '75px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            cursor: currentRowStart <= start ? 'not-allowed' : 'pointer',
            opacity: currentRowStart <= start ? 0.5 : 1,
            flexShrink: 0
          }}
        >
          <ChevronLeft size={44} />
        </button>

        {/* Two Rows Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Row 1 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {row1Numbers.map(num => (
              <button
                key={num}
                onClick={() => onSelectNumber(num)}
                className="animate-pop"
                style={{
                  width: '72px',
                  height: '72px',
                  fontSize: num > 99 ? '28px' : '36px',
                  fontWeight: '900',
                  background: 'white',
                  border: '4px solid #a1c4fd',
                  borderRadius: '18px',
                  color: '#444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 5px 0 #a1c4fd',
                  cursor: 'pointer',
                  transition: 'all 0.1s'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(5px)';
                  e.currentTarget.style.boxShadow = '0 0px 0 #a1c4fd';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 0 #a1c4fd';
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = 'translateY(5px)';
                  e.currentTarget.style.boxShadow = '0 0px 0 #a1c4fd';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 0 #a1c4fd';
                }}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Row 2 */}
          {row2Numbers.length > 0 && (
            <div style={{ display: 'flex', gap: '12px' }}>
              {row2Numbers.map(num => (
                <button
                  key={num}
                  onClick={() => onSelectNumber(num)}
                  className="animate-pop"
                  style={{
                    width: '72px',
                    height: '72px',
                    fontSize: num > 99 ? '28px' : '36px',
                    fontWeight: '900',
                    background: 'white',
                    border: '4px solid #c2e9fb',
                    borderRadius: '18px',
                    color: '#444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 5px 0 #c2e9fb',
                    cursor: 'pointer',
                    transition: 'all 0.1s'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(5px)';
                    e.currentTarget.style.boxShadow = '0 0px 0 #c2e9fb';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 0 #c2e9fb';
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.transform = 'translateY(5px)';
                    e.currentTarget.style.boxShadow = '0 0px 0 #c2e9fb';
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 0 #c2e9fb';
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Next Button */}
        <button 
          onClick={handleNextPage}
          disabled={currentRowStart + 20 > end && currentRowStart + 10 > end}
          style={{
            fontSize: '40px',
            background: (currentRowStart + 20 > end && currentRowStart + 10 > end) ? '#e0e0e0' : '#ff9a9e',
            color: 'white',
            width: '75px',
            height: '75px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            cursor: (currentRowStart + 20 > end && currentRowStart + 10 > end) ? 'not-allowed' : 'pointer',
            opacity: (currentRowStart + 20 > end && currentRowStart + 10 > end) ? 0.5 : 1,
            flexShrink: 0
          }}
        >
          <ChevronRight size={44} />
        </button>

      </div>

      {/* Progress Indicator */}
      <div style={{ marginTop: '25px', fontSize: '22px', fontWeight: 'bold', color: '#667eea', background: 'white', padding: '8px 25px', borderRadius: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        第 {currentFirstRow}{currentSecondRow > currentFirstRow ? ` ~ ${currentSecondRow}` : ''} 行 / 共 {totalRows || 1} 行 （第 {currentPage} / {totalPages || 1} 頁）
      </div>

    </div>
  );
}

