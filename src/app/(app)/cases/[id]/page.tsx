'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Calendar,
  MapPin,
  Activity,
  Phone,
  Mail,
  Building,
  HeartPulse,
  Stethoscope,
  FileText,
  Users,
  TestTube,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// Mock case data - in production this would come from API/database
const getMockCase = (id: string) => ({
  id,
  external_id: `NGA-2024-${id.padStart(5, '0')}`,
  disease: 'Cholera',
  classification: 'confirmed',
  outcome: 'recovered',
  report_date: '2024-01-15',
  onset_date: '2024-01-10',
  investigation_date: '2024-01-11',
  outcome_date: '2024-01-22',
  hospitalized: true,
  hospitalization_date: '2024-01-11',
  discharge_date: '2024-01-20',
  icu_admission: false,
  isolation: true,
  lab_confirmed: true,
  person: {
    first_name: 'John',
    last_name: 'Doe',
    age_years: 35,
    sex: 'male',
    date_of_birth: '1989-03-15',
    phone: '+234 801 234 5678',
    email: 'john.doe@email.com',
    occupation: 'Teacher',
    address: '15 Victoria Island Road',
    city: 'Lagos',
  },
  admin_unit: {
    country: 'Nigeria',
    state: 'Lagos',
    lga: 'Ikeja',
    ward: 'Oregun',
    facility: 'Lagos State University Teaching Hospital',
  },
  symptoms: [
    { name: 'Diarrhea', onset: '2024-01-10', severity: 'severe' },
    { name: 'Vomiting', onset: '2024-01-10', severity: 'moderate' },
    { name: 'Dehydration', onset: '2024-01-11', severity: 'severe' },
    { name: 'Abdominal cramps', onset: '2024-01-10', severity: 'mild' },
  ],
  contacts: [
    { id: '1', name: 'Sarah Williams', relationship: 'spouse', status: 'under_follow_up', risk: 'high' },
    { id: '2', name: 'Michael Brown', relationship: 'colleague', status: 'completed', risk: 'medium' },
    { id: '3', name: 'Grace Doe', relationship: 'child', status: 'under_follow_up', risk: 'high' },
  ],
  samples: [
    { id: '1', type: 'Stool', date: '2024-01-11', test: 'Culture', result: 'positive', lab: 'NCDC Reference Lab' },
    { id: '2', type: 'Blood', date: '2024-01-11', test: 'CBC', result: 'abnormal', lab: 'LUTH Lab' },
  ],
  timeline: [
    { date: '2024-01-10', event: 'Symptom onset', type: 'clinical' },
    { date: '2024-01-11', event: 'Case reported', type: 'surveillance' },
    { date: '2024-01-11', event: 'Hospitalized at LUTH', type: 'clinical' },
    { date: '2024-01-11', event: 'Sample collected', type: 'lab' },
    { date: '2024-01-12', event: 'Lab result: Positive', type: 'lab' },
    { date: '2024-01-12', event: 'Classification: Confirmed', type: 'surveillance' },
    { date: '2024-01-13', event: 'Contact tracing initiated', type: 'surveillance' },
    { date: '2024-01-20', event: 'Discharged from hospital', type: 'clinical' },
    { date: '2024-01-22', event: 'Outcome: Recovered', type: 'clinical' },
  ],
  epidemiological_data: {
    probable_source: 'Contaminated water from community well',
    exposure_location: 'Oregun Market Area',
    travel_history: 'None in past 14 days',
    vaccination_status: 'Not vaccinated',
    underlying_conditions: 'None reported',
  },
  reporting_user: 'Dr. Aisha Mohammed',
  last_updated: '2024-01-22T14:30:00',
});

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.id as string;
  const caseData = getMockCase(caseId);

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'confirmed':
        return <Badge variant="destructive">Confirmed</Badge>;
      case 'probable':
        return <Badge variant="warning">Probable</Badge>;
      case 'suspect':
        return <Badge variant="secondary">Suspect</Badge>;
      default:
        return <Badge>{classification}</Badge>;
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'recovered':
        return <Badge variant="success">Recovered</Badge>;
      case 'deceased':
        return <Badge variant="destructive">Deceased</Badge>;
      case 'ongoing':
        return <Badge variant="warning">Ongoing Treatment</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/cases">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cases
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{caseData.external_id}</h1>
              {getClassificationBadge(caseData.classification)}
              {getOutcomeBadge(caseData.outcome)}
            </div>
            <p className="text-muted-foreground">
              {caseData.disease} case reported on {caseData.report_date}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Case
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Person & Location */}
        <div className="space-y-6">
          {/* Person Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
                  {caseData.person.first_name[0]}{caseData.person.last_name[0]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {caseData.person.first_name} {caseData.person.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {caseData.person.age_years} years old, {caseData.person.sex}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">DOB:</span>
                  <span className="text-foreground">{caseData.person.date_of_birth}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{caseData.person.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{caseData.person.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{caseData.person.occupation}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-foreground">{caseData.person.address}, {caseData.person.city}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Administrative Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Country</span>
                  <span className="text-sm font-medium text-foreground">{caseData.admin_unit.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">State</span>
                  <span className="text-sm font-medium text-foreground">{caseData.admin_unit.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">LGA</span>
                  <span className="text-sm font-medium text-foreground">{caseData.admin_unit.lga}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ward</span>
                  <span className="text-sm font-medium text-foreground">{caseData.admin_unit.ward}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Health Facility</span>
                  <span className="text-sm font-medium text-foreground">{caseData.admin_unit.facility}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Clinical & Epi */}
        <div className="space-y-6">
          {/* Clinical Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Clinical Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Onset Date</p>
                  <p className="font-medium text-foreground">{caseData.onset_date}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Report Date</p>
                  <p className="font-medium text-foreground">{caseData.report_date}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Hospitalized</p>
                  <p className="font-medium text-foreground">{caseData.hospitalized ? 'Yes' : 'No'}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Lab Confirmed</p>
                  <p className="font-medium text-foreground">{caseData.lab_confirmed ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Symptoms</p>
                <div className="space-y-2">
                  {caseData.symptoms.map((symptom, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border border-border p-2">
                      <span className="text-sm text-foreground">{symptom.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={symptom.severity === 'severe' ? 'destructive' : symptom.severity === 'moderate' ? 'warning' : 'secondary'}>
                          {symptom.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Epidemiological Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Epidemiological Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Probable Source</p>
                <p className="text-sm font-medium text-foreground">{caseData.epidemiological_data.probable_source}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Exposure Location</p>
                <p className="text-sm font-medium text-foreground">{caseData.epidemiological_data.exposure_location}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Travel History</p>
                <p className="text-sm font-medium text-foreground">{caseData.epidemiological_data.travel_history}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vaccination Status</p>
                <p className="text-sm font-medium text-foreground">{caseData.epidemiological_data.vaccination_status}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Timeline, Contacts, Samples */}
        <div className="space-y-6">
          {/* Case Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Case Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {caseData.timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full ${
                        item.type === 'clinical' ? 'bg-blue-500' :
                        item.type === 'lab' ? 'bg-purple-500' :
                        'bg-green-500'
                      }`} />
                      {idx < caseData.timeline.length - 1 && (
                        <div className="h-full w-px bg-border" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                      <p className="text-sm font-medium text-foreground">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Linked Contacts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Contacts ({caseData.contacts.length})
              </CardTitle>
              <Link href="/contacts">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {caseData.contacts.map((contact) => (
                  <Link key={contact.id} href={`/contacts/${contact.id}`}>
                    <div className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                      <div>
                        <p className="font-medium text-foreground">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={contact.risk === 'high' ? 'destructive' : contact.risk === 'medium' ? 'warning' : 'success'}>
                          {contact.risk}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lab Samples */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-primary" />
                Samples ({caseData.samples.length})
              </CardTitle>
              <Link href="/samples">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {caseData.samples.map((sample) => (
                  <Link key={sample.id} href={`/samples/${sample.id}`}>
                    <div className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                      <div>
                        <p className="font-medium text-foreground">{sample.type} - {sample.test}</p>
                        <p className="text-xs text-muted-foreground">{sample.lab}</p>
                      </div>
                      <Badge variant={sample.result === 'positive' ? 'destructive' : sample.result === 'negative' ? 'success' : 'warning'}>
                        {sample.result}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Info */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Reported by: {caseData.reporting_user}</span>
            <span>Last updated: {new Date(caseData.last_updated).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
