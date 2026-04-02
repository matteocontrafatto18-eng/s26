'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Day, Act, Acc } from './Mapview';

interface CardStopProps {
  stop: Day;
  index: number;
  isActive: boolean;
  acts: Act[];
  accs: Acc[];
  onClick: (id: string | number) => void;
  onDelete: (id: number) => void;
}

export default function CardStop({ 
  stop, 
  index, 
  isActive, 
  acts, 
  accs, // Queste arrivano dal padre, ma useremo lo stato locale per reattività immediata
  onClick,
  onDelete 
}: CardStopProps) {
  
  // --- STATI LOCALI ---
  const [localAccs, setLocalAccs] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [hotelName, setHotelName] = useState('');
  const [hotelDate, setHotelDate] = useState('');

  // --- CARICAMENTO INIZIALE HOTEL ---
  useEffect(() => {
    const fetchHotels = async () => {
      const { data } = await supabase
        .from('accommodations')
        .select('*')
        .eq('stop_id', stop.id);
      
      if (data) {
        setLocalAccs(data);
      }
    };
    fetchHotels();
  }, [stop.id]);

  // --- FUNZIONE SALVATAGGIO ---
  const saveHotel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!hotelName) return;

    const { data, error } = await supabase
      .from('accommodations')
      .insert([{ 
        stop_id: stop.id, 
        name: hotelName, 
        check_in: hotelDate 
      }])
      .select()
      .single();

    if (error) {
      console.error("Errore salvataggio:", error.message);
      return;
    }

    if (data) {
      // Aggiorna la lista locale immediatamente
      setLocalAccs([...localAccs, data]);
      setIsAdding(false);
      setHotelName(''); 
      setHotelDate('');
    }
  };

  // --- FUNZIONE DELETE HOTEL ---
  const deleteHotel = async (hotelId: string | number) => {
    const { error } = await supabase
      .from('accommodations')
      .delete()
      .eq('id', hotelId);

    if (!error) {
      // Rimuovi dalla lista locale immediatamente
      setLocalAccs(localAccs.filter(h => h.id !== hotelId));
    } else {
      console.error("Errore eliminazione:", error.message);
    }
  };

  return (
    <div
      onClick={() => onClick(stop.id)}
      // px-14 garantisce che il contenuto non tocchi le frecce laterali su mobile
      className={`relative group cursor-pointer px-14 py-8 h-full transition-colors duration-300 border-b border-gray-100 ${
        isActive ? 'bg-[#FBBF24]/5' : 'bg-white hover:bg-gray-50'
      }`}
    >
      {/* TASTO CANCELLA TAPPA */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(stop.id as number);
        }}
        className="absolute top-2 right-2 z-30 p-2 
                   text-black hover:text-[#EF4444] 
                   bg-white/80 backdrop-blur-sm border border-transparent hover:border-black
                   transition-all active:scale-90 touch-manipulation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div className="flex flex-col h-full">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-6">
          <span className={`text-4xl font-black leading-none tracking-tighter ${isActive ? 'text-[#FBBF24]' : 'text-black'}`}>
            {stop.label}
          </span>
        </div>

        {/* DESTINAZIONE */}
        <div className="mb-6">
          <h3 className="text-2xl font-black uppercase tracking-tight mb-1 break-words">
            {stop.destination}
          </h3>
          <div className="h-1 w-12 bg-[#EF4444]"></div>
        </div>

        {/* NOTE */}
        {stop.note && (
          <p className="text-sm text-gray-600 mb-8 font-mono leading-relaxed border-l-2 border-gray-100 pl-4 italic">
            {stop.note}
          </p>
        )}

        {/* FOOTER: Hotel e Attività */}
        <div className="mt-auto pt-4 space-y-4 border-t border-gray-100">
          
          {/* LISTA HOTEL SALVATI (Utilizza localAccs per reattività) */}
          <div className="space-y-2">
            {localAccs.map((h: any) => (
              <div key={h.id} className="flex items-center justify-between bg-blue-50/80 p-3 rounded-lg border border-blue-100 group/hotel shadow-sm">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-blue-900 uppercase tracking-tight">🏨 {h.name}</span>
                  {h.check_in && <span className="text-[10px] text-blue-500 font-mono mt-0.5">{h.check_in}</span>}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteHotel(h.id); }}
                  className="p-2 text-red-400 hover:text-red-600 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* BOTTONE AGGIUNGI / FORM */}
          {!isAdding ? (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsAdding(true); }}
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors border-b border-transparent hover:border-black"
            >
              + Aggiungi Alloggio
            </button>
          ) : (
            <div className="bg-white p-3 border-2 border-black flex flex-col gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-2" onClick={(e) => e.stopPropagation()}>
              <input 
                type="text" 
                placeholder="Nome Hotel..." 
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                className="text-xs p-2 border border-gray-300 focus:border-black outline-none"
              />
              <input 
                type="text" 
                placeholder="Date (es. 10-12 Ott)" 
                value={hotelDate}
                onChange={(e) => setHotelDate(e.target.value)}
                className="text-xs p-2 border border-gray-300 focus:border-black outline-none"
              />
              <div className="flex gap-2">
                <button onClick={saveHotel} className="flex-1 bg-black text-white text-[10px] py-2 font-bold uppercase hover:bg-gray-800">Salva</button>
                <button onClick={() => setIsAdding(false)} className="flex-1 border border-black text-[10px] py-2 font-bold uppercase hover:bg-gray-50">Annulla</button>
              </div>
            </div>
          )}

          {/* ATTIVITÀ */}
          <div className="flex items-center gap-2 pt-2">
            <div className="w-1.5 h-1.5 bg-[#FBBF24] rounded-full"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Attività: {acts.filter(a => a.dayId === stop.id).length}
            </span>
          </div>
        </div>
      </div>

      {/* Indicatore selezione laterale */}
      {isActive && (
        <div className="absolute inset-y-0 left-0 w-1 bg-[#FBBF24]"></div>
      )}
    </div>
  );
}