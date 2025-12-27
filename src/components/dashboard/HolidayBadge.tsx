import { useState, useEffect } from 'react';
import { Calendar, PartyPopper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Holiday {
  name: string;
  date: string;
}

export const HolidayBadge = () => {
  const [upcomingHoliday, setUpcomingHoliday] = useState<Holiday | null>(null);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const year = new Date().getFullYear();
        const response = await fetch(
          `https://openholidaysapi.org/PublicHolidays?countryIsoCode=US&validFrom=${year}-01-01&validTo=${year}-12-31`
        );
        
        if (!response.ok) return;
        
        const holidays = await response.json();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find next upcoming holiday
        const upcoming = holidays.find((h: any) => {
          const holidayDate = new Date(h.startDate);
          return holidayDate >= today;
        });
        
        if (upcoming) {
          setUpcomingHoliday({
            name: upcoming.name[0]?.text || upcoming.name,
            date: upcoming.startDate,
          });
        }
      } catch (err) {
        console.error('Failed to fetch holidays:', err);
      }
    };

    fetchHolidays();
  }, []);

  if (!upcomingHoliday) return null;

  const holidayDate = new Date(upcomingHoliday.date);
  const today = new Date();
  const daysUntil = Math.ceil((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const isToday = daysUntil === 0;
  const isSoon = daysUntil <= 7;

  return (
    <Badge
      variant="outline"
      className={`${
        isToday
          ? 'bg-pink/10 text-pink border-pink/30'
          : isSoon
          ? 'bg-purple/10 text-purple border-purple/30'
          : 'bg-info/10 text-info border-info/30'
      } gap-1.5 py-1 px-2.5`}
    >
      {isToday ? (
        <PartyPopper className="w-3.5 h-3.5" strokeWidth={1.5} />
      ) : (
        <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
      )}
      <span className="text-xs font-normal">
        {isToday
          ? `Today: ${upcomingHoliday.name}`
          : `${upcomingHoliday.name} in ${daysUntil} days`}
      </span>
    </Badge>
  );
};
