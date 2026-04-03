'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Day, Act, Acc } from './Mapview';

interface CardStopProps {
  stop: Day;
  index: number; // Fondamentale per il numero dinamico
  isActive: boolean;
  onClick: (id: string | number) => void;
  onDelete: (id: number) => void;
}

export default function CardStop({ 
  stop, 
  index, // Lo usiamo per calcolare il numero della tappa
  isActive, 
  onClick,
  onDelete 
}: CardStopProps) {
  
  const [localAccs, setLocalAccs] = useState<any[]>([]);
  const [localActs, setLocalActs] = useState<any[]>([]);
  const [isAddingAcc, setIsAddingAcc] = useState(false);
  const [isAddingAct, setIsAddingAct] = useState(false);
  const [hotelName, setHotelName] = useState('');
  const [hotelDate, setHotelDate] = useState('');
  const [actName, setActName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: accs } = await supabase.from('accommodations').select('*').eq('stop_id', stop.id);
      if (accs) setLocalAccs(accs);
      const { data: acts } = await supabase.from('activities').select('*').eq('stop_id', stop.id);
      if (acts) setLocalActs(acts);
    };
    fetchData();
  }, [stop.id]);

  const saveHotel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hotelName) return;
    const { data, error } = await supabase.from('accommodations').insert([{ stop_id: stop.id, name: hotelName, check_in: hotelDate }]).select().single();
    if (!error && data) {
      setLocalAccs([...localAccs, data]);
      setIsAddingAcc(false);
      setHotelName(''); setHotelDate('');
    }
  };

  const saveActivity = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!actName) return;
    const { data, error } = await supabase.from('activities').insert([{ stop_id: stop.id, name: actName }]).select().single();
    if (!error && data) {
      setLocalActs([...localActs, data]);
      setIsAddingAct(false);
      setActName('');
    }
  };

  const deleteItem = async (id: number, table: 'accommodations' | 'activities') => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) {
      if (table === 'accommodations') setLocalAccs(localAccs.filter(h => h.id !== id));
      else setLocalActs(localActs.filter(a => a.id !== id));
    }
  };

  return (
    <div
      onClick={() => onClick(stop.id)}
      className={`relative flex flex-col justify-between px-14 py-10 min-h-[500px] h-full transition-all duration-300 border-b border-gray-100 ${
        isActive ? 'bg-[#FBBF24]/5' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <button onClick={(e) => { e.stopPropagation(); onDelete(stop.id as number); }} className="absolute top-4 right-4 z-30 p-2 text-black hover:text-red-500 transition-all">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <div>
        {/* MODIFICA QUI: Usiamo index + 1 per far scalare i numeri correttamente */}
        <span className={`text-5xl font-black mb-4 block leading-none tracking-tighter ${isActive ? 'text-[#FBBF24]' : 'text-black'}`}>
          {String(index + 1).padStart(2, '0')}
        </span>
        
        <h3 className="text-2xl font-black uppercase tracking-tight mb-1">{stop.destination}</h3>
        <div className="h-1.5 w-12 bg-[#EF4444] mb-6"></div>
        {stop.note && <p className="text-sm text-gray-500 font-mono italic border-l-2 border-gray-200 pl-4">{stop.note}</p>}
      </div>

      <div className="mt-auto pt-8 space-y-6">
        {/* SEZIONE HOTEL */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 bg-blue-500"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-blue-900">Alloggi</span>
          </div>
          {localAccs.map((h) => (
            <div key={h.id} className="flex items-center justify-between bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase">🏨 {h.name}</span>
                {h.check_in && <span className="text-[9px] font-mono text-gray-500 uppercase">{h.check_in}</span>}
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteItem(h.id, 'accommodations'); }} className="text-red-500 p-1 hover:scale-110 transition-transform">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          ))}
          {!isAddingAcc ? (
            <button onClick={(e) => { e.stopPropagation(); setIsAddingAcc(true); }} className="text-[9px] font-black uppercase tracking-tighter text-gray-400 hover:text-black hover:underline">+ Aggiungi Hotel</button>
          ) : (
            <div className="bg-white p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2" onClick={(e) => e.stopPropagation()}>
              <input type="text" placeholder="NOME..." value={hotelName} onChange={(e) => setHotelName(e.target.value)} className="w-full text-[10px] p-2 border-2 border-black font-bold outline-none uppercase" />
              <input type="text" placeholder="DATE..." value={hotelDate} onChange={(e) => setHotelDate(e.target.value)} className="w-full text-[10px] p-2 border-2 border-black font-bold outline-none uppercase" />
              <div className="flex gap-2">
                <button onClick={saveHotel} className="flex-1 bg-black text-white text-[10px] py-2 font-black uppercase">SALVA</button>
                <button onClick={() => setIsAddingAcc(false)} className="flex-1 border-2 border-black text-[10px] py-2 font-black uppercase">X</button>
              </div>
            </div>
          )}
        </div>

        {/* SEZIONE ATTIVITÀ */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 bg-yellow-400"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700">Attività</span>
          </div>
          {localActs.map((a) => (
            <div key={a.id} className="flex items-center justify-between bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[11px] font-black uppercase">⚡ {a.name}</span>
              <button onClick={(e) => { e.stopPropagation(); deleteItem(a.id, 'activities'); }} className="text-red-500 p-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          ))}
          {!isAddingAct ? (
            <button onClick={(e) => { e.stopPropagation(); setIsAddingAct(true); }} className="text-[9px] font-black uppercase tracking-tighter text-gray-400 hover:text-black hover:underline">+ Aggiungi Attività</button>
          ) : (
            <div className="bg-white p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2" onClick={(e) => e.stopPropagation()}>
              <input type="text" placeholder="COSA FARETE?" value={actName} onChange={(e) => setActName(e.target.value)} className="w-full text-[10px] p-2 border-2 border-black font-bold outline-none uppercase" />
              <div className="flex gap-2">
                <button onClick={saveActivity} className="flex-1 bg-black text-white text-[10px] py-2 font-black uppercase">AGGIUNGI</button>
                <button onClick={() => setIsAddingAct(false)} className="flex-1 border-2 border-black text-[10px] py-2 font-black uppercase">X</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {isActive && <div className="absolute inset-y-0 left-0 w-2 bg-[#FBBF24]"></div>}
    </div>
  );
}