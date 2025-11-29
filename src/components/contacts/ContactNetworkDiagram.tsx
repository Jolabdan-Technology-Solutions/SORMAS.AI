'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Users,
  User,
  AlertTriangle,
} from 'lucide-react';

interface NetworkNode {
  id: string;
  type: 'case' | 'contact';
  name: string;
  status: string;
  risk?: string;
  x: number;
  y: number;
  connections: string[];
}

interface NetworkLink {
  source: string;
  target: string;
  relationship: string;
  contactDate: string;
}

// Mock network data
const mockNetworkData = {
  nodes: [
    { id: 'CASE-001', type: 'case' as const, name: 'John Okoro', status: 'confirmed', x: 400, y: 300, connections: ['CNT-001', 'CNT-002', 'CNT-003', 'CNT-004'] },
    { id: 'CNT-001', type: 'contact' as const, name: 'Sarah Williams', status: 'under_follow_up', risk: 'high', x: 250, y: 150, connections: ['CASE-001', 'CNT-005'] },
    { id: 'CNT-002', type: 'contact' as const, name: 'Michael Brown', status: 'under_follow_up', risk: 'medium', x: 550, y: 150, connections: ['CASE-001'] },
    { id: 'CNT-003', type: 'contact' as const, name: 'Elizabeth Okonkwo', status: 'completed', risk: 'high', x: 250, y: 450, connections: ['CASE-001'] },
    { id: 'CNT-004', type: 'contact' as const, name: 'David Adebayo', status: 'converted_to_case', risk: 'high', x: 550, y: 450, connections: ['CASE-001', 'CNT-006', 'CNT-007'] },
    { id: 'CNT-005', type: 'contact' as const, name: 'Grace Eze', status: 'under_follow_up', risk: 'low', x: 100, y: 250, connections: ['CNT-001'] },
    { id: 'CNT-006', type: 'contact' as const, name: 'Peter Nnamdi', status: 'under_follow_up', risk: 'medium', x: 650, y: 350, connections: ['CNT-004'] },
    { id: 'CNT-007', type: 'contact' as const, name: 'Fatima Musa', status: 'under_follow_up', risk: 'high', x: 700, y: 550, connections: ['CNT-004'] },
  ],
  links: [
    { source: 'CASE-001', target: 'CNT-001', relationship: 'spouse', contactDate: '2024-01-14' },
    { source: 'CASE-001', target: 'CNT-002', relationship: 'colleague', contactDate: '2024-01-13' },
    { source: 'CASE-001', target: 'CNT-003', relationship: 'nurse', contactDate: '2024-01-12' },
    { source: 'CASE-001', target: 'CNT-004', relationship: 'neighbor', contactDate: '2024-01-11' },
    { source: 'CNT-001', target: 'CNT-005', relationship: 'friend', contactDate: '2024-01-15' },
    { source: 'CNT-004', target: 'CNT-006', relationship: 'colleague', contactDate: '2024-01-16' },
    { source: 'CNT-004', target: 'CNT-007', relationship: 'family', contactDate: '2024-01-17' },
  ],
};

export function ContactNetworkDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const getNodeColor = (node: NetworkNode) => {
    if (node.type === 'case') return '#ef4444';
    if (node.status === 'converted_to_case') return '#f97316';
    if (node.risk === 'high') return '#eab308';
    if (node.risk === 'medium') return '#3b82f6';
    return '#22c55e';
  };

  const getNodeGlow = (node: NetworkNode) => {
    if (node.type === 'case') return 'rgba(239, 68, 68, 0.5)';
    if (node.status === 'converted_to_case') return 'rgba(249, 115, 22, 0.5)';
    if (node.risk === 'high') return 'rgba(234, 179, 8, 0.5)';
    if (node.risk === 'medium') return 'rgba(59, 130, 246, 0.5)';
    return 'rgba(34, 197, 94, 0.5)';
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  return (
    <Card className="border-white/10 bg-[#0a0820]/80 backdrop-blur-xl">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Network className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Contact Network</CardTitle>
              <p className="text-sm text-slate-400">Case-contact relationship visualization</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.min(z + 0.2, 2))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={resetView}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 border-b border-white/10 px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-red-500" />
            <span className="text-xs text-slate-400">Case (Index)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-orange-500" />
            <span className="text-xs text-slate-400">Converted to Case</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
            <span className="text-xs text-slate-400">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-blue-500" />
            <span className="text-xs text-slate-400">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-green-500" />
            <span className="text-xs text-slate-400">Low Risk</span>
          </div>
        </div>

        {/* Network Diagram */}
        <div
          className="relative h-[500px] overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <svg
            ref={svgRef}
            className="h-full w-full"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transformOrigin: 'center center',
            }}
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="rgba(99, 102, 241, 0.6)" />
              </marker>
            </defs>

            {/* Links */}
            {mockNetworkData.links.map((link, i) => {
              const source = mockNetworkData.nodes.find(n => n.id === link.source);
              const target = mockNetworkData.nodes.find(n => n.id === link.target);
              if (!source || !target) return null;

              const isHighlighted = hoveredNode === link.source || hoveredNode === link.target;

              return (
                <g key={i}>
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={isHighlighted ? 'rgba(99, 102, 241, 0.8)' : 'rgba(99, 102, 241, 0.3)'}
                    strokeWidth={isHighlighted ? 2 : 1}
                    strokeDasharray={link.relationship === 'family' || link.relationship === 'spouse' ? '0' : '5,5'}
                    markerEnd="url(#arrowhead)"
                  />
                  {isHighlighted && (
                    <text
                      x={(source.x + target.x) / 2}
                      y={(source.y + target.y) / 2 - 10}
                      fill="rgba(148, 163, 184, 0.9)"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {link.relationship}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {mockNetworkData.nodes.map((node) => {
              const isHovered = hoveredNode === node.id;
              const isSelected = selectedNode?.id === node.id;
              const nodeSize = node.type === 'case' ? 30 : 22;

              return (
                <g
                  key={node.id}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(node)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Glow effect */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeSize + 10}
                    fill={getNodeGlow(node)}
                    opacity={isHovered || isSelected ? 0.5 : 0}
                    className="transition-opacity duration-200"
                  />

                  {/* Node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeSize}
                    fill={getNodeColor(node)}
                    stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.2)'}
                    strokeWidth={isSelected ? 3 : 1}
                    filter={isHovered || isSelected ? 'url(#glow)' : undefined}
                    className="transition-all duration-200"
                  />

                  {/* Icon */}
                  {node.type === 'case' ? (
                    <text
                      x={node.x}
                      y={node.y + 5}
                      fill="white"
                      fontSize="18"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      C
                    </text>
                  ) : (
                    <text
                      x={node.x}
                      y={node.y + 4}
                      fill="white"
                      fontSize="12"
                      textAnchor="middle"
                    >
                      {node.name.split(' ').map(n => n[0]).join('')}
                    </text>
                  )}

                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.y + nodeSize + 15}
                    fill="rgba(248, 250, 252, 0.9)"
                    fontSize="11"
                    textAnchor="middle"
                    fontWeight="500"
                  >
                    {node.name}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + nodeSize + 28}
                    fill="rgba(148, 163, 184, 0.7)"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    {node.id}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Selected Node Info Panel */}
          {selectedNode && (
            <div className="absolute bottom-4 left-4 w-72 rounded-xl border border-white/10 bg-[#0a0820]/95 p-4 backdrop-blur-xl animate-slide-in">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: getNodeColor(selectedNode) }}
                  >
                    {selectedNode.type === 'case' ? (
                      <AlertTriangle className="h-5 w-5 text-white" />
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{selectedNode.name}</p>
                    <p className="text-xs text-slate-400">{selectedNode.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Type</span>
                  <Badge variant={selectedNode.type === 'case' ? 'destructive' : 'secondary'}>
                    {selectedNode.type === 'case' ? 'Index Case' : 'Contact'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Status</span>
                  <span className="text-sm text-white capitalize">{selectedNode.status.replace(/_/g, ' ')}</span>
                </div>
                {selectedNode.risk && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Risk Level</span>
                    <Badge variant={selectedNode.risk === 'high' ? 'warning' : selectedNode.risk === 'medium' ? 'secondary' : 'success'}>
                      {selectedNode.risk}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Connections</span>
                  <span className="text-sm text-white">{selectedNode.connections.length}</span>
                </div>
              </div>
              <Button className="mt-4 w-full" size="sm">
                View Full Details
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
