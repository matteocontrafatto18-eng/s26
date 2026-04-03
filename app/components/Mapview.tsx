'use client';
import { useEffect, useState, useMemo } from 'react';

export interface Day {
  id: string | number;
  coords: [number, number];
  label: string;
  destination: string;
  date?: string;
  note?: string;
}

export interface Act { dayId: string | number; }
export interface Acc { dayId: string | number; dayIdEnd: string | number; }

interface MapViewProps {
  days: Day[];
  acts: Act[];
  accs: Acc[];
  selDay: string | number;
}

export default function MapView({ days, acts, accs, selDay }: MapViewProps) {
  const [iframeKey, setIframeKey] = useState(0);

  // Pre-calcola i dati per evitare template issues
  const mapData = useMemo(() => {
    const seen = new Set<string>();
    const stops: any[] = [];
    
    days.forEach((d: Day) => {
      const k = d.coords.join(",");
      if (!seen.has(k)) {
        seen.add(k);
        stops.push({
          ...d,
          ac: acts.filter((a: Act) => a.dayId === d.id).length,
          hc: accs.filter((a: Acc) => a.dayId <= d.id && a.dayIdEnd >= d.id).length
        });
      }
    });
    
    return {
      route: days.map((d: Day) => d.coords),
      stops: stops.map((s,idx) => ({
        la: s.coords[0],
        ln: s.coords[1],
        nm: s.destination.split("→").pop()?.split("/")[0]?.trim() || '',
        dl: String(idx + 1).padStart(2, '0'),
        ds: s.destination,
        nt: s.note || '',
        id: s.id,
        ac: s.ac,
        hc: s.hc,
        sl: s.id === selDay
      })),
      gold: '#FBBF24',
      red: '#EF4444'
    };
  }, [days, acts, accs, selDay]);

  const html = useMemo(() => `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <style>
    body { margin: 0; background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui; }
    #map { width: 100%; height: 100vh; }
    .lb { background: rgba(17,24,39,0.95); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 6px 12px; color: #fff; font-weight: 600; font-size: 12px; line-height: 1.2; box-shadow: 0 8px 32px rgba(0,0,0,0.3); white-space: nowrap; }
    .lb.s { border-color: ${mapData.gold}; color: ${mapData.gold}; box-shadow: 0 0 20px ${mapData.gold}20; }
    .custom-popup .leaflet-popup-content-wrapper { background: linear-gradient(145deg,#111827,#1f2937); color: #f9fafb; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(20px); box-shadow: 0 20px 40px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.05); font-size: 14px; line-height: 1.5; }
    .custom-popup .leaflet-popup-tip { background: linear-gradient(145deg,#111827,#1f2937); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
    .custom-popup .leaflet-popup-content { margin: 16px; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',system-ui; }
    .custom-popup b { color: ${mapData.gold}; font-weight: 700; }
    .custom-popup .sub { color: #9ca3af; font-size: 13px; }
    .custom-popup .stats { margin-top: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
    .custom-popup .hc { color: #10b981; }
    .custom-popup .ac { color: #8b5cf6; margin-left: 12px; }
    .leaflet-control-zoom a { background: linear-gradient(145deg,#1f2937,#111827) !important; color: #f9fafb !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px !important; width: 36px !important; height: 36px !important; line-height: 34px !important; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important; margin: 4px 0 !important; transition: all 0.2s ease; }
    .leaflet-control-zoom a:hover { background: linear-gradient(145deg,#374151,#4b5563) !important; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,0.4) !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const mapData = ${JSON.stringify(mapData)};
    const { route, stops, gold, red } = mapData;
    
    var map = L.map('map', { attributionControl: false, zoomControl: true, zoomAnimation: true, fadeAnimation: true }).setView([37.75, 14.1], 8);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
    
    L.polyline(route, { color: red, weight: 5, opacity: 0.85, dashArray: '12 8', smoothFactor: 1 }).addTo(map);
    
    stops.forEach(function(s) {
      var isSelected = s.sl;
      var markerColor = isSelected ? gold : '#e5e7eb';
      var borderColor = isSelected ? red : '#374151';
      var glowColor = isSelected ? gold + '40' : '#00000040';
      
      var ic = L.divIcon({
        className: 'custom-marker',
        html: '<div style="width:16px;height:16px;border-radius:50%;background:'+markerColor+';border:3px solid '+borderColor+';box-shadow:0 0 '+(isSelected?16:6)+'px '+glowColor+',0 4px 12px rgba(0,0,0,0.4);transition:all 0.3s cubic-bezier(0.4,0,0.2,1);cursor:pointer;animation:'+(isSelected?'pulse 2s infinite':'none')+'"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      
      var m = L.marker([s.la, s.ln], { icon: ic }).addTo(map);
      
      L.marker([s.la, s.ln], {
        icon: L.divIcon({ className: 'lb'+(isSelected?' s':''), html: s.nm, iconAnchor: [0, 12] }),
        interactive: false
      }).addTo(map);
      
      var badgeHtml = '';
      if(s.hc) badgeHtml += '<span class="hc">🏠 '+s.hc+'</span>';
      if(s.ac) badgeHtml += '<span class="ac">🎯 '+s.ac+'</span>';
      if(!s.hc && !s.ac) badgeHtml = '<span style="color:#6b7280">—</span>';
      
      var popupContent = '<div><b>'+s.dl+' → '+s.ds+'</b>'+(s.nt?'<br><span class="sub">'+s.nt+'</span>':'')+'<div class="stats">'+badgeHtml+'</div></div>';
      
      m.bindPopup(popupContent, { closeButton: false, maxWidth: 300, className: 'custom-popup' });
      
      m.on('click', function() { window.parent.postMessage({type:'dc', id:s.id},'*'); });
      
      m.on('mouseover', function() {
        this.setIcon(L.divIcon({
          className: 'custom-marker',
          html: '<div style="width:20px;height:20px;border-radius:50%;background:'+gold+';border:3px solid '+red+';box-shadow:0 0 20px '+gold+'60,0 4px 16px rgba(0,0,0,0.5);cursor:pointer;"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        }));
      });
      m.on('mouseout', function() { this.setIcon(ic); });
    });
    
    const style = document.createElement('style');
    style.textContent = '@keyframes pulse{0%{box-shadow:0 0 0 0 '+gold+'40;}70%{box-shadow:0 0 0 12px '+gold+'10;}100%{box-shadow:0 0 0 0 '+gold+'00;}}';
    document.head.appendChild(style);
    
    if(stops.length > 0) {
      const group = new L.featureGroup(stops.map(s => L.marker([s.la, s.ln])));
      map.fitBounds(group.getBounds().pad(0.1));
    }
  </script>
</body></html>`, [mapData]);

  useEffect(() => {
    setIframeKey(prev => prev + 1);
  }, [html]);

  return (
    <div style={{
      width: "100%", borderRadius: 20, overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 20px 40px rgba(0,0,0,0.3)", background: "#0a0a0a"
    }}>
      <iframe
        key={iframeKey}
        title="Mappa Sicilia"
        srcDoc={html}
        sandbox="allow-scripts allow-same-origin allow-popups"
        style={{ width: "100%", height: 500, border: "none", display: "block" }}
        loading="lazy"
      />
    </div>
  );
}