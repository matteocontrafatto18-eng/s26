'use client';
import { useState, useEffect } from 'react';

interface SearchAutocompleteProps {
  onSelect: (name: string, coords: [number, number]) => void;
}

export default function SearchAutocomplete({ onSelect }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Chiamata all'API di OpenStreetMap
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&countrycodes=it`
        );
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Errore ricerca:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500); // Debounce di 500ms per non intasare l'API

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-md mb-8">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cerca una località in Sicilia..."
        className="w-full bg-[#1a1a1a] border border-gray-800 text-white px-5 py-3 rounded-2xl focus:border-[#FBBF24] outline-none transition-all shadow-xl"
      />
      
      {results.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-white border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
          {results.map((res) => (
            <li
              key={res.place_id}
              onClick={() => {
                onSelect(res.display_name.split(',')[0], [parseFloat(res.lat), parseFloat(res.lon)]);
                setQuery('');
                setResults([]);
              }}
              className="px-4 py-3 hover:bg-[#FBBF24]/10 hover:text-[#FBBF24] cursor-pointer border-b border-gray-800 last:border-none transition-colors"
            >
              <span className="font-medium text-sm">{res.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}