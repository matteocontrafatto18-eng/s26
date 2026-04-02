'use client';
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
  accs, 
  onClick,
  onDelete 
}: CardStopProps) {
  return (
    <div
      onClick={() => onClick(stop.id)}
      className={`relative group cursor-pointer p-8 h-full transition-colors duration-300 ${
        isActive ? 'bg-[#FBBF24]/5' : 'bg-white hover:bg-gray-50'
      }`}
    >
{/* TASTO CANCELLA - Sempre visibile e accessibile */}
<button 
  onClick={(e) => {
    e.stopPropagation();
    onDelete(stop.id as number);
  }}
  className="absolute top-2 right-2 z-30 p-2 
             text-black hover:text-[#EF4444] 
             bg-white/80 backdrop-blur-sm border border-transparent hover:border-black
             transition-all active:scale-90 touch-manipulation"
  title="Rimuovi tappa"
>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="square" 
    strokeLinejoin="miter"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
</button>

      <div className="flex flex-col h-full">
        {/* HEADER: Numero */}
        <div className="flex justify-between items-start mb-6">
          <span className={`text-4xl font-black leading-none tracking-tighter ${isActive ? 'text-[#FBBF24]' : 'text-black'}`}>
            {stop.label}
          </span>
        </div>

        {/* CONTENUTO PRINCIPALE */}
        <div className="mb-6">
          <h3 className="text-2xl font-black uppercase tracking-tight mb-1 break-words">
            {stop.destination}
          </h3>
          <div className="h-1 w-12 bg-[#EF4444]"></div> {/* Chicca: Linea rossa stile Sicilia */}
        </div>

        {/* NOTE - Stile "Typewriter" */}
        {stop.note && (
          <p className="text-sm text-gray-600 mb-8 font-mono leading-relaxed border-l-2 border-gray-100 pl-4 italic">
            {stop.note}
          </p>
        )}

        {/* FOOTER: Stats Minimali */}
        <div className="mt-auto pt-6 border-t border-black/5 flex gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-black"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Hotel: {accs.filter(a => a.dayId <= stop.id && a.dayIdEnd >= stop.id).length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FBBF24]"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Attività: {acts.filter(a => a.dayId === stop.id).length}
            </span>
          </div>
        </div>
      </div>

      {/* Indicatore di selezione laterale */}
      {isActive && (
        <div className="absolute inset-y-0 left-0 w-1 bg-[#FBBF24]"></div>
      )}
    </div>
  );
}