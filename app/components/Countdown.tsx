'use client';
import { useState, useEffect } from 'react';

export default function Countdown() {
  const targetDate = new Date('2026-08-03T00:00:00').getTime();
  const [timeLeft, setTimeLeft] = useState({
    giorni: 0, ore: 0, minuti: 0, secondi: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
      } else {
        setTimeLeft({
          giorni: Math.floor(distance / (1000 * 60 * 60 * 24)),
          ore: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minuti: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          secondi: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="w-full bg-[#FBBF24] border-b-4 border-black p-6 mb-8 flex flex-col items-center justify-center">
      <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-black/60">
        Missione Sicilia 2026 — Partenza tra:
      </h2>
      
      <div className="flex gap-4 sm:gap-8">
        {[
          { label: 'GG', val: timeLeft.giorni },
          { label: 'ORE', val: timeLeft.ore },
          { label: 'MIN', val: timeLeft.minuti },
          { label: 'SEC', val: timeLeft.secondi }
        ].map((unit) => (
          <div key={unit.label} className="flex flex-col items-center">
            <span className="text-4xl sm:text-6xl font-black text-black leading-none">
              {String(unit.val).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-bold mt-1">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}