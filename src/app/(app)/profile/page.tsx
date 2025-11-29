'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Shield,
  Calendar,
  Clock,
  Edit,
  Save,
  X,
  Key,
  Bell,
  Globe,
  Activity,
  FileText,
  Users,
  LogOut,
} from 'lucide-react';
import { useTenantStore } from '@/lib/stores/tenant-store';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, currentTenant } = useTenantStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: currentUser?.full_name || 'John Doe',
    email: currentUser?.email || 'john.doe@ncdc.gov.ng',
    phone: '+234 803 123 4567',
    department: 'Disease Surveillance',
    location: 'Abuja, Nigeria',
  });

  const handleSave = () => {
    // In production, this would save to the backend
    setIsEditing(false);
  };

  const handleSignOut = () => {
    router.push('/auth/login');
  };

  const recentActivity = [
    { action: 'Created case report', target: 'CSE-2024-00156', time: '2 hours ago', icon: FileText },
    { action: 'Updated contact', target: 'CNT-2024-00234', time: '4 hours ago', icon: Users },
    { action: 'Reviewed alert', target: 'ALT-2024-00089', time: '1 day ago', icon: Bell },
    { action: 'Exported analytics', target: 'Weekly Report', time: '2 days ago', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <Button variant="destructive" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar and Name */}
            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-3xl font-bold text-primary-foreground">
                {formData.full_name.charAt(0)}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="text-xl font-bold"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-foreground">{formData.full_name}</h2>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="default">
                    {currentUser?.role?.replace('_', ' ') || 'Country Admin'}
                  </Badge>
                  <Badge variant="outline">{currentTenant?.code || 'NGA'}</Badge>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="border-0 bg-transparent p-0"
                    />
                  ) : (
                    <span className="text-foreground">{formData.email}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="border-0 bg-transparent p-0"
                    />
                  ) : (
                    <span className="text-foreground">{formData.phone}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Department</label>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="border-0 bg-transparent p-0"
                    />
                  ) : (
                    <span className="text-foreground">{formData.department}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="border-0 bg-transparent p-0"
                    />
                  ) : (
                    <span className="text-foreground">{formData.location}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span className="text-sm text-muted-foreground">Account Status</span>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Member Since</span>
                </div>
                <span className="text-sm text-foreground">Jan 2023</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Last Login</span>
                </div>
                <span className="text-sm text-foreground">Today, 9:42 AM</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Country</span>
                </div>
                <span className="text-sm text-foreground">{currentTenant?.name || 'Nigeria'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Key className="mr-2 h-4 w-4" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="mr-2 h-4 w-4" />
                Notification Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Two-Factor Auth
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/20 p-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.action}</p>
                      <p className="text-sm text-primary">{item.target}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.time}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions & Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-success" />
                <span className="font-medium text-foreground">Case Management</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Full access to create, view, edit cases</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-success" />
                <span className="font-medium text-foreground">Contact Tracing</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Full access to contact management</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-success" />
                <span className="font-medium text-foreground">Analytics</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">View and export all analytics data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
