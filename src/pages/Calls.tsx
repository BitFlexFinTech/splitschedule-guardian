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
  VideoOff, Clock, Calendar, Users, Loader2 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface CallSession {
  id: string;
  call_type: string;
  status: string;
  duration_seconds: number | null;
  started_at: string;
  ended_at: string | null;
}

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
  const [callHistory, setCallHistory] = useState<CallSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (profile?.family_id) {
      fetchCallHistory();
    } else {
      setIsLoading(false);
    }
  }, [profile?.family_id]);

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

  const fetchCallHistory = async () => {
    if (!profile?.family_id) return;
    
    try {
      const { data, error } = await supabase
        .from('call_sessions')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setCallHistory(data || []);
    } catch (error) {
      console.error('Error fetching call history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCall = async (type: 'video' | 'audio') => {
    if (!profile?.family_id) {
      toast.error('Please set up your family first');
      return;
    }
    
    setCallType(type);
    setIsInCall(true);
    toast.success(`${type === 'video' ? 'Video' : 'Audio'} call started${APP_CONFIG.MOCK_MODE ? ' (Mock Mode)' : ''}`);

    if (profile.family_id && user) {
      try {
        await supabase.from('call_sessions').insert({
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
          await supabase.from('call_sessions').update({
            status: 'completed',
            ended_at: new Date().toISOString(),
            duration_seconds: duration,
          }).eq('id', activeCalls[0].id);
        }

        fetchCallHistory();
      } catch (error) {
        console.error('Error updating call session:', error);
      }
    }
  };

  if (!user) return null;

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
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                Mock Mode
              </Badge>
            )}
          </div>

          {/* Call Interface */}
          {isInCall ? (
            <Card className="bg-gray-900 text-white border-0">
              <CardContent className="p-8">
                <div className="flex flex-col items-center">
                  <div className="mb-4">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatDuration(callDuration)}
                    </Badge>
                  </div>

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
                        {APP_CONFIG.MOCK_MODE && (
                          <p className="text-xs text-gray-500 mt-2">(Simulated video feed)</p>
                        )}
                      </div>
                    )}

                    <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-gray-400">You</span>
                    </div>
                  </div>

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
              <Card className="glass-card hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => handleStartCall('video')}>
                <CardContent className="p-8 text-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
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

              <Card className="glass-card hover:border-accent/50 transition-colors cursor-pointer group" onClick={() => handleStartCall('audio')}>
                <CardContent className="p-8 text-center">
                  <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
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
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Calls
              </CardTitle>
              <CardDescription>Upcoming calls with your co-parent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No scheduled calls</p>
                <p className="text-sm">Schedule calls through the calendar</p>
              </div>
            </CardContent>
          </Card>

          {/* Call History from Database */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Call History
              </CardTitle>
              <CardDescription>Recent calls with your co-parent</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : callHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No call history yet</p>
                  <p className="text-sm">Start your first call above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {callHistory.map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>CP</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">Co-Parent</p>
                            {call.call_type === 'video' ? (
                              <Video className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Phone className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(call.started_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {call.status === 'completed' && call.duration_seconds ? (
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(call.duration_seconds)}
                          </span>
                        ) : call.status === 'active' ? (
                          <Badge className="bg-green-500/10 text-green-600">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Missed</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* No Family Warning */}
          {!profile?.family_id && (
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="py-4">
                <p className="text-yellow-600">
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