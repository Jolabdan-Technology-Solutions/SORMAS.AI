'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Layers,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components with SSR disabled
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);

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

const getMarkerRadius = (cases: number) => {
  if (cases > 400) return 25;
  if (cases > 200) return 20;
  if (cases > 100) return 15;
  return 10;
};

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'increasing') return <TrendingUp className="h-3 w-3 text-red-400" />;
  if (trend === 'decreasing') return <TrendingDown className="h-3 w-3 text-green-400" />;
  return <Minus className="h-3 w-3 text-slate-400" />;
};

export function CaseTrackingMap() {
  const [isClient, setIsClient] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseLocation | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
              {showHeatmap ? 'Markers' : 'Heatmap'}
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
          {isClient ? (
            <MapContainer
              center={[9.0820, 8.6753]}
              zoom={6}
              style={{ width: '100%', height: '100%', background: '#0a0820' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {mockCaseData.map((loc) => (
                <CircleMarker
                  key={loc.id}
                  center={[loc.lat, loc.lng]}
                  radius={getMarkerRadius(loc.cases)}
                  pathOptions={{
                    color: getSeverityColor(loc.severity),
                    fillColor: getSeverityColor(loc.severity),
                    fillOpacity: 0.7,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => setSelectedCase(loc),
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px] text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{loc.disease}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          loc.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          loc.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          loc.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {loc.severity}
                        </span>
                      </div>
                      <p className="text-gray-600">{loc.region} State</p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-center p-1 bg-gray-100 rounded">
                          <p className="font-bold">{loc.cases}</p>
                          <p className="text-xs text-gray-500">Cases</p>
                        </div>
                        <div className="text-center p-1 bg-red-50 rounded">
                          <p className="font-bold text-red-600">{loc.deaths}</p>
                          <p className="text-xs text-gray-500">Deaths</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Trend: {loc.trend}</p>
                      <p className="text-xs text-gray-400">Updated: {loc.lastUpdated}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          ) : (
            <div className="flex h-full items-center justify-center bg-[#0a0820]">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-indigo-500/50 mx-auto mb-2 animate-pulse" />
                <p className="text-slate-400 text-sm">Loading map...</p>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-white/10 bg-[#0a0820]/90 p-3 backdrop-blur-xl">
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
            <div className="absolute right-4 top-4 z-[1000] flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 backdrop-blur-xl">
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
