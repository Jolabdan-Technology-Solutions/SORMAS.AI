'use client';

import { useState, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl';
import type { CircleLayer, FillLayer } from 'mapbox-gl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Layers,
  Activity,
  AlertTriangle,
  TrendingUp,
  Eye,
} from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

interface CaseLocation {
  id: string;
  disease: string;
  lat: number;
  lng: number;
  cases: number;
  deaths: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  severity: 'critical' | 'high' | 'medium' | 'low';
  region: string;
  lastUpdated: string;
}

// Mock case data for Nigeria
const mockCaseData: CaseLocation[] = [
  {
    id: '1',
    disease: 'Cholera',
    lat: 6.5244,
    lng: 3.3792,
    cases: 245,
    deaths: 12,
    trend: 'increasing',
    severity: 'critical',
    region: 'Lagos',
    lastUpdated: '2024-01-20',
  },
  {
    id: '2',
    disease: 'Lassa Fever',
    lat: 9.0765,
    lng: 7.3986,
    cases: 89,
    deaths: 8,
    trend: 'stable',
    severity: 'high',
    region: 'Abuja',
    lastUpdated: '2024-01-20',
  },
  {
    id: '3',
    disease: 'Measles',
    lat: 12.0022,
    lng: 8.5920,
    cases: 456,
    deaths: 23,
    trend: 'increasing',
    severity: 'critical',
    region: 'Kano',
    lastUpdated: '2024-01-19',
  },
  {
    id: '4',
    disease: 'Yellow Fever',
    lat: 7.3775,
    lng: 3.9470,
    cases: 67,
    deaths: 4,
    trend: 'decreasing',
    severity: 'medium',
    region: 'Oyo',
    lastUpdated: '2024-01-20',
  },
  {
    id: '5',
    disease: 'Meningitis',
    lat: 10.3158,
    lng: 9.8442,
    cases: 178,
    deaths: 15,
    trend: 'increasing',
    severity: 'high',
    region: 'Bauchi',
    lastUpdated: '2024-01-18',
  },
  {
    id: '6',
    disease: 'COVID-19',
    lat: 4.8156,
    lng: 7.0498,
    cases: 523,
    deaths: 3,
    trend: 'stable',
    severity: 'medium',
    region: 'Rivers',
    lastUpdated: '2024-01-20',
  },
  {
    id: '7',
    disease: 'Diphtheria',
    lat: 11.8469,
    lng: 13.1600,
    cases: 34,
    deaths: 6,
    trend: 'decreasing',
    severity: 'high',
    region: 'Borno',
    lastUpdated: '2024-01-19',
  },
  {
    id: '8',
    disease: 'Typhoid',
    lat: 6.3350,
    lng: 5.6037,
    cases: 189,
    deaths: 2,
    trend: 'stable',
    severity: 'low',
    region: 'Edo',
    lastUpdated: '2024-01-20',
  },
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return '#ef4444';
    case 'high':
      return '#f97316';
    case 'medium':
      return '#eab308';
    case 'low':
      return '#22c55e';
    default:
      return '#6366f1';
  }
};

const getMarkerSize = (cases: number) => {
  if (cases > 400) return 40;
  if (cases > 200) return 32;
  if (cases > 100) return 26;
  return 20;
};

export function CaseTrackingMap() {
  const [viewState, setViewState] = useState({
    latitude: 9.0820,
    longitude: 8.6753,
    zoom: 5.5,
  });
  const [selectedCase, setSelectedCase] = useState<CaseLocation | null>(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/dark-v11');
  const [showHeatmap, setShowHeatmap] = useState(false);

  // GeoJSON for heatmap
  const heatmapData = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: mockCaseData.map((loc) => ({
      type: 'Feature' as const,
      properties: {
        cases: loc.cases,
        severity: loc.severity,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [loc.lng, loc.lat],
      },
    })),
  }), []);

  const heatmapLayer: CircleLayer = {
    id: 'cases-heat',
    type: 'circle',
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'cases'],
        0, 10,
        100, 20,
        500, 40,
      ],
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'cases'],
        0, '#22c55e',
        100, '#eab308',
        300, '#f97316',
        500, '#ef4444',
      ],
      'circle-opacity': 0.6,
      'circle-blur': 0.5,
    },
  };

  const totalCases = mockCaseData.reduce((acc, loc) => acc + loc.cases, 0);
  const totalDeaths = mockCaseData.reduce((acc, loc) => acc + loc.deaths, 0);
  const criticalOutbreaks = mockCaseData.filter((loc) => loc.severity === 'critical').length;

  return (
    <Card className="border-white/10 bg-[#0a0820]/80 backdrop-blur-xl">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Disease Outbreak Map</CardTitle>
              <p className="text-sm text-slate-400">Real-time case distribution across regions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showHeatmap ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              <Layers className="mr-2 h-4 w-4" />
              Heatmap
            </Button>
            <Button
              variant={mapStyle.includes('satellite') ? 'default' : 'ghost'}
              size="sm"
              onClick={() =>
                setMapStyle(
                  mapStyle.includes('dark')
                    ? 'mapbox://styles/mapbox/satellite-streets-v12'
                    : 'mapbox://styles/mapbox/dark-v11'
                )
              }
            >
              Satellite
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 border-b border-white/10 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{totalCases.toLocaleString()}</p>
            <p className="text-xs text-slate-400">Total Cases</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{totalDeaths}</p>
            <p className="text-xs text-slate-400">Deaths</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400">{criticalOutbreaks}</p>
            <p className="text-xs text-slate-400">Critical Outbreaks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{mockCaseData.length}</p>
            <p className="text-xs text-slate-400">Active Regions</p>
          </div>
        </div>

        {/* Map */}
        <div className="relative h-[400px]">
          <Map
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapStyle={mapStyle}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: '100%', height: '100%' }}
          >
            <NavigationControl position="top-right" />

            {/* Heatmap Layer */}
            {showHeatmap && (
              <Source id="cases" type="geojson" data={heatmapData}>
                <Layer {...heatmapLayer} />
              </Source>
            )}

            {/* Markers */}
            {!showHeatmap &&
              mockCaseData.map((loc) => (
                <Marker
                  key={loc.id}
                  latitude={loc.lat}
                  longitude={loc.lng}
                  anchor="center"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setSelectedCase(loc);
                  }}
                >
                  <div
                    className="relative cursor-pointer transition-transform hover:scale-110"
                    style={{ transform: selectedCase?.id === loc.id ? 'scale(1.2)' : 'scale(1)' }}
                  >
                    {/* Pulse for critical */}
                    {loc.severity === 'critical' && (
                      <div
                        className="absolute inset-0 animate-ping rounded-full opacity-40"
                        style={{
                          backgroundColor: getSeverityColor(loc.severity),
                          width: getMarkerSize(loc.cases),
                          height: getMarkerSize(loc.cases),
                        }}
                      />
                    )}
                    {/* Marker circle */}
                    <div
                      className="relative flex items-center justify-center rounded-full shadow-lg"
                      style={{
                        backgroundColor: getSeverityColor(loc.severity),
                        width: getMarkerSize(loc.cases),
                        height: getMarkerSize(loc.cases),
                        boxShadow: `0 0 20px ${getSeverityColor(loc.severity)}80`,
                      }}
                    >
                      <span className="text-xs font-bold text-white">{loc.cases}</span>
                    </div>
                    {/* Trend indicator */}
                    {loc.trend === 'increasing' && (
                      <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                        <TrendingUp className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>
                </Marker>
              ))}

            {/* Popup */}
            {selectedCase && (
              <Popup
                latitude={selectedCase.lat}
                longitude={selectedCase.lng}
                anchor="top"
                onClose={() => setSelectedCase(null)}
                closeButton={true}
                closeOnClick={false}
              >
                <div className="w-64 rounded-lg bg-[#0a0820] p-4 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{selectedCase.disease}</h3>
                      <p className="text-xs text-slate-400">{selectedCase.region} State</p>
                    </div>
                    <Badge
                      variant={
                        selectedCase.severity === 'critical' || selectedCase.severity === 'high'
                          ? 'destructive'
                          : selectedCase.severity === 'medium'
                          ? 'warning'
                          : 'success'
                      }
                    >
                      {selectedCase.severity}
                    </Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white/5 p-2 text-center">
                      <p className="text-lg font-bold text-white">{selectedCase.cases}</p>
                      <p className="text-xs text-slate-400">Cases</p>
                    </div>
                    <div className="rounded-lg bg-white/5 p-2 text-center">
                      <p className="text-lg font-bold text-red-400">{selectedCase.deaths}</p>
                      <p className="text-xs text-slate-400">Deaths</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-slate-400" />
                      <span className="text-sm capitalize text-slate-300">{selectedCase.trend}</span>
                    </div>
                    <span className="text-xs text-slate-500">Updated: {selectedCase.lastUpdated}</span>
                  </div>

                  <Button size="sm" className="mt-3 w-full h-8 text-xs">
                    <Eye className="mr-2 h-3 w-3" />
                    View Details
                  </Button>
                </div>
              </Popup>
            )}
          </Map>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-[#0a0820]/90 p-3 backdrop-blur-xl">
            <p className="text-xs font-medium text-slate-400 mb-2">Severity</p>
            <div className="space-y-1.5">
              {[
                { label: 'Critical', color: '#ef4444' },
                { label: 'High', color: '#f97316' },
                { label: 'Medium', color: '#eab308' },
                { label: 'Low', color: '#22c55e' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-slate-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Alert */}
          {criticalOutbreaks > 0 && (
            <div className="absolute right-4 top-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 backdrop-blur-xl">
              <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
              <span className="text-xs font-medium text-red-400">
                {criticalOutbreaks} Critical Outbreak{criticalOutbreaks > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
