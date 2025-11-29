'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Calendar,
  MapPin,
  TestTube,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Beaker,
  User,
  Building,
  Thermometer,
  Truck,
  AlertTriangle,
  ClipboardList,
  Phone,
} from 'lucide-react';

// Mock sample data
const getMockSample = (id: string) => ({
  id,
  external_id: `SMP-2024-${id.padStart(5, '0')}`,
  case_id: 'NGA-2024-00123',
  case_name: 'John Doe',
  case_disease: 'Cholera',
  sample_type: 'stool',
  collection_date: '2024-01-11',
  collection_time: '09:30',
  received_date: '2024-01-11',
  received_time: '14:45',
  processing_date: '2024-01-11',
  result_date: '2024-01-12',
  status: 'completed',
  result: 'positive',
  lab: {
    name: 'NCDC Reference Laboratory',
    address: 'Plot 801 Ebitu Ukiwe Street, Jabi, Abuja',
    phone: '+234 903 000 0001',
    type: 'Reference Laboratory',
  },
  test_details: {
    test_type: 'Culture & Sensitivity',
    method: 'TCBS Agar Culture',
    pathogen_detected: 'Vibrio cholerae O1 El Tor Ogawa',
    ct_value: null,
    sensitivity: [
      { antibiotic: 'Tetracycline', result: 'Sensitive' },
      { antibiotic: 'Doxycycline', result: 'Sensitive' },
      { antibiotic: 'Ciprofloxacin', result: 'Resistant' },
      { antibiotic: 'Azithromycin', result: 'Sensitive' },
      { antibiotic: 'Erythromycin', result: 'Intermediate' },
    ],
    additional_findings: 'Colony morphology consistent with V. cholerae. Serotyping confirmed O1 serogroup.',
  },
  collection_details: {
    collector: 'Nurse Blessing Okafor',
    collector_phone: '+234 801 234 5678',
    facility: 'Lagos State University Teaching Hospital',
    collection_method: 'Rectal swab',
    specimen_condition: 'Good - transported in Cary-Blair medium',
    quantity: '5ml',
    storage_temp: '4°C',
  },
  transport: {
    method: 'Cold chain courier',
    transport_time: '5 hours 15 minutes',
    temperature_maintained: true,
    received_condition: 'Good',
  },
  quality: {
    specimen_quality: 'Adequate',
    rejection_reason: null,
    repeat_required: false,
  },
  timeline: [
    { timestamp: '2024-01-11 09:30', event: 'Sample collected', user: 'Nurse Blessing Okafor' },
    { timestamp: '2024-01-11 10:00', event: 'Sample packaged for transport', user: 'Nurse Blessing Okafor' },
    { timestamp: '2024-01-11 10:15', event: 'Courier pickup', user: 'Medical Courier Services' },
    { timestamp: '2024-01-11 14:45', event: 'Sample received at lab', user: 'Lab Technician M. Ibrahim' },
    { timestamp: '2024-01-11 15:00', event: 'Sample accessioned', user: 'Lab Technician M. Ibrahim' },
    { timestamp: '2024-01-11 15:30', event: 'Processing started', user: 'Lab Technician M. Ibrahim' },
    { timestamp: '2024-01-12 09:00', event: 'Preliminary results available', user: 'Dr. Sarah Adeyemi' },
    { timestamp: '2024-01-12 14:00', event: 'Final results released', user: 'Dr. Sarah Adeyemi' },
    { timestamp: '2024-01-12 14:30', event: 'Results communicated to facility', user: 'Dr. Sarah Adeyemi' },
  ],
  turnaround_time: {
    collection_to_receipt: '5h 15m',
    receipt_to_result: '23h 15m',
    total: '28h 30m',
    target: '48h',
    met_target: true,
  },
  reporting_info: {
    reported_by: 'Dr. Sarah Adeyemi',
    verified_by: 'Dr. James Okonkwo',
    report_date: '2024-01-12',
  },
});

export default function SampleDetailPage() {
  const params = useParams();
  const sampleId = params.id as string;
  const sample = getMockSample(sampleId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'positive':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Positive</Badge>;
      case 'negative':
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" /> Negative</Badge>;
      case 'inconclusive':
        return <Badge variant="warning">Inconclusive</Badge>;
      default:
        return <Badge variant="secondary">{result}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/samples">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Samples
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{sample.external_id}</h1>
              {getStatusBadge(sample.status)}
              {getResultBadge(sample.result)}
            </div>
            <p className="text-muted-foreground">
              {sample.sample_type} sample • {sample.test_details.test_type}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Sample
          </Button>
        </div>
      </div>

      {/* Turnaround Time Summary */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Turnaround Time</h3>
              <p className="text-sm text-muted-foreground">Target: {sample.turnaround_time.target}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{sample.turnaround_time.total}</p>
              <Badge variant={sample.turnaround_time.met_target ? 'success' : 'destructive'}>
                {sample.turnaround_time.met_target ? 'Target Met' : 'Target Exceeded'}
              </Badge>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{sample.turnaround_time.collection_to_receipt}</p>
              <p className="text-xs text-muted-foreground">Collection to Receipt</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{sample.turnaround_time.receipt_to_result}</p>
              <p className="text-xs text-muted-foreground">Receipt to Result</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <p className="text-lg font-bold text-primary">{sample.turnaround_time.total}</p>
              <p className="text-xs text-muted-foreground">Total Time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Test Results */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-primary" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Test Type</p>
                <p className="font-medium text-foreground">{sample.test_details.test_type}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Method</p>
                <p className="font-medium text-foreground">{sample.test_details.method}</p>
              </div>
            </div>

            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-xs text-muted-foreground">Pathogen Detected</p>
              <p className="text-lg font-semibold text-destructive">{sample.test_details.pathogen_detected}</p>
            </div>

            <div>
              <p className="mb-3 font-medium text-foreground">Antibiotic Sensitivity</p>
              <div className="space-y-2">
                {sample.test_details.sensitivity.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm text-foreground">{item.antibiotic}</span>
                    <Badge variant={
                      item.result === 'Sensitive' ? 'success' :
                      item.result === 'Resistant' ? 'destructive' : 'warning'
                    }>
                      {item.result}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Additional Findings</p>
              <p className="mt-1 text-sm text-foreground">{sample.test_details.additional_findings}</p>
            </div>
          </CardContent>
        </Card>

        {/* Source Case */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Source Case
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href={`/cases/${sample.case_id}`}>
              <div className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-primary">{sample.case_id}</span>
                  <Badge variant="destructive">{sample.case_disease}</Badge>
                </div>
                <p className="mt-2 font-medium text-foreground">{sample.case_name}</p>
              </div>
            </Link>

            <div className="space-y-3 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Sample Type</p>
                <p className="text-sm font-medium text-foreground capitalize">{sample.sample_type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Collection Date</p>
                <p className="text-sm font-medium text-foreground">{sample.collection_date} at {sample.collection_time}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Result Date</p>
                <p className="text-sm font-medium text-foreground">{sample.result_date}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection & Transport Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Collection Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              Collection Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{sample.collection_details.collector}</p>
                <p className="text-sm text-muted-foreground">{sample.collection_details.facility}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Collection Method</p>
                <p className="text-sm font-medium text-foreground">{sample.collection_details.collection_method}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Quantity</p>
                <p className="text-sm font-medium text-foreground">{sample.collection_details.quantity}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Storage Temperature</p>
                <p className="text-sm font-medium text-foreground">{sample.collection_details.storage_temp}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Specimen Condition</p>
                <p className="text-sm font-medium text-foreground">{sample.collection_details.specimen_condition}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transport & Laboratory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Transport & Laboratory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Transport Method</p>
                <p className="text-sm font-medium text-foreground">{sample.transport.method}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Transport Time</p>
                <p className="text-sm font-medium text-foreground">{sample.transport.transport_time}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cold Chain</p>
                <Badge variant={sample.transport.temperature_maintained ? 'success' : 'destructive'}>
                  {sample.transport.temperature_maintained ? 'Maintained' : 'Broken'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Received Condition</p>
                <p className="text-sm font-medium text-foreground">{sample.transport.received_condition}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{sample.lab.name}</p>
                  <p className="text-xs text-muted-foreground">{sample.lab.type}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{sample.lab.address}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Sample Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sample.timeline.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  {idx < sample.timeline.length - 1 && (
                    <div className="h-full w-px bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{item.event}</p>
                    <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.user}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reporting Info */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Reported by: {sample.reporting_info.reported_by}</span>
              <span>•</span>
              <span>Verified by: {sample.reporting_info.verified_by}</span>
            </div>
            <span>Report Date: {sample.reporting_info.report_date}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
