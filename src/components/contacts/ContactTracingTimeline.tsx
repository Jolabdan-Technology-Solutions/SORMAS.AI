'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GitBranch,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TracingEvent {
  id: string;
  date: string;
  type: 'exposure' | 'symptom_onset' | 'test' | 'follow_up' | 'conversion' | 'completion';
  title: string;
  description: string;
  person: string;
  linkedCase?: string;
  result?: string;
}

// Mock tracing timeline data
const mockTracingData: TracingEvent[] = [
  {
    id: '1',
    date: '2024-01-10',
    type: 'exposure',
    title: 'Initial Exposure',
    description: 'Contact with confirmed case during household visit',
    person: 'Sarah Williams',
    linkedCase: 'CASE-001',
  },
  {
    id: '2',
    date: '2024-01-11',
    type: 'follow_up',
    title: 'Contact Identified',
    description: 'Contact identified and registered in system',
    person: 'Sarah Williams',
  },
  {
    id: '3',
    date: '2024-01-12',
    type: 'follow_up',
    title: 'Day 1 Follow-up',
    description: 'No symptoms reported, temperature 36.5°C',
    person: 'Sarah Williams',
    result: 'healthy',
  },
  {
    id: '4',
    date: '2024-01-14',
    type: 'symptom_onset',
    title: 'Symptom Onset',
    description: 'Reported mild fever and headache',
    person: 'Sarah Williams',
  },
  {
    id: '5',
    date: '2024-01-15',
    type: 'test',
    title: 'Sample Collection',
    description: 'Nasopharyngeal swab collected for PCR testing',
    person: 'Sarah Williams',
  },
  {
    id: '6',
    date: '2024-01-16',
    type: 'test',
    title: 'Test Result',
    description: 'PCR test returned positive',
    person: 'Sarah Williams',
    result: 'positive',
  },
  {
    id: '7',
    date: '2024-01-16',
    type: 'conversion',
    title: 'Converted to Case',
    description: 'Contact converted to confirmed case, new case ID assigned',
    person: 'Sarah Williams',
    linkedCase: 'CASE-045',
  },
];

const getEventIcon = (type: string) => {
  switch (type) {
    case 'exposure':
      return <AlertTriangle className="h-4 w-4" />;
    case 'symptom_onset':
      return <Clock className="h-4 w-4" />;
    case 'test':
      return <GitBranch className="h-4 w-4" />;
    case 'follow_up':
      return <User className="h-4 w-4" />;
    case 'conversion':
      return <ArrowRight className="h-4 w-4" />;
    case 'completion':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case 'exposure':
      return 'from-orange-500 to-red-500';
    case 'symptom_onset':
      return 'from-yellow-500 to-orange-500';
    case 'test':
      return 'from-blue-500 to-indigo-500';
    case 'follow_up':
      return 'from-cyan-500 to-blue-500';
    case 'conversion':
      return 'from-red-500 to-pink-500';
    case 'completion':
      return 'from-green-500 to-emerald-500';
    default:
      return 'from-slate-500 to-slate-600';
  }
};

const getEventBorderColor = (type: string) => {
  switch (type) {
    case 'exposure':
      return 'border-l-orange-500';
    case 'symptom_onset':
      return 'border-l-yellow-500';
    case 'test':
      return 'border-l-blue-500';
    case 'follow_up':
      return 'border-l-cyan-500';
    case 'conversion':
      return 'border-l-red-500';
    case 'completion':
      return 'border-l-green-500';
    default:
      return 'border-l-slate-500';
  }
};

export function ContactTracingTimeline() {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className="border-white/10 bg-[#0a0820]/80 backdrop-blur-xl">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Contact Tracing Timeline</CardTitle>
              <p className="text-sm text-slate-400">Follow the exposure-to-outcome journey</p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
          >
            {expanded ? (
              <>
                Collapse <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Expand <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Timeline Legend */}
        <div className="mb-6 flex flex-wrap gap-4">
          {[
            { type: 'exposure', label: 'Exposure' },
            { type: 'symptom_onset', label: 'Symptoms' },
            { type: 'test', label: 'Testing' },
            { type: 'follow_up', label: 'Follow-up' },
            { type: 'conversion', label: 'Conversion' },
            { type: 'completion', label: 'Completed' },
          ].map((item) => (
            <div key={item.type} className="flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${getEventColor(item.type)}`}>
                {getEventIcon(item.type)}
              </div>
              <span className="text-xs text-slate-400">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Timeline */}
        {expanded && (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/50 via-purple-500/50 to-pink-500/50" />

            <div className="space-y-4">
              {mockTracingData.map((event, index) => (
                <div key={event.id} className="relative flex gap-4 animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                  {/* Node */}
                  <div className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getEventColor(event.type)} shadow-lg`}>
                    {getEventIcon(event.type)}
                  </div>

                  {/* Content Card */}
                  <div className={`flex-1 rounded-xl border-l-4 ${getEventBorderColor(event.type)} border border-white/10 bg-white/5 p-4 backdrop-blur-sm hover:bg-white/10 transition-colors`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">{event.title}</h4>
                          {event.result === 'positive' && (
                            <Badge variant="destructive" className="text-xs">Positive</Badge>
                          )}
                          {event.result === 'healthy' && (
                            <Badge variant="success" className="text-xs">Healthy</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{event.description}</p>
                        {event.linkedCase && (
                          <p className="mt-2 text-xs text-indigo-400">
                            Linked Case: <span className="font-mono">{event.linkedCase}</span>
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{event.date}</p>
                        <p className="text-xs text-slate-500">{event.person}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-4 gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">6</p>
            <p className="text-xs text-slate-400">Days to Conversion</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-xs text-slate-400">Follow-up Visits</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">1</p>
            <p className="text-xs text-slate-400">Tests Performed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">100%</p>
            <p className="text-xs text-slate-400">Compliance Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
