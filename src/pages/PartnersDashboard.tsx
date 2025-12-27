import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Building2, Users, FileText, MessageSquare, Calendar,
  Bell, Settings, LogOut, Search, Send, ChevronRight,
  Clock, Eye, BarChart3, Phone, Video, Star
} from 'lucide-react';

// Mock data for partner dashboard
const mockClients = [
  { id: '1', familyName: 'Smith Family', status: 'active', lastActivity: '2 hours ago', caseType: 'Custody Modification' },
  { id: '2', familyName: 'Johnson Family', status: 'active', lastActivity: '1 day ago', caseType: 'Initial Custody' },
  { id: '3', familyName: 'Williams Family', status: 'pending', lastActivity: '3 days ago', caseType: 'Mediation' },
];

const mockMessages = [
  { id: '1', family: 'Smith Family', message: 'Can we schedule a call to discuss the custody arrangement?', time: '10:30 AM', unread: true },
  { id: '2', family: 'Johnson Family', message: 'Documents have been uploaded to the file vault.', time: 'Yesterday', unread: false },
];

const PartnersDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    toast.success('Message sent');
    setNewMessage('');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Partner Dashboard | SplitSchedule</title>
        <meta name="description" content="Partner portal for managing client families" />
      </Helmet>

      <div className="min-h-screen bg-gradient-premium text-white">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-card/5 border-r border-white/10 backdrop-blur-xl">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Partner Portal</p>
                <p className="text-xs text-white/60">SplitSchedule</p>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'clients', label: 'Clients', icon: Users },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'calendar', label: 'Calendar', icon: Calendar },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === item.id 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.id === 'messages' && (
                    <Badge className="ml-auto bg-accent text-white text-xs">2</Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/20 text-primary">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <p className="text-xs text-white/60">Partner Account</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1 text-white/60 hover:text-white hover:bg-white/10">
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 text-white/60 hover:text-white hover:bg-white/10"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-card/5 border-b border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between px-8 py-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {activeTab === 'overview' && 'Dashboard Overview'}
                  {activeTab === 'clients' && 'Client Families'}
                  {activeTab === 'messages' && 'Messages'}
                  {activeTab === 'documents' && 'Document Library'}
                  {activeTab === 'calendar' && 'Calendar'}
                </h1>
                <p className="text-white/60">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input 
                    placeholder="Search..." 
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 w-64"
                  />
                </div>
                <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Active Clients', value: '12', change: '+2 this month', icon: Users },
                    { label: 'Pending Cases', value: '3', change: 'Needs attention', icon: Clock },
                    { label: 'Unread Messages', value: '5', change: 'From 3 families', icon: MessageSquare },
                    { label: 'Avg. Response Time', value: '2.4h', change: 'Great performance', icon: Star },
                  ].map((stat) => (
                    <Card key={stat.label} className="bg-white/5 border-white/10">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/60 text-sm">{stat.label}</p>
                            <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                            <p className="text-xs text-white/40 mt-1">{stat.change}</p>
                          </div>
                          <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                            <stat.icon className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent Activity & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Recent Client Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockClients.map((client) => (
                          <div key={client.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/20 text-primary">
                                  {client.familyName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-white">{client.familyName}</p>
                                <p className="text-sm text-white/60">{client.caseType}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={client.status === 'active' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}>
                                {client.status}
                              </Badge>
                              <p className="text-xs text-white/40 mt-1">{client.lastActivity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { label: 'Start Video Call', desc: 'Connect with a client', icon: Video },
                        { label: 'View Documents', desc: 'Access shared files', icon: FileText },
                        { label: 'Schedule Meeting', desc: 'Book client appointment', icon: Calendar },
                        { label: 'Send Message', desc: 'Contact a family', icon: MessageSquare },
                      ].map((action) => (
                        <button
                          key={action.label}
                          className="w-full flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
                        >
                          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <action.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white">{action.label}</p>
                            <p className="text-sm text-white/60">{action.desc}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-white/40" />
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Clients Tab */}
            {activeTab === 'clients' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">All Clients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockClients.map((client) => (
                          <div 
                            key={client.id}
                            onClick={() => setSelectedClient(client.id)}
                            className={`flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer ${
                              selectedClient === client.id ? 'bg-primary/20 border border-primary/50' : 'bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-primary/20 text-primary text-lg">
                                  {client.familyName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-white">{client.familyName}</p>
                                <p className="text-sm text-white/60">{client.caseType}</p>
                                <p className="text-xs text-white/40 mt-1">Last active: {client.lastActivity}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={client.status === 'active' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}>
                                {client.status}
                              </Badge>
                              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Client Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedClient ? (
                      <div className="space-y-6">
                        <div className="text-center">
                          <Avatar className="h-20 w-20 mx-auto">
                            <AvatarFallback className="bg-primary/20 text-primary text-2xl">S</AvatarFallback>
                          </Avatar>
                          <h3 className="text-xl font-semibold text-white mt-4">Smith Family</h3>
                          <Badge className="mt-2">Custody Modification</Badge>
                        </div>
                        <Separator className="bg-white/10" />
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-white/60">Status</span>
                            <Badge className="bg-success/20 text-success">Active</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Assigned</span>
                            <span className="text-white">Jan 15, 2024</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Documents</span>
                            <span className="text-white">12 files</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-primary hover:bg-primary/90">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                          <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
                            <Video className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-white/40">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a client to view details</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg">Conversations</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[500px]">
                      {mockMessages.map((msg) => (
                        <div 
                          key={msg.id}
                          className={`p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${
                            msg.unread ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-white">{msg.family}</p>
                            <span className="text-xs text-white/40">{msg.time}</span>
                          </div>
                          <p className="text-sm text-white/60 truncate">{msg.message}</p>
                          {msg.unread && (
                            <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                          )}
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 bg-white/5 border-white/10 flex flex-col">
                  <CardHeader className="border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/20 text-primary">S</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">Smith Family</p>
                          <p className="text-xs text-white/40">Last seen 2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-4">
                    <ScrollArea className="h-[350px]">
                      <div className="space-y-4">
                        <div className="flex justify-start">
                          <div className="max-w-[70%] p-3 rounded-lg bg-white/10">
                            <p className="text-white">Can we schedule a call to discuss the custody arrangement?</p>
                            <p className="text-xs text-white/40 mt-1">10:30 AM</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="max-w-[70%] p-3 rounded-lg bg-primary">
                            <p className="text-white">Of course! I have availability tomorrow at 2 PM or Thursday at 10 AM. Which works better?</p>
                            <p className="text-xs text-white/60 mt-1">10:45 AM</p>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <div className="p-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage} className="bg-primary hover:bg-primary/90">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-12 text-center">
                  <FileText className="h-16 w-16 mx-auto text-white/20 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Document Library</h3>
                  <p className="text-white/60">Access shared documents from your client families</p>
                  <p className="text-sm text-white/40 mt-4">Read-only access to protect client privacy</p>
                </CardContent>
              </Card>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto text-white/20 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Partner Calendar</h3>
                  <p className="text-white/60">View client schedules and schedule meetings</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default PartnersDashboard;