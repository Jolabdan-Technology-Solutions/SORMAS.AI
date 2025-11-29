'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  Eye,
} from 'lucide-react';

const diseases = [
  { id: 1, name: 'Cholera', code: 'CHOLERA', category: 'Bacterial', notifiable: true, outbreak_threshold: 50, active: true, case_count: 2340 },
  { id: 2, name: 'Malaria', code: 'MALARIA', category: 'Parasitic', notifiable: true, outbreak_threshold: 500, active: true, case_count: 5678 },
  { id: 3, name: 'COVID-19', code: 'COVID19', category: 'Viral', notifiable: true, outbreak_threshold: 100, active: true, case_count: 1234 },
  { id: 4, name: 'Measles', code: 'MEASLES', category: 'Viral', notifiable: true, outbreak_threshold: 15, active: true, case_count: 890 },
  { id: 5, name: 'Lassa Fever', code: 'LASSA', category: 'Viral', notifiable: true, outbreak_threshold: 10, active: true, case_count: 145 },
  { id: 6, name: 'Yellow Fever', code: 'YF', category: 'Viral', notifiable: true, outbreak_threshold: 10, active: true, case_count: 78 },
  { id: 7, name: 'Typhoid', code: 'TYPHOID', category: 'Bacterial', notifiable: true, outbreak_threshold: 30, active: true, case_count: 456 },
  { id: 8, name: 'Meningitis', code: 'MENINGITIS', category: 'Bacterial', notifiable: true, outbreak_threshold: 20, active: true, case_count: 234 },
  { id: 9, name: 'Polio', code: 'POLIO', category: 'Viral', notifiable: true, outbreak_threshold: 1, active: true, case_count: 0 },
  { id: 10, name: 'Ebola', code: 'EBOLA', category: 'Viral', notifiable: true, outbreak_threshold: 1, active: true, case_count: 0 },
  { id: 11, name: 'Monkeypox', code: 'MPOX', category: 'Viral', notifiable: true, outbreak_threshold: 5, active: true, case_count: 23 },
  { id: 12, name: 'Diphtheria', code: 'DIPHTHERIA', category: 'Bacterial', notifiable: true, outbreak_threshold: 5, active: false, case_count: 12 },
];

export default function DiseasesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDiseases = diseases.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Disease Configuration</h1>
          <p className="text-muted-foreground">
            Manage diseases tracked in the surveillance system
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Disease
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Diseases</p>
                <p className="text-2xl font-bold text-foreground">{diseases.length}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-foreground">{diseases.filter(d => d.active).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Notifiable</p>
                <p className="text-2xl font-bold text-foreground">{diseases.filter(d => d.notifiable).length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cases</p>
                <p className="text-2xl font-bold text-foreground">{diseases.reduce((s, d) => s + d.case_count, 0).toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="py-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search diseases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Diseases Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Disease</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Outbreak Threshold</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Current Cases</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDiseases.map((disease) => (
                  <tr key={disease.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">{disease.name}</span>
                        {disease.notifiable && (
                          <Badge variant="outline" className="text-xs">Notifiable</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm text-primary">{disease.code}</code>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{disease.category}</td>
                    <td className="px-6 py-4 text-center text-foreground">{disease.outbreak_threshold}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={disease.case_count > disease.outbreak_threshold ? 'text-destructive font-medium' : 'text-foreground'}>
                        {disease.case_count.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={disease.active ? 'success' : 'secondary'}>
                        {disease.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
