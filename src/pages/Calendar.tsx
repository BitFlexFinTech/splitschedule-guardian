import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Download, ArrowLeftRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: 'custody' | 'event' | 'holiday' | 'medical' | 'school' | 'activity';
  start_time: string;
  end_time: string;
  all_day: boolean;
  color: string;
  location: string | null;
  assigned_to: string | null;
}

const eventTypeColors: Record<string, string> = {
  custody: 'bg-primary',
  event: 'bg-accent',
  holiday: 'bg-green-500',
  medical: 'bg-red-500',
  school: 'bg-yellow-500',
  activity: 'bg-purple-500',
};

const Calendar: React.FC = () => {
  const { user, profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'custody' as const,
    start_time: '',
    end_time: '',
    all_day: false,
    location: '',
  });

  const fetchEvents = async () => {
    if (!profile?.family_id) {
      setIsLoading(false);
      return;
    }
    
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('family_id', profile.family_id)
        .gte('start_time', start.toISOString())
        .lte('end_time', end.toISOString());
      
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
  }, [currentDate, profile?.family_id]);

  // Real-time subscription
  useEffect(() => {
    if (!profile?.family_id) return;

    const channel = supabase
      .channel('calendar-events')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'calendar_events',
        filter: `family_id=eq.${profile.family_id}`
      }, () => {
        fetchEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.family_id]);

  const handleAddEvent = async () => {
    if (!profile?.family_id || !user) {
      toast.error('Please set up your family first');
      return;
    }

    try {
      const { error } = await supabase
        .from('calendar_events')
        .insert({
          family_id: profile.family_id,
          created_by: user.id,
          title: newEvent.title,
          description: newEvent.description || null,
          event_type: newEvent.event_type,
          start_time: newEvent.start_time,
          end_time: newEvent.end_time,
          all_day: newEvent.all_day,
          location: newEvent.location || null,
          color: eventTypeColors[newEvent.event_type],
        });

      if (error) throw error;
      
      toast.success('Event created successfully');
      setIsAddEventOpen(false);
      setNewEvent({
        title: '',
        description: '',
        event_type: 'custody',
        start_time: '',
        end_time: '',
        all_day: false,
        location: '',
      });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleExport = () => {
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

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      isSameDay(parseISO(event.start_time), day)
    );
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Custody Calendar | SplitSchedule</title>
        <meta name="description" content="Manage your custody schedule with our interactive calendar" />
      </Helmet>
      
      <DashboardLayout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Custody Calendar</h1>
              <p className="text-muted-foreground">Manage your custody schedule and events</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Event title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event_type">Event Type</Label>
                      <Select
                        value={newEvent.event_type}
                        onValueChange={(value: any) => setNewEvent({ ...newEvent, event_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custody">Custody</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="holiday">Holiday</SelectItem>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="school">School</SelectItem>
                          <SelectItem value="activity">Activity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_time">Start</Label>
                        <Input
                          id="start_time"
                          type="datetime-local"
                          value={newEvent.start_time}
                          onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_time">End</Label>
                        <Input
                          id="end_time"
                          type="datetime-local"
                          value={newEvent.end_time}
                          onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="Optional location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Optional description"
                      />
                    </div>
                    <Button onClick={handleAddEvent} className="w-full">
                      Create Event
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Calendar Navigation */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-xl">
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before start of month */}
                {Array.from({ length: days[0].getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 bg-muted/30 rounded-lg" />
                ))}
                
                {days.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`h-24 p-1 rounded-lg border transition-colors cursor-pointer hover:bg-accent/10 ${
                        isToday ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs px-1 py-0.5 rounded truncate text-white ${eventTypeColors[event.event_type]}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground px-1">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Event Type Legend */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-4">
                {Object.entries(eventTypeColors).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${color}`} />
                    <span className="text-sm capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* No Family Warning */}
          {!profile?.family_id && (
            <Card className="border-warning bg-warning/10">
              <CardContent className="py-4">
                <p className="text-warning-foreground">
                  You need to create or join a family to use the calendar. Go to Settings to set up your family.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default Calendar;
