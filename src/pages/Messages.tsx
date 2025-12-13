import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { APP_CONFIG } from '@/lib/config';
import { Send, Smile, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  tone_score: number | null;
  tone_label: string | null;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  family_id: string;
  updated_at: string;
}

interface ToneAnalysis {
  score: number;
  label: string;
  warning?: string;
}

const getToneIcon = (score: number | null) => {
  if (score === null) return null;
  if (score >= 0.7) return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (score >= 0.4) return <Info className="h-4 w-4 text-yellow-500" />;
  return <AlertTriangle className="h-4 w-4 text-red-500" />;
};

const getToneBadge = (label: string | null) => {
  if (!label) return null;
  
  const colors: Record<string, string> = {
    positive: 'bg-green-500/10 text-green-500',
    neutral: 'bg-yellow-500/10 text-yellow-500',
    negative: 'bg-red-500/10 text-red-500',
    hostile: 'bg-red-500/10 text-red-500',
  };
  
  return (
    <Badge variant="outline" className={`text-xs ${colors[label] || ''}`}>
      {label}
    </Badge>
  );
};

const Messages: React.FC = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toneWarning, setToneWarning] = useState<ToneAnalysis | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    if (!profile?.family_id) {
      setIsLoading(false);
      return;
    }

    try {
      let { data: existingConversation, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('family_id', profile.family_id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({ family_id: profile.family_id })
          .select()
          .single();

        if (createError) throw createError;
        existingConversation = newConversation;

        await supabase
          .from('conversation_participants')
          .insert({ conversation_id: newConversation.id, user_id: user?.id });
      } else if (fetchError) {
        throw fetchError;
      }

      setConversation(existingConversation);
      
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', existingConversation.id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversation();
  }, [profile?.family_id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    if (!conversation?.id) return;

    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation?.id]);

  const analyzeTone = async (text: string): Promise<ToneAnalysis> => {
    setIsAnalyzing(true);
    
    try {
      // Try to call the edge function
      const { data, error } = await supabase.functions.invoke('tone-analyzer', {
        body: { text },
      });

      if (!error && data) {
        return {
          score: data.score,
          label: data.label,
          warning: data.warning,
        };
      }
    } catch (error) {
      console.warn('Edge function failed, using fallback:', error);
    } finally {
      setIsAnalyzing(false);
    }

    // Fallback: Simple client-side tone analysis
    const positiveWords = ['thanks', 'great', 'wonderful', 'appreciate', 'happy', 'love', 'good', 'amazing', 'perfect', 'please', 'welcome'];
    const negativeWords = ['angry', 'upset', 'frustrated', 'hate', 'terrible', 'awful', 'never', 'always', 'fault', 'blame', 'stupid', 'idiot'];
    const hostileWords = ['hate', 'stupid', 'idiot', 'damn', 'hell'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    let hasHostile = false;
    
    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
      if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
      if (hostileWords.some(hw => word.includes(hw))) hasHostile = true;
    });
    
    const total = positiveCount + negativeCount;
    let score = 0.5;
    let label = 'neutral';
    
    if (total > 0) {
      score = positiveCount / total;
      label = score >= 0.6 ? 'positive' : score <= 0.4 ? 'negative' : 'neutral';
    }
    
    if (hasHostile) {
      score = 0.2;
      label = 'hostile';
    }
    
    return { 
      score, 
      label,
      warning: label === 'hostile' ? 'This message may come across as hostile.' : undefined
    };
  };

  const handleSendMessage = async (force = false) => {
    if (!newMessage.trim() || !conversation || !user) return;

    // Analyze tone before sending
    if (!force && !toneWarning) {
      const analysis = await analyzeTone(newMessage);
      
      if (analysis.warning || analysis.label === 'hostile' || analysis.label === 'negative') {
        setToneWarning(analysis);
        setShowWarningDialog(true);
        return;
      }
    }

    setIsSending(true);
    try {
      const analysis = toneWarning || await analyzeTone(newMessage);

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: newMessage,
          tone_score: analysis.score,
          tone_label: analysis.label,
        });

      if (error) throw error;
      setNewMessage('');
      setToneWarning(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Messages | SplitSchedule</title>
        <meta name="description" content="Secure messaging with your co-parent" />
      </Helmet>
      
      <DashboardLayout user={user}>
        <div className="h-[calc(100vh-12rem)] flex flex-col">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Messages</h1>
              <p className="text-muted-foreground">Secure communication with tone monitoring</p>
            </div>
            {APP_CONFIG.MOCK_MODE && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                Mock Mode
              </Badge>
            )}
          </div>

          {/* Chat Container */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="border-b py-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>CP</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">Co-Parent Chat</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Messages are analyzed for tone to promote constructive communication
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading messages...</div>
                ) : !profile?.family_id ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Join or create a family to start messaging
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user.id;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <span className={`text-xs ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                {format(parseISO(message.created_at), 'HH:mm')}
                              </span>
                              {getToneIcon(message.tone_score)}
                              {getToneBadge(message.tone_label)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1"
                    disabled={!profile?.family_id || isSending || isAnalyzing}
                  />
                  <Button 
                    onClick={() => handleSendMessage()} 
                    disabled={!newMessage.trim() || !profile?.family_id || isSending || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Messages are analyzed for tone to help maintain constructive communication
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tone Warning Dialog */}
        <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                Tone Warning
              </DialogTitle>
              <DialogDescription>
                This message may come across as {toneWarning?.label}. Would you like to rephrase it?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{newMessage}</p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                  Tone: {toneWarning?.label}
                </Badge>
                <Badge variant="outline">
                  Score: {Math.round((toneWarning?.score || 0) * 100)}%
                </Badge>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowWarningDialog(false);
                  setToneWarning(null);
                }}
              >
                Edit Message
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  setShowWarningDialog(false);
                  handleSendMessage(true);
                }}
              >
                Send Anyway
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
};

export default Messages;
