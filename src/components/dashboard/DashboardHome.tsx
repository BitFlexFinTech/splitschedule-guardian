import { User } from "@supabase/supabase-js";
import { Calendar, DollarSign, MessageSquare, Shield, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DashboardHomeProps {
  user: User;
}

const DashboardHome = ({ user }: DashboardHomeProps) => {
  const stats = [
    {
      label: "Upcoming Events",
      value: "3",
      icon: Calendar,
      color: "bg-primary/10 text-primary",
      href: "/calendar",
    },
    {
      label: "Pending Expenses",
      value: "$245.00",
      icon: DollarSign,
      color: "bg-success/10 text-success",
      href: "/expenses",
    },
    {
      label: "Unread Messages",
      value: "5",
      icon: MessageSquare,
      color: "bg-info/10 text-info",
      href: "/messages",
    },
    {
      label: "Open Incidents",
      value: "0",
      icon: Shield,
      color: "bg-warning/10 text-warning",
      href: "/incident-log",
    },
  ];

  const upcomingEvents = [
    {
      title: "Weekend with Dad",
      date: "Fri, Dec 13 - Sun, Dec 15",
      type: "custody",
      color: "bg-primary",
    },
    {
      title: "School Play",
      date: "Thu, Dec 19 at 6:00 PM",
      type: "event",
      color: "bg-accent",
    },
    {
      title: "Winter Break Starts",
      date: "Sat, Dec 21",
      type: "holiday",
      color: "bg-success",
    },
  ];

  const recentActivity = [
    {
      text: "Expense submitted: School supplies - $45.00",
      time: "2 hours ago",
    },
    {
      text: "Message from Co-parent: Confirmed pickup time",
      time: "5 hours ago",
    },
    {
      text: "Calendar event updated: Weekend schedule",
      time: "1 day ago",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Link
            key={index}
            to={stat.href}
            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Schedule</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/calendar" className="gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className={`w-1 h-full min-h-[40px] rounded-full ${event.color}`} />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="gap-1">
              <Clock className="w-4 h-4" />
              Last 7 days
            </Button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
              >
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{activity.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl bg-gradient-primary p-6 text-primary-foreground">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Need to log an incident?</h2>
            <p className="text-primary-foreground/80">
              Create tamper-proof records for court-ready documentation.
            </p>
          </div>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/incident-log">Log Incident</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
