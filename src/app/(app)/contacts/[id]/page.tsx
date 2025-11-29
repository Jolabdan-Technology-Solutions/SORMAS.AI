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
  Trash2,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Activity,
  Thermometer,
  Plus,
} from 'lucide-react';

// Mock contact data
const getMockContact = (id: string) => ({
  id,
  external_id: `CNT-2024-${id.padStart(5, '0')}`,
  case_id: 'NGA-2024-00123',
  case_disease: 'Cholera',
  contact_date: '2024-01-14',
  last_contact_date: '2024-01-14',
  contact_type: 'household',
  relationship_to_case: 'spouse',
  risk_level: 'high',
  follow_up_status: 'under_follow_up',
  quarantine_status: 'home_based',
  person: {
    first_name: 'Sarah',
    last_name: 'Williams',
    age_years: 28,
    sex: 'female',
    date_of_birth: '1996-05-20',
    phone: '+234 801 234 5678',
    email: 'sarah.williams@email.com',
    occupation: 'Nurse',
    address: '15 Victoria Island Road',
    city: 'Lagos',
  },
  admin_unit: {
    country: 'Nigeria',
    state: 'Lagos',
    lga: 'Ikeja',
    ward: 'Oregun',
  },
  follow_up: {
    start_date: '2024-01-15',
    end_date: '2024-02-04',
    total_days: 21,
    completed_days: 7,
    remaining_days: 14,
    missed_visits: 1,
  },
  visits: [
    { date: '2024-01-21', day: 7, status: 'completed', temperature: 36.8, symptoms: false, notes: 'No symptoms reported' },
    { date: '2024-01-20', day: 6, status: 'completed', temperature: 36.5, symptoms: false, notes: 'Contact feeling well' },
    { date: '2024-01-19', day: 5, status: 'completed', temperature: 36.9, symptoms: false, notes: 'No concerns' },
    { date: '2024-01-18', day: 4, status: 'missed', temperature: null, symptoms: null, notes: 'Contact not available' },
    { date: '2024-01-17', day: 3, status: 'completed', temperature: 37.1, symptoms: false, notes: 'Mild fatigue, monitoring' },
    { date: '2024-01-16', day: 2, status: 'completed', temperature: 36.7, symptoms: false, notes: 'No symptoms' },
    { date: '2024-01-15', day: 1, status: 'completed', temperature: 36.6, symptoms: false, notes: 'Initial visit, quarantine explained' },
  ],
  exposure_details: {
    exposure_type: 'Direct contact with case during illness',
    exposure_duration: 'Multiple days',
    shared_meals: true,
    shared_sleeping_area: true,
    protective_equipment: false,
    exposure_description: 'Spouse living in same household, provided care during acute illness phase before hospitalization',
  },
  source_case: {
    id: 'NGA-2024-00123',
    name: 'John Doe',
    disease: 'Cholera',
    classification: 'confirmed',
    onset_date: '2024-01-10',
  },
  assigned_officer: {
    name: 'Dr. Aisha Mohammed',
    phone: '+234 802 000 0001',
    facility: 'Ikeja Primary Health Center',
  },
  last_updated: '2024-01-21T10:30:00',
});

export default function ContactDetailPage() {
  const params = useParams();
  const contactId = params.id as string;
  const contact = getMockContact(contactId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'under_follow_up':
        return <Badge variant="warning">Under Follow-up</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'lost_to_follow_up':
        return <Badge variant="destructive">Lost to Follow-up</Badge>;
      case 'converted_to_case':
        return <Badge variant="destructive">Converted to Case</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Risk</Badge>;
      case 'low':
        return <Badge variant="success">Low Risk</Badge>;
      default:
        return <Badge variant="secondary">{risk}</Badge>;
    }
  };

  const completionPercentage = (contact.follow_up.completed_days / contact.follow_up.total_days) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/contacts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contacts
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{contact.external_id}</h1>
              {getStatusBadge(contact.follow_up_status)}
              {getRiskBadge(contact.risk_level)}
            </div>
            <p className="text-muted-foreground">
              Contact of {contact.source_case.disease} case from {contact.contact_date}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Visit
          </Button>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Follow-up Progress */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Follow-up Progress</h3>
              <p className="text-sm text-muted-foreground">
                Day {contact.follow_up.completed_days} of {contact.follow_up.total_days} days
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{Math.round(completionPercentage)}%</p>
              <p className="text-sm text-muted-foreground">{contact.follow_up.remaining_days} days remaining</p>
            </div>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{contact.follow_up.completed_days}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{contact.follow_up.remaining_days}</p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
            <div className="rounded-lg bg-destructive/10 p-3 text-center">
              <p className="text-lg font-bold text-destructive">{contact.follow_up.missed_visits}</p>
              <p className="text-xs text-muted-foreground">Missed</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{contact.follow_up.end_date}</p>
              <p className="text-xs text-muted-foreground">End Date</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Person Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Contact Person
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
                {contact.person.first_name[0]}{contact.person.last_name[0]}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {contact.person.first_name} {contact.person.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {contact.person.age_years} years old, {contact.person.sex}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{contact.person.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{contact.person.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{contact.person.occupation}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-foreground">{contact.person.address}, {contact.person.city}</span>
              </div>
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
            <Link href={`/cases/${contact.source_case.id}`}>
              <div className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-primary">{contact.source_case.id}</span>
                  <Badge variant="destructive">{contact.source_case.classification}</Badge>
                </div>
                <p className="mt-2 font-medium text-foreground">{contact.source_case.name}</p>
                <p className="text-sm text-muted-foreground">{contact.source_case.disease}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Onset: {contact.source_case.onset_date}
                </p>
              </div>
            </Link>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Relationship to Case</p>
                <p className="text-sm font-medium text-foreground capitalize">{contact.relationship_to_case}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Contact Type</p>
                <p className="text-sm font-medium text-foreground capitalize">{contact.contact_type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Contact Date</p>
                <p className="text-sm font-medium text-foreground">{contact.last_contact_date}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exposure Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Exposure Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Exposure Type</p>
              <p className="text-sm font-medium text-foreground">{contact.exposure_details.exposure_type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium text-foreground">{contact.exposure_details.exposure_duration}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                {contact.exposure_details.shared_meals ? (
                  <CheckCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <XCircle className="h-4 w-4 text-success" />
                )}
                <span className="text-xs text-foreground">Shared Meals</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                {contact.exposure_details.shared_sleeping_area ? (
                  <CheckCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <XCircle className="h-4 w-4 text-success" />
                )}
                <span className="text-xs text-foreground">Shared Bed</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="text-sm text-foreground">{contact.exposure_details.exposure_description}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Follow-up Visits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Follow-up Visits
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Temperature</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Symptoms</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contact.visits.map((visit, idx) => (
                  <tr key={idx} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground">Day {visit.day}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{visit.date}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={visit.status === 'completed' ? 'success' : 'destructive'}>
                        {visit.status === 'completed' ? (
                          <><CheckCircle className="mr-1 h-3 w-3" /> Completed</>
                        ) : (
                          <><XCircle className="mr-1 h-3 w-3" /> Missed</>
                        )}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {visit.temperature ? (
                        <span className={`font-medium ${visit.temperature > 37.5 ? 'text-destructive' : 'text-foreground'}`}>
                          {visit.temperature}°C
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {visit.symptoms !== null ? (
                        visit.symptoms ? (
                          <Badge variant="destructive">Yes</Badge>
                        ) : (
                          <Badge variant="success">No</Badge>
                        )
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{visit.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Officer */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{contact.assigned_officer.name}</p>
                <p className="text-sm text-muted-foreground">{contact.assigned_officer.facility}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{contact.assigned_officer.phone}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
