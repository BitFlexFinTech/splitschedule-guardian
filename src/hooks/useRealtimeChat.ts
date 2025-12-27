import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string | null;
  sender_type: 'user' | 'agent' | 'system';
  message: string;
  is_read: boolean;
  created_at: string;
}

interface ChatSession {
  id: string;
  ticket_id: string | null;
  user_id: string | null;
  agent_id: string | null;
  status: 'waiting' | 'active' | 'ended';
  started_at: string;
  ended_at: string | null;
}

export const useRealtimeChat = (sessionId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Subscribe to messages for a specific session
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`chat:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_chat_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Subscribe to session status changes (for agents)
  useEffect(() => {
    const channel = supabase
      .channel('chat-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_chat_sessions',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSessions((prev) => [...prev, payload.new as ChatSession]);
          } else if (payload.eventType === 'UPDATE') {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === (payload.new as ChatSession).id
                  ? (payload.new as ChatSession)
                  : s
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Load initial messages
  const loadMessages = useCallback(async (sessionId: string) => {
    const { data, error } = await supabase
      .from('support_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data as ChatMessage[]);
  }, []);

  // Load waiting sessions (for agents)
  const loadWaitingSessions = useCallback(async () => {
    const { data, error } = await supabase
      .from('support_chat_sessions')
      .select('*')
      .in('status', ['waiting', 'active'])
      .order('started_at', { ascending: true });

    if (error) {
      console.error('Error loading sessions:', error);
      return;
    }

    setSessions(data as ChatSession[]);
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (message: string, senderType: 'user' | 'agent' = 'user') => {
      if (!sessionId || !user) return;

      const { error } = await supabase.from('support_chat_messages').insert({
        session_id: sessionId,
        sender_id: user.id,
        sender_type: senderType,
        message,
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to send message',
          variant: 'destructive',
        });
      }
    },
    [sessionId, user, toast]
  );

  // Start a new chat session
  const startSession = useCallback(async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('support_chat_sessions')
      .insert({
        user_id: user.id,
        status: 'waiting',
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to start chat session',
        variant: 'destructive',
      });
      return null;
    }

    return data as ChatSession;
  }, [user, toast]);

  // Accept a chat session (for agents)
  const acceptSession = useCallback(
    async (sessionId: string) => {
      if (!user) return;

      const { error } = await supabase
        .from('support_chat_sessions')
        .update({
          agent_id: user.id,
          status: 'active',
        })
        .eq('id', sessionId);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to accept chat',
          variant: 'destructive',
        });
      }
    },
    [user, toast]
  );

  // End a chat session
  const endSession = useCallback(
    async (sessionId: string) => {
      const { error } = await supabase
        .from('support_chat_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to end chat',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  return {
    messages,
    sessions,
    isConnected,
    loadMessages,
    loadWaitingSessions,
    sendMessage,
    startSession,
    acceptSession,
    endSession,
  };
};
