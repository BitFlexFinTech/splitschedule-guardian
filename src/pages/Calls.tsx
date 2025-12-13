import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { APP_CONFIG } from '@/lib/config';
import { 
  Video, Phone, PhoneOff, Mic, MicOff, 
  VideoOff, Clock, Calendar, Users 
} from 'lucide-react';
import { format } from 'date-fns';

// Mock call history
const mockCallHistory = [
  { id: '1', type: 'video', duration: 1245, date: new Date('2024-03-15T14:30:00'), status: 'completed' },
  { id: '2', type: 'audio', duration: 600, date: new Date('2024-03-14T10:00:00'), status: 'completed' },
  { id: '3', type: 'video', duration: 0, date: new Date('2024-03-13T16:00:00'), status: 'missed' },
];

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const Calls: React.FC = () => {
  const { user, profile } = useAuth();
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isInCall) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setCallDuration(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isInCall]);

  const handleStartCall = async (type: 'video' | 'audio') => {
    if (!profile?.family_id) {
      toast.error('Please set up your family first');
      return;
    }
    
    setCallType(type);
    setIsInCall(true);
    toast.success(`${type === 'video' ? 'Video' : 'Audio'} call started${APP_CONFIG.MOCK_MODE ? ' (Mock Mode)' : ''}`);

    // Save call to database
    if (profile.family_id && user) {
      try {
        await supabase
          .from('call_sessions')
          .insert({
            family_id: profile.family_id,
            call_type: type,
            initiated_by: user.id,
            participants: [user.id],
            status: 'active',
          });
      } catch (error) {
        console.error('Error saving call session:', error);
      }
    }
  };

  const handleEndCall = async () => {
    const duration = callDuration;
    setIsInCall(false);
    setIsMuted(false);
    setIsVideoOff(false);
    
    toast.success(`Call ended - Duration: ${formatDuration(duration)}`);

    // Update call session in database
    if (profile?.family_id && user) {
      try {
        const { data: activeCalls } = await supabase
          .from('call_sessions')
          .select('id')
          .eq('family_id', profile.family_id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);

        if (activeCalls && activeCalls.length > 0) {
          await supabase
            .from('call_sessions')
            .update({
              status: 'completed',
              ended_at: new Date().toISOString(),
              duration_seconds: duration,
            })
            .eq('id', activeCalls[0].id);
        }
      } catch (error) {
        console.error('Error updating call session:', error);
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Calls | SplitSchedule</title>
        <meta name="description" content="Secure video and audio calls with your co-parent" />
      </Helmet>
      
      <DashboardLayout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Secure Calls</h1>
              <p className="text-muted-foreground">Video and audio calls with end-to-end security</p>
            </div>
            {APP_CONFIG.MOCK_MODE && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                Mock Mode
              </Badge>
            )}
          </div>

          {/* Call Interface */}
          {isInCall ? (
            <Card className="bg-gray-900 text-white">
              <CardContent className="p-8">
                <div className="flex flex-col items-center">
                  {/* Call Timer */}
                  <div className="mb-4">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatDuration(callDuration)}
                    </Badge>
                  </div>

                  {/* Video Area */}
                  <div className="w-full max-w-3xl aspect-video bg-gray-800 rounded-lg mb-6 flex items-center justify-center relative">
                    {isVideoOff || callType === 'audio' ? (
                      <div className="text-center">
                        <div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                          <Users className="h-12 w-12 text-gray-400" />
                        </div>
                        <p className="text-gray-400">
                          {callType === 'audio' ? 'Audio Call' : 'Camera is off'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                          <Video className="h-12 w-12 text-primary" />
                        </div>
                        <p className="text-gray-400">Connected to Co-Parent</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {APP_CONFIG.MOCK_MODE && '(Simulated video feed)'}
                        </p>
                      </div>
                    )}

                    {/* Self view (small) */}
                    <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-gray-400">You</span>
                    </div>
                  </div>

                  {/* Call Controls */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant={isMuted ? 'destructive' : 'secondary'}
                      size="lg"
                      className="rounded-full h-14 w-14"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="lg"
                      className="rounded-full h-16 w-16"
                      onClick={handleEndCall}
                    >
                      <PhoneOff className="h-7 w-7" />
                    </Button>
                    
                    {callType === 'video' && (
                      <Button
                        variant={isVideoOff ? 'destructive' : 'secondary'}
                        size="lg"
                        className="rounded-full h-14 w-14"
                        onClick={() => setIsVideoOff(!isVideoOff)}
                      >
                        {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Call Cards */}
              <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => handleStartCall('video')}>
                <CardContent className="p-8 text-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Video className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Video Call</h3>
                  <p className="text-muted-foreground mb-4">
                    Face-to-face communication with your co-parent
                  </p>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Video className="h-4 w-4 mr-2" />
                    Start Video Call
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-accent transition-colors cursor-pointer" onClick={() => handleStartCall('audio')}>
                <CardContent className="p-8 text-center">
                  <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-10 w-10 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Audio Call</h3>
                  <p className="text-muted-foreground mb-4">
                    Voice-only call when video isn't needed
                  </p>
                  <Button variant="secondary">
                    <Phone className="h-4 w-4 mr-2" />
                    Start Audio Call
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Scheduled Calls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Calls
              </CardTitle>
              <CardDescription>Upcoming calls with your co-parent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scheduled calls</p>
                <p className="text-sm">Schedule calls through the calendar</p>
              </div>
            </CardContent>
          </Card>

          {/* Call History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Call History
              </CardTitle>
              <CardDescription>Recent calls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCallHistory.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>CP</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Co-Parent</p>
                          {call.type === 'video' ? (
                            <Video className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Phone className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(call.date, 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {call.status === 'completed' ? (
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(call.duration)}
                        </span>
                      ) : (
                        <Badge variant="destructive">Missed</Badge>
                      )}
                    </div>
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
                  You need to create or join a family to make calls. Go to Settings to set up your family.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default Calls;
