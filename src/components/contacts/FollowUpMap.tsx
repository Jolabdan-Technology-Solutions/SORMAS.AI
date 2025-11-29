'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Navigation,
  Layers,
  Filter,
  User,
  Calendar,
  Phone,
  AlertTriangle,
} from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox public token - you should use your own token in production
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

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
  const [viewState, setViewState] = useState({
    latitude: 6.5244,
    longitude: 3.3792,
    zoom: 11,
  });
  const [selectedContact, setSelectedContact] = useState<ContactLocation | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/dark-v11');

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
          <div className="flex items-center gap-2">
            <Button
              variant={mapStyle.includes('dark') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMapStyle('mapbox://styles/mapbox/dark-v11')}
            >
              Dark
            </Button>
            <Button
              variant={mapStyle.includes('satellite') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMapStyle('mapbox://styles/mapbox/satellite-streets-v12')}
            >
              Satellite
            </Button>
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
          <Map
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapStyle={mapStyle}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: '100%', height: '100%' }}
          >
            <NavigationControl position="top-right" />

            {/* Markers */}
            {filteredContacts.map((contact) => (
              <Marker
                key={contact.id}
                latitude={contact.lat}
                longitude={contact.lng}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedContact(contact);
                }}
              >
                <div
                  className="relative cursor-pointer transition-transform hover:scale-110"
                  style={{ transform: selectedContact?.id === contact.id ? 'scale(1.2)' : 'scale(1)' }}
                >
                  {/* Pulse animation for pending/symptomatic */}
                  {(contact.status === 'pending' || contact.status === 'symptomatic') && (
                    <div
                      className="absolute -inset-2 animate-ping rounded-full opacity-30"
                      style={{ backgroundColor: getMarkerColor(contact.status) }}
                    />
                  )}
                  {/* Marker */}
                  <div
                    className="relative flex h-8 w-8 items-center justify-center rounded-full shadow-lg"
                    style={{
                      backgroundColor: getMarkerColor(contact.status),
                      boxShadow: `0 0 20px ${getMarkerColor(contact.status)}80`,
                    }}
                  >
                    <User className="h-4 w-4 text-white" />
                  </div>
                  {/* Risk indicator */}
                  {contact.riskLevel === 'high' && (
                    <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                      <AlertTriangle className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
              </Marker>
            ))}

            {/* Popup */}
            {selectedContact && (
              <Popup
                latitude={selectedContact.lat}
                longitude={selectedContact.lng}
                anchor="top"
                onClose={() => setSelectedContact(null)}
                closeButton={true}
                closeOnClick={false}
                className="contact-popup"
              >
                <div className="w-64 rounded-lg bg-[#0a0820] p-4 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{selectedContact.name}</h3>
                      <p className="text-xs text-slate-400">{selectedContact.id}</p>
                    </div>
                    <Badge
                      variant={
                        selectedContact.status === 'visited'
                          ? 'success'
                          : selectedContact.status === 'missed' || selectedContact.status === 'symptomatic'
                          ? 'destructive'
                          : 'warning'
                      }
                    >
                      {getStatusLabel(selectedContact.status)}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-300">{selectedContact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-300">Last: {selectedContact.lastVisit}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Navigation className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-300">Next: {selectedContact.nextVisit}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Follow-up Progress</span>
                      <span>{selectedContact.visitNumber}/{selectedContact.totalVisits}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${(selectedContact.visitNumber / selectedContact.totalVisits) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="flex-1 h-8 text-xs">
                      Start Visit
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      Navigate
                    </Button>
                  </div>
                </div>
              </Popup>
            )}
          </Map>

          {/* Stats Overlay */}
          <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-[#0a0820]/90 p-3 backdrop-blur-xl">
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
        </div>
      </CardContent>
    </Card>
  );
}
