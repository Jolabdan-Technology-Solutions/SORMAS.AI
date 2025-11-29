'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Upload,
  Download,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit2,
  MapPin,
} from 'lucide-react';
import { useTenantStore } from '@/lib/stores/tenant-store';

// Mock data for hierarchy levels
const mockLevels = [
  { id: '1', level: 0, name: 'Country', name_plural: 'Countries', count: 1 },
  { id: '2', level: 1, name: 'State', name_plural: 'States', count: 36 },
  { id: '3', level: 2, name: 'LGA', name_plural: 'LGAs', count: 774 },
  { id: '4', level: 3, name: 'Ward', name_plural: 'Wards', count: 8812 },
  {
    id: '5',
    level: 4,
    name: 'Health Facility',
    name_plural: 'Health Facilities',
    count: 34567,
    is_lowest: true,
  },
];

// Mock admin units tree
const mockTree = [
  {
    id: 'nga',
    name: 'Nigeria',
    code: 'NGA',
    level: 0,
    children: [
      {
        id: 'lag',
        name: 'Lagos',
        code: 'LAG',
        level: 1,
        population: 15000000,
        children: [
          { id: 'iko', name: 'Ikeja', code: 'IKO', level: 2, population: 500000 },
          {
            id: 'eti',
            name: 'Eti-Osa',
            code: 'ETO',
            level: 2,
            population: 400000,
          },
          {
            id: 'sur',
            name: 'Surulere',
            code: 'SUR',
            level: 2,
            population: 600000,
          },
        ],
      },
      {
        id: 'kan',
        name: 'Kano',
        code: 'KAN',
        level: 1,
        population: 12000000,
        children: [
          {
            id: 'knm',
            name: 'Kano Municipal',
            code: 'KNM',
            level: 2,
            population: 800000,
          },
          { id: 'fge', name: 'Fagge', code: 'FGE', level: 2, population: 300000 },
        ],
      },
      {
        id: 'ogu',
        name: 'Ogun',
        code: 'OGU',
        level: 1,
        population: 5000000,
        children: [],
      },
    ],
  },
];

interface TreeNodeProps {
  node: {
    id: string;
    name: string;
    code: string;
    level: number;
    population?: number;
    children?: TreeNodeProps['node'][];
  };
  expanded: Set<string>;
  toggleExpand: (id: string) => void;
}

function TreeNode({ node, expanded, toggleExpand }: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);

  return (
    <div className="select-none">
      <div
        className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50"
        style={{ paddingLeft: `${node.level * 24 + 12}px` }}
        onClick={() => hasChildren && toggleExpand(node.id)}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )
        ) : (
          <span className="w-4" />
        )}
        <MapPin className="h-4 w-4 text-gray-400" />
        <span className="flex-1 font-medium">{node.name}</span>
        <Badge variant="outline" className="text-xs">
          {node.code}
        </Badge>
        {node.population && (
          <span className="text-xs text-gray-500">
            Pop: {node.population.toLocaleString()}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            // Edit handler
          }}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              expanded={expanded}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HierarchyPage() {
  const { currentTenant } = useTenantStore();
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(['nga', 'lag'])
  );
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Administrative Hierarchy
          </h1>
          <p className="text-gray-500">
            Define the geographic structure for {currentTenant?.name || 'your country'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hierarchy Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Hierarchy Levels</CardTitle>
            <CardDescription>
              Define the administrative levels for your country
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockLevels.map((level, index) => (
                <div
                  key={level.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                      {level.level}
                    </span>
                    <div>
                      <p className="font-medium">{level.name}</p>
                      <p className="text-xs text-gray-500">
                        {level.count.toLocaleString()} {level.name_plural.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {level.is_lowest && (
                      <Badge variant="secondary">Lowest</Badge>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {index > 0 && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Level
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Administrative Units Tree */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Administrative Units</CardTitle>
                <CardDescription>
                  Browse and manage geographic units
                </CardDescription>
              </div>
              <Input
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-y-auto rounded-lg border border-gray-200">
              {mockTree.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  expanded={expanded}
                  toggleExpand={toggleExpand}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSV Import Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import</CardTitle>
          <CardDescription>
            Upload a CSV file to import administrative units in bulk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm font-medium text-gray-900">
              Drag and drop your CSV file here
            </p>
            <p className="mt-1 text-xs text-gray-500">
              or click to browse. File should include: name, code, parent_code,
              level, population (optional)
            </p>
            <Button variant="outline" className="mt-4">
              <Upload className="mr-2 h-4 w-4" />
              Select File
            </Button>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">
              Expected CSV format:
            </p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-100 p-3 text-xs">
              name,code,parent_code,level,population{'\n'}
              Nigeria,NGA,,0,200000000{'\n'}
              Lagos,LAG,NGA,1,15000000{'\n'}
              Ikeja,IKO,LAG,2,500000
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
