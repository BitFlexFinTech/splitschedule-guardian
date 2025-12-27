import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, UserCheck, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { format } from 'date-fns';

interface AgentChatPanelProps {
  className?: string;
}

export const AgentChatPanel = ({ className }: AgentChatPanelProps) => {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    sessions,
    loadMessages,
    loadWaitingSessions,
    sendMessage,
    acceptSession,
    endSession,
  } = useRealtimeChat(activeSessionId || undefined);

  useEffect(() => {
    loadWaitingSessions();
  }, [loadWaitingSessions]);

  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId);
    }
  }, [activeSessionId, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAcceptChat = async (sessionId: string) => {
    await acceptSession(sessionId);
    setActiveSessionId(sessionId);
  };

  const handleEndChat = async () => {
    if (activeSessionId) {
      await endSession(activeSessionId);
      setActiveSessionId(null);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    await sendMessage(message, 'agent');
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const waitingSessions = sessions.filter((s) => s.status === 'waiting');
  const activeSessions = sessions.filter((s) => s.status === 'active');

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}>
      {/* Queue Panel */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" strokeWidth={1.5} />
            Chat Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Waiting */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
              Waiting ({waitingSessions.length})
            </h4>
            {waitingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No waiting chats
              </p>
            ) : (
              <div className="space-y-2">
                {waitingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                        Waiting
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(session.started_at), 'HH:mm')}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleAcceptChat(session.id)}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Accept Chat
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              Active ({activeSessions.length})
            </h4>
            {activeSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active chats
              </p>
            ) : (
              <div className="space-y-2">
                {activeSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      activeSessionId === session.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        Active
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(session.started_at), 'HH:mm')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Panel */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" strokeWidth={1.5} />
              {activeSessionId ? 'Live Chat' : 'Select a Chat'}
            </CardTitle>
            {activeSessionId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEndChat}
                className="text-success border-success/30 hover:bg-success/10"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                End Chat
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-[400px]">
          {!activeSessionId ? (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div>
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <p className="text-muted-foreground">
                  Select a chat from the queue to start responding
                </p>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          msg.sender_type === 'agent'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : msg.sender_type === 'system'
                            ? 'bg-muted text-muted-foreground text-center w-full text-xs'
                            : 'bg-secondary text-secondary-foreground rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender_type === 'agent'
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your response..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    disabled={!message.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
