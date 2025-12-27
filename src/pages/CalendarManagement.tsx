import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Plus, Trash2, Edit2, Calendar as CalendarIcon, Share2, Download, 
  Copy, ArrowLeft, Repeat, Clock, MapPin, Search, Filter
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color: string;
  location: string | null;
  recurring: boolean | null;
  recurrence_rule: string | null;
}

const eventTypeConfig: Record<string, { bg: string; label: string; hex: string }> = {
  custody: { bg: 'bg-[#3B82F6]', label: 'Custody', hex: '#3B82F6' },
  pickup: { bg: 'bg-[#10B981]', label: 'Pickup', hex: '#10B981' },
  dropoff: { bg: 'bg-[#F59E0B]', label: 'Drop-off', hex: '#F59E0B' },
  birthday: { bg: 'bg-[#EC4899]', label: 'Birthday', hex: '#EC4899' },
  holiday: { bg: 'bg-[#8B5CF6]', label: 'Holiday', hex: '#8B5CF6' },
  activity: { bg: 'bg-[#06B6D4]', label: 'Activity', hex: '#06B6D4' },
  medical: { bg: 'bg-[#EF4444]', label: 'Medical', hex: '#EF4444' },
  school: { bg: 'bg-[#84CC16]', label: 'School', hex: '#84CC16' },
  appointment: { bg: 'bg-[#F97316]', label: 'Appointment', hex: '#F97316' },
  event: { bg: 'bg-[#6366F1]', label: 'Event', hex: '#6366F1' },
  reminder: { bg: 'bg-[#A855F7]', label: 'Reminder', hex: '#A855F7' },
  other: { bg: 'bg-[#64748B]', label: 'Other', hex: '#64748B' },
};

const recurrenceOptions = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const CalendarManagement: React.FC = () => {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_type: 'custody',
    start_time: '',
    end_time: '',
    all_day: false,
    location: '',
    recurring: false,
    recurrence_rule: 'none',
  });

  const fetchEvents = async () => {
    if (!profile?.family_id) {
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [profile?.family_id]);

  // Map to valid database event types
  const validEventTypes = ['custody', 'event', 'holiday', 'medical', 'school', 'activity'] as const;
  type ValidEventType = typeof validEventTypes[number];
  
  const getDbEventType = (type: string): ValidEventType => {
    return validEventTypes.includes(type as any) ? type as ValidEventType : 'event';
  };

  const handleCreateEvent = async () => {
    if (!profile?.family_id || !user) {
      toast.error('Please set up your family first');
      return;
    }

    if (!eventForm.title || !eventForm.start_time || !eventForm.end_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('calendar_events')
        .insert({
          family_id: profile.family_id,
          created_by: user.id,
          title: eventForm.title,
          description: eventForm.description || null,
          event_type: getDbEventType(eventForm.event_type),
          start_time: eventForm.start_time,
          end_time: eventForm.end_time,
          all_day: eventForm.all_day,
          location: eventForm.location || null,
          recurring: eventForm.recurring,
          recurrence_rule: eventForm.recurrence_rule !== 'none' ? eventForm.recurrence_rule : null,
          color: eventTypeConfig[eventForm.event_type]?.hex || '#64748B',
        });

      if (error) throw error;
      
      toast.success('Event created successfully');
      setIsAddEventOpen(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({
          title: eventForm.title,
          description: eventForm.description || null,
          event_type: getDbEventType(eventForm.event_type),
          start_time: eventForm.start_time,
          end_time: eventForm.end_time,
          all_day: eventForm.all_day,
          location: eventForm.location || null,
          recurring: eventForm.recurring,
          recurrence_rule: eventForm.recurrence_rule !== 'none' ? eventForm.recurrence_rule : null,
          color: eventTypeConfig[eventForm.event_type]?.hex || '#64748B',
        })
        .eq('id', selectedEvent.id);

      if (error) throw error;
      
      toast.success('Event updated successfully');
      setIsEditEventOpen(false);
      setSelectedEvent(null);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', selectedEvent.id);

      if (error) throw error;
      
      toast.success('Event deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleExportCalendar = () => {
    const icalContent = events.map(event => 
      `BEGIN:VEVENT
DTSTART:${format(parseISO(event.start_time), "yyyyMMdd'T'HHmmss")}
DTEND:${format(parseISO(event.end_time), "yyyyMMdd'T'HHmmss")}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
END:VEVENT`
    ).join('\n');

    const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SplitSchedule//Calendar//EN
${icalContent}
END:VCALENDAR`;

    const blob = new Blob([ical], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'splitschedule-calendar.ics';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Calendar exported');
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/shared-calendar/${profile?.family_id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard');
  };

  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      event_type: 'custody',
      start_time: '',
      end_time: '',
      all_day: false,
      location: '',
      recurring: false,
      recurrence_rule: 'none',
    });
  };

  const openEditDialog = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      start_time: event.start_time.slice(0, 16),
      end_time: event.end_time.slice(0, 16),
      all_day: event.all_day,
      location: event.location || '',
      recurring: event.recurring || false,
      recurrence_rule: event.recurrence_rule || 'none',
    });
    setIsEditEventOpen(true);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || event.event_type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (!user) return null;

  const EventFormFields = () => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="font-light">Title *</Label>
        <Input
          id="title"
          value={eventForm.title}
          onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
          placeholder="Event title"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="event_type" className="font-light">Event Type</Label>
        <Select
          value={eventForm.event_type}
          onValueChange={(value) => setEventForm({ ...eventForm, event_type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(eventTypeConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${config.bg}`} />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_time" className="font-light">Start *</Label>
          <Input
            id="start_time"
            type="datetime-local"
            value={eventForm.start_time}
            onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_time" className="font-light">End *</Label>
          <Input
            id="end_time"
            type="datetime-local"
            value={eventForm.end_time}
            onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="all_day" className="font-light">All day event</Label>
        <Switch
          id="all_day"
          checked={eventForm.all_day}
          onCheckedChange={(checked) => setEventForm({ ...eventForm, all_day: checked })}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="recurrence" className="font-light">Recurrence</Label>
        <Select
          value={eventForm.recurrence_rule}
          onValueChange={(value) => setEventForm({ 
            ...eventForm, 
            recurrence_rule: value,
            recurring: value !== 'none'
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {recurrenceOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="font-light">Location</Label>
        <Input
          id="location"
          value={eventForm.location}
          onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
          placeholder="Optional location"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="font-light">Description</Label>
        <Textarea
          id="description"
          value={eventForm.description}
          onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
          placeholder="Optional description"
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Manage Calendar | SplitSchedule</title>
        <meta name="description" content="Manage your calendar events, categories, and sharing settings" />
      </Helmet>
      
      <DashboardLayout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/calendar">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-medium text-foreground tracking-tight">Manage Calendar</h1>
                <p className="text-muted-foreground font-light">Create, edit, and organize your events</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="font-light">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-medium">Share Calendar</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="font-light">Share Link</Label>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          value={`${window.location.origin}/shared-calendar/${profile?.family_id}`}
                          className="font-mono text-sm"
                        />
                        <Button variant="outline" size="icon" onClick={handleCopyShareLink}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full font-light" onClick={handleExportCalendar}>
                      <Download className="h-4 w-4 mr-2" />
                      Export as .ics file
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="font-medium">Create New Event</DialogTitle>
                  </DialogHeader>
                  <EventFormFields />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateEvent}>Create Event</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search and Filter */}
          <Card className="glass-card">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(eventTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${config.bg}`} />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-medium">All Events</CardTitle>
              <CardDescription className="font-light">{filteredEvents.length} events found</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground font-light">No events found</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsAddEventOpen(true)}>
                    Create your first event
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className={`w-3 h-3 rounded-full ${eventTypeConfig[event.event_type]?.bg || 'bg-[#64748B]'}`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{event.title}</p>
                            {event.recurring && (
                              <Badge variant="secondary" className="text-xs">
                                <Repeat className="h-3 w-3 mr-1" />
                                Recurring
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground font-light mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(parseISO(event.start_time), 'MMM d, yyyy h:mm a')}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditDialog(event)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Categories Legend */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-medium">Event Categories</CardTitle>
              <CardDescription className="font-light">Color-coded event types for easy identification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Object.entries(eventTypeConfig).map(([type, config]) => (
                  <div key={type} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                    <div className={`w-4 h-4 rounded-full ${config.bg}`} />
                    <span className="text-sm font-light">{config.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Event Dialog */}
        <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-medium">Edit Event</DialogTitle>
            </DialogHeader>
            <EventFormFields />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditEventOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateEvent}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-medium">Delete Event</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground font-light">
              Are you sure you want to delete "{selectedEvent?.title}"? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteEvent}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
};

export default CalendarManagement;