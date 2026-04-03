'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import MapView from "./components/Mapview";
import CardStop from "./components/CardStop";
import SearchAutocomplete from "./components/SearchAutocomplete";
import Countdown from './components/Countdown';

// --- INTERFACCE ---
export interface Day {
  id: number;
  coords: [number, number];
  destination: string;
  label: string;
  date?: string;
  note?: string;
}

export default function TuaPage() {
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [selDay, setSelDay] = useState<number | null>(null);

  // 1. CARICAMENTO INIZIALE (FETCH)
  const fetchStops = async () => {
    const { data, error } = await supabase
      .from("stops")
      .select("*")
      .order("id", { ascending: true });

    if (!error && data) {
      setDays(data);
      if (data.length > 0 && selDay === null) setSelDay(data[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStops();

    // REALTIME: Ascolta i cambiamenti degli altri utenti
    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stops" },
        () => {
          fetchStops();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 2. AGGIUNTA OTTIMISTICA (ISTANTANEA)
  const addStop = async (name: string, coords: [number, number]) => {
    const nextNum = days.length + 1;
    const newLabel = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;

    const tempId = Math.floor(Math.random() * 1000000);
    const newStop: Day = {
      id: tempId,
      label: newLabel,
      destination: name.toUpperCase(),
      coords: coords,
      note: "",
    };

    setDays([...days, newStop]);
    setSelDay(tempId);

    const { error } = await supabase.from("stops").insert([
      {
        label: newLabel,
        destination: name.toUpperCase(),
        coords: coords,
        note: "",
      },
    ]);

    if (error) {
      fetchStops();
      alert("Errore nell'aggiunta: " + error.message);
    }
  };

  // 3. RIMOZIONE OTTIMISTICA (ISTANTANEA)
  const removeStop = async (id: number) => {
    const backup = [...days];
    setDays(days.filter((d) => d.id !== id));

    const { error } = await supabase.from("stops").delete().eq("id", id);

    if (error) {
      setDays(backup);
      alert("Errore nell'eliminazione");
    }
  };

  // 4. FUNZIONE SPOSTAMENTO (REORDER)
  const moveStop = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= days.length) return;

    const newDays = [...days];
    [newDays[index], newDays[newIndex]] = [newDays[newIndex], newDays[index]];

    const updatedDays = newDays.map((d, i) => ({
      ...d,
      label: i + 1 < 10 ? `0${i + 1}` : `${i + 1}`,
    }));

    setDays(updatedDays);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-mono uppercase tracking-[0.3em]">
        Sicilia is loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-black font-mono selection:bg-[#FBBF24]">
      
      {/* HEADER */}
      <header className="border-b-2 border-black sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-black tracking-tighter leading-none">
              SICILIA<span className="text-[#FBBF24]">.</span>
            </h1>
            <p className="text-[9px] uppercase tracking-[0.4em] mt-1 font-bold text-gray-400">
              Collaborative Planner v2.0
            </p>
          </div>

          <div className="w-full md:w-96">
            <SearchAutocomplete
              onSelect={(name, coords) => addStop(name, coords)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* --- SEZIONE COUNTDOWN --- */}
        <section className="mb-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
          <Countdown />
        </section>

        {/* MAPPA SECTION */}
        <section className="mb-12 border-2 border-black bg-black h-[500px] relative overflow-hidden flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex-1 w-full h-full p-0 m-0 leading-[0] overflow-hidden">
            <MapView days={days} acts={[]} accs={[]} selDay={selDay || 0} />
          </div>
        </section>

        {/* LISTA CARD */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black uppercase italic">
              Itinerario
            </h2>
            <div className="h-[2px] flex-1 bg-black opacity-10"></div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Live Sync
              </span>
            </div>
          </div>

          {days.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-black">
              {days.map((stop, index) => (
                <div
                  key={stop.id}
                  id={`card-${stop.id}`}
                  className="border-r border-b border-black group relative"
                >
                  <CardStop
                    stop={stop}
                    index={index}
                    isActive={selDay === stop.id}
                    onClick={(id) => setSelDay(Number(id))}
                    onDelete={(id) => removeStop(id)}
                  />

                  {/* Tasti Spostamento */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveStop(index, "up");
                      }}
                      className="w-8 h-8 bg-white border border-black flex items-center justify-center text-sm hover:bg-black hover:text-white active:bg-gray-200 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] touch-manipulation"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveStop(index, "down");
                      }}
                      className="w-8 h-8 bg-white border border-black flex items-center justify-center text-sm hover:bg-black hover:text-white active:bg-gray-200 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] touch-manipulation"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center border-2 border-dashed border-gray-200 grayscale">
              <p className="text-xs uppercase tracking-[0.5em] text-gray-400 font-bold">
                Cerca una località per iniziare
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-[9px] uppercase tracking-[0.2em] text-gray-400 gap-4">
        <p>Progetto Sicilia 2026 — Built with Next.js & Supabase</p>
        <div className="flex gap-6">
          <span className="text-black font-bold">Status: Online</span>
          <span>OpenStreetMap Contributors</span>
        </div>
      </footer>
    </div>
  );
}