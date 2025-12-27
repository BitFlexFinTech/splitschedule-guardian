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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Download, Settings2, MapPin, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
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
  assigned_to: string | null;
}

// Bright, flat, full spectrum colors for calendar events
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
    event_type: 'custody',
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

    // Map to valid database event types
    const validEventTypes = ['custody', 'event', 'holiday', 'medical', 'school', 'activity'] as const;
    const dbEventType = validEventTypes.includes(newEvent.event_type as any) 
      ? newEvent.event_type as typeof validEventTypes[number]
      : 'event';

    try {
      const { error } = await supabase
        .from('calendar_events')
        .insert({
          family_id: profile.family_id,
          created_by: user.id,
          title: newEvent.title,
          description: newEvent.description || null,
          event_type: dbEventType,
          start_time: newEvent.start_time,
          end_time: newEvent.end_time,
          all_day: newEvent.all_day,
          location: newEvent.location || null,
          color: eventTypeConfig[newEvent.event_type]?.hex || '#64748B',
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
              <h1 className="text-3xl font-medium text-foreground tracking-tight">Custody Calendar</h1>
              <p className="text-muted-foreground font-light">Manage your custody schedule and events</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="font-light">
                <Link to="/calendar-management">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Manage
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} className="font-light">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="font-medium">Create New Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="font-light">Title</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Event title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event_type" className="font-light">Event Type</Label>
                      <Select
                        value={newEvent.event_type}
                        onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
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
                        <Label htmlFor="start_time" className="font-light">Start</Label>
                        <Input
                          id="start_time"
                          type="datetime-local"
                          value={newEvent.start_time}
                          onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_time" className="font-light">End</Label>
                        <Input
                          id="end_time"
                          type="datetime-local"
                          value={newEvent.end_time}
                          onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="font-light">Location</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="Optional location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="font-light">Description</Label>
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
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-xl font-medium tracking-tight">
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
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before start of month */}
                {Array.from({ length: days[0].getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 bg-muted/20 rounded-lg" />
                ))}
                
                {days.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`h-24 p-1.5 rounded-lg border transition-all duration-200 cursor-pointer group
                        ${isToday 
                          ? 'border-foreground/30 bg-foreground/5' 
                          : 'border-border/50 hover:border-border hover:bg-muted/30'
                        }
                        hover:scale-[1.02] hover:shadow-md
                      `}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map((event) => (
                          <Tooltip key={event.id}>
                            <TooltipTrigger asChild>
                              <div
                                className={`text-xs px-1.5 py-0.5 rounded truncate text-white font-light cursor-pointer
                                  ${eventTypeConfig[event.event_type]?.bg || 'bg-[#64748B]'}
                                  transition-transform duration-200 hover:scale-105
                                  animate-fade-in
                                `}
                              >
                                {event.title}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <div className="space-y-1">
                                <p className="font-medium">{event.title}</p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {format(parseISO(event.start_time), 'h:mm a')}
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                  </div>
                                )}
                                {event.description && (
                                  <p className="text-xs text-muted-foreground">{event.description}</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground px-1 font-light">
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
          <Card className="glass-card">
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-4">
                {Object.entries(eventTypeConfig).map(([type, config]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${config.bg}`} />
                    <span className="text-sm font-light text-muted-foreground">{config.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* No Family Warning */}
          {!profile?.family_id && (
            <Card className="border-warning bg-warning/10">
              <CardContent className="py-4">
                <p className="text-warning-foreground font-light">
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