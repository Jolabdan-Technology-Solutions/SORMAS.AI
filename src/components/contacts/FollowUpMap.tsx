'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Navigation,
  Filter,
  User,
  Calendar,
  Phone,
  AlertTriangle,
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

interface ContactLocation {
  id: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
  status: 'pending' | 'visited' | 'missed' | 'symptomatic';
  lastVisit: string;
  nextVisit: string;
  riskLevel: 'high' | 'medium' | 'low';
  visitNumber: number;
  totalVisits: number;
}

// Mock contact locations (Lagos, Nigeria area)
const mockContactLocations: ContactLocation[] = [
  {
    id: 'CNT-001',
    name: 'Sarah Williams',
    phone: '+234 801 234 5678',
    lat: 6.5244,
    lng: 3.3792,
    status: 'pending',
    lastVisit: '2024-01-19',
    nextVisit: '2024-01-21',
    riskLevel: 'high',
    visitNumber: 5,
    totalVisits: 21,
  },
  {
    id: 'CNT-002',
    name: 'Michael Brown',
    phone: '+234 802 345 6789',
    lat: 6.4281,
    lng: 3.4219,
    status: 'visited',
    lastVisit: '2024-01-20',
    nextVisit: '2024-01-21',
    riskLevel: 'medium',
    visitNumber: 6,
    totalVisits: 21,
  },
  {
    id: 'CNT-003',
    name: 'Elizabeth Okonkwo',
    phone: '+234 803 456 7890',
    lat: 6.4698,
    lng: 3.5852,
    status: 'symptomatic',
    lastVisit: '2024-01-20',
    nextVisit: '2024-01-21',
    riskLevel: 'high',
    visitNumber: 8,
    totalVisits: 21,
  },
  {
    id: 'CNT-004',
    name: 'David Adebayo',
    phone: '+234 804 567 8901',
    lat: 6.5955,
    lng: 3.3421,
    status: 'missed',
    lastVisit: '2024-01-18',
    nextVisit: '2024-01-20',
    riskLevel: 'low',
    visitNumber: 3,
    totalVisits: 21,
  },
  {
    id: 'CNT-005',
    name: 'Grace Eze',
    phone: '+234 805 678 9012',
    lat: 6.4523,
    lng: 3.3965,
    status: 'pending',
    lastVisit: '2024-01-19',
    nextVisit: '2024-01-21',
    riskLevel: 'high',
    visitNumber: 7,
    totalVisits: 21,
  },
  {
    id: 'CNT-006',
    name: 'Peter Nnamdi',
    phone: '+234 806 789 0123',
    lat: 6.5089,
    lng: 3.3567,
    status: 'visited',
    lastVisit: '2024-01-20',
    nextVisit: '2024-01-21',
    riskLevel: 'medium',
    visitNumber: 10,
    totalVisits: 21,
  },
];

const getMarkerColor = (status: string) => {
  switch (status) {
    case 'pending':
      return '#eab308'; // yellow
    case 'visited':
      return '#22c55e'; // green
    case 'missed':
      return '#ef4444'; // red
    case 'symptomatic':
      return '#f97316'; // orange
    default:
      return '#6366f1'; // indigo
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending Visit';
    case 'visited':
      return 'Visited Today';
    case 'missed':
      return 'Missed Visit';
    case 'symptomatic':
      return 'Symptomatic';
    default:
      return status;
  }
};

export function FollowUpMap() {
  const [isClient, setIsClient] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<ContactLocation | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredContacts = mockContactLocations.filter((contact) => {
    if (filter === 'all') return true;
    return contact.status === filter;
  });

  const statusCounts = {
    pending: mockContactLocations.filter((c) => c.status === 'pending').length,
    visited: mockContactLocations.filter((c) => c.status === 'visited').length,
    missed: mockContactLocations.filter((c) => c.status === 'missed').length,
    symptomatic: mockContactLocations.filter((c) => c.status === 'symptomatic').length,
  };

  return (
    <Card className="border-white/10 bg-[#0a0820]/80 backdrop-blur-xl">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Follow-up Map</CardTitle>
              <p className="text-sm text-slate-400">Real-time contact locations and visit status</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Filter Bar */}
        <div className="flex items-center gap-4 border-b border-white/10 px-6 py-3">
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">Filter:</span>
          </div>
          <button
            onClick={() => setFilter('all')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === 'all' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({mockContactLocations.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            Pending ({statusCounts.pending})
          </button>
          <button
            onClick={() => setFilter('visited')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === 'visited' ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="h-2 w-2 rounded-full bg-green-500" />
            Visited ({statusCounts.visited})
          </button>
          <button
            onClick={() => setFilter('missed')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === 'missed' ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="h-2 w-2 rounded-full bg-red-500" />
            Missed ({statusCounts.missed})
          </button>
          <button
            onClick={() => setFilter('symptomatic')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === 'symptomatic' ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            Symptomatic ({statusCounts.symptomatic})
          </button>
        </div>

        {/* Map */}
        <div className="relative h-[500px]">
          {isClient ? (
            <MapContainer
              center={[6.5244, 3.3792]}
              zoom={11}
              style={{ width: '100%', height: '100%', background: '#0a0820' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {filteredContacts.map((contact) => (
                <CircleMarker
                  key={contact.id}
                  center={[contact.lat, contact.lng]}
                  radius={12}
                  pathOptions={{
                    color: getMarkerColor(contact.status),
                    fillColor: getMarkerColor(contact.status),
                    fillOpacity: 0.8,
                    weight: contact.status === 'pending' || contact.status === 'symptomatic' ? 3 : 2,
                  }}
                  eventHandlers={{
                    click: () => setSelectedContact(contact),
                  }}
                >
                  <Popup>
                    <div className="min-w-[220px] text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{contact.name}</h3>
                          {contact.riskLevel === 'high' && (
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          contact.status === 'visited' ? 'bg-green-100 text-green-700' :
                          contact.status === 'missed' ? 'bg-red-100 text-red-700' :
                          contact.status === 'symptomatic' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {getStatusLabel(contact.status)}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mb-2">{contact.id}</p>
                      <div className="space-y-1 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{contact.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Last: {contact.lastVisit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Navigation className="h-3 w-3" />
                          <span>Next: {contact.nextVisit}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Follow-up Progress</span>
                          <span>{contact.visitNumber}/{contact.totalVisits}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${(contact.visitNumber / contact.totalVisits) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          ) : (
            <div className="flex h-full items-center justify-center bg-[#0a0820]">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-emerald-500/50 mx-auto mb-2 animate-pulse" />
                <p className="text-slate-400 text-sm">Loading map...</p>
              </div>
            </div>
          )}

          {/* Stats Overlay */}
          <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-white/10 bg-[#0a0820]/90 p-3 backdrop-blur-xl">
            <p className="text-xs font-medium text-slate-400 mb-2">Today&apos;s Summary</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-lg font-bold text-green-400">{statusCounts.visited}</p>
                <p className="text-xs text-slate-500">Completed</p>
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-400">{statusCounts.pending}</p>
                <p className="text-xs text-slate-500">Pending</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-400">{statusCounts.missed}</p>
                <p className="text-xs text-slate-500">Missed</p>
              </div>
              <div>
                <p className="text-lg font-bold text-orange-400">{statusCounts.symptomatic}</p>
                <p className="text-xs text-slate-500">Symptomatic</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 z-[1000] rounded-xl border border-white/10 bg-[#0a0820]/90 p-3 backdrop-blur-xl">
            <p className="text-xs font-medium text-slate-400 mb-2">Status</p>
            <div className="space-y-1.5">
              {[
                { label: 'Pending', color: '#eab308' },
                { label: 'Visited', color: '#22c55e' },
                { label: 'Missed', color: '#ef4444' },
                { label: 'Symptomatic', color: '#f97316' },
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
        </div>
      </CardContent>
    </Card>
  );
}
