import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Baby, Plus, Edit, Trash2, Phone, MapPin, 
  Pill, AlertTriangle, GraduationCap, Stethoscope,
  User, Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface Child {
  id: string;
  name: string;
  date_of_birth: string | null;
  allergies: string[] | null;
  medications: string[] | null;
  school_name: string | null;
  school_phone: string | null;
  school_address: string | null;
  doctor_name: string | null;
  doctor_phone: string | null;
  doctor_address: string | null;
  emergency_contacts: unknown;
  notes: string | null;
}

const InfoBank: React.FC = () => {
  const { user, profile } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    allergies: '',
    medications: '',
    school_name: '',
    school_phone: '',
    school_address: '',
    doctor_name: '',
    doctor_phone: '',
    doctor_address: '',
    notes: '',
  });

  const fetchChildren = async () => {
    if (!profile?.family_id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('name');

      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error('Error fetching children:', error);
      toast.error('Failed to load children');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [profile?.family_id]);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !profile?.family_id) {
      toast.error('Please enter a name');
      return;
    }

    try {
      const childData = {
        family_id: profile.family_id,
        name: formData.name,
        date_of_birth: formData.date_of_birth || null,
        allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : [],
        medications: formData.medications ? formData.medications.split(',').map(s => s.trim()) : [],
        school_name: formData.school_name || null,
        school_phone: formData.school_phone || null,
        school_address: formData.school_address || null,
        doctor_name: formData.doctor_name || null,
        doctor_phone: formData.doctor_phone || null,
        doctor_address: formData.doctor_address || null,
        notes: formData.notes || null,
      };

      if (editingChild) {
        const { error } = await supabase
          .from('children')
          .update(childData)
          .eq('id', editingChild.id);
        if (error) throw error;
        toast.success('Child updated');
      } else {
        const { error } = await supabase
          .from('children')
          .insert(childData);
        if (error) throw error;
        toast.success('Child added');
      }

      setIsAddDialogOpen(false);
      setEditingChild(null);
      resetForm();
      fetchChildren();
    } catch (error) {
      console.error('Error saving child:', error);
      toast.error('Failed to save');
    }
  };

  const handleEdit = (child: Child) => {
    setEditingChild(child);
    setFormData({
      name: child.name,
      date_of_birth: child.date_of_birth || '',
      allergies: child.allergies?.join(', ') || '',
      medications: child.medications?.join(', ') || '',
      school_name: child.school_name || '',
      school_phone: child.school_phone || '',
      school_address: child.school_address || '',
      doctor_name: child.doctor_name || '',
      doctor_phone: child.doctor_phone || '',
      doctor_address: child.doctor_address || '',
      notes: child.notes || '',
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this child?')) return;

    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Child removed');
      fetchChildren();
    } catch (error) {
      console.error('Error deleting child:', error);
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date_of_birth: '',
      allergies: '',
      medications: '',
      school_name: '',
      school_phone: '',
      school_address: '',
      doctor_name: '',
      doctor_phone: '',
      doctor_address: '',
      notes: '',
    });
  };

  if (!user) return null;

  return (
    <>
      <Helmet>
        <title>Info Bank | SplitSchedule</title>
        <meta name="description" content="Store important information about your children" />
      </Helmet>
      
      <DashboardLayout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Info Bank</h1>
              <p className="text-muted-foreground">Store important information about your children</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) {
                setEditingChild(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Child
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingChild ? 'Edit Child' : 'Add Child'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Child's name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                    <Input
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      placeholder="e.g., Peanuts, Shellfish"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medications">Medications (comma-separated)</Label>
                    <Input
                      id="medications"
                      value={formData.medications}
                      onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                      placeholder="e.g., Inhaler, EpiPen"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      School Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="school_name">School Name</Label>
                        <Input
                          id="school_name"
                          value={formData.school_name}
                          onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="school_phone">School Phone</Label>
                        <Input
                          id="school_phone"
                          value={formData.school_phone}
                          onChange={(e) => setFormData({ ...formData, school_phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="school_address">School Address</Label>
                      <Input
                        id="school_address"
                        value={formData.school_address}
                        onChange={(e) => setFormData({ ...formData, school_address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Doctor Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="doctor_name">Doctor Name</Label>
                        <Input
                          id="doctor_name"
                          value={formData.doctor_name}
                          onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="doctor_phone">Doctor Phone</Label>
                        <Input
                          id="doctor_phone"
                          value={formData.doctor_phone}
                          onChange={(e) => setFormData({ ...formData, doctor_phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="doctor_address">Doctor Address</Label>
                      <Input
                        id="doctor_address"
                        value={formData.doctor_address}
                        onChange={(e) => setFormData({ ...formData, doctor_address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any additional notes..."
                    />
                  </div>

                  <Button onClick={handleSubmit} className="w-full">
                    {editingChild ? 'Update Child' : 'Add Child'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* No Family Warning */}
          {!profile?.family_id && (
            <Card className="border-warning bg-warning/10">
              <CardContent className="py-4">
                <p className="text-warning-foreground">
                  Please create or join a family in Settings to use the Info Bank.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Children Grid */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : children.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Baby className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Children Added</h3>
                <p className="text-muted-foreground mb-4">
                  Add your children to store important information like allergies, medications, and emergency contacts.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Child
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {children.map((child) => (
                <Card key={child.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle>{child.name}</CardTitle>
                          {child.date_of_birth && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(child.date_of_birth), 'MMMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(child)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(child.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Allergies */}
                    {child.allergies && child.allergies.length > 0 && (
                      <div>
                        <p className="text-sm font-medium flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          Allergies
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {child.allergies.map((allergy, i) => (
                            <Badge key={i} variant="destructive" className="text-xs">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Medications */}
                    {child.medications && child.medications.length > 0 && (
                      <div>
                        <p className="text-sm font-medium flex items-center gap-2 mb-2">
                          <Pill className="h-4 w-4 text-primary" />
                          Medications
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {child.medications.map((med, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {med}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* School Info */}
                    {child.school_name && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium flex items-center gap-2 mb-1">
                          <GraduationCap className="h-4 w-4" />
                          {child.school_name}
                        </p>
                        {child.school_phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {child.school_phone}
                          </p>
                        )}
                        {child.school_address && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {child.school_address}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Doctor Info */}
                    {child.doctor_name && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium flex items-center gap-2 mb-1">
                          <Stethoscope className="h-4 w-4" />
                          {child.doctor_name}
                        </p>
                        {child.doctor_phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {child.doctor_phone}
                          </p>
                        )}
                        {child.doctor_address && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {child.doctor_address}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {child.notes && (
                      <div className="text-sm text-muted-foreground border-t pt-3">
                        {child.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default InfoBank;
