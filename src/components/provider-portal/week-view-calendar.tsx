import { Badge } from '@/components/ui/badge';

const timeSlots = Array.from({ length: 10 }, (_, i) => `${i + 8}:00 AM`);
const days = [
  { day: 'Mon', date: 8, appointments: [{ start: 1, duration: 1, title: 'Client Session', time: '9:00 AM - 10:00 AM', color: 'blue' }] },
  { day: 'Tue', date: 9, appointments: [{ start: 2, duration: 1, title: 'Client Consultation', time: '10:00 AM - 11:00 AM', color: 'purple' }] },
  { day: 'Wed', date: 10, appointments: [] },
  { day: 'Thu', date: 11, appointments: [{ start: 5, duration: 1, title: 'Team Meeting', time: '1:00 PM - 2:00 PM', color: 'green' }] },
  { day: 'Fri', date: 12, appointments: [], isToday: true },
  { day: 'Sat', date: 13, appointments: [], isWeekend: true },
  { day: 'Sun', date: 14, appointments: [], isWeekend: true },
];

const colorClasses = {
    blue: 'bg-blue-100 border-blue-200 text-blue-800',
    purple: 'bg-purple-100 border-purple-200 text-purple-800',
    green: 'bg-green-100 border-green-200 text-green-800',
};

export function WeekViewCalendar() {
  return (
    <div className="grid grid-cols-[auto_1fr] h-full">
      {/* Time column */}
      <div className="border-r">
        <div className="sticky top-0 z-10 bg-card py-2 border-b h-[65px]"></div>
        <div className="divide-y text-xs text-muted-foreground text-right pr-2">
          {timeSlots.map((time, index) => (
            <div key={index} className="h-16 flex items-center justify-end">
              {time.replace('AM', '')} {index < 4 ? 'AM' : 'PM'}
            </div>
          ))}
          <div className="h-16 flex items-center justify-end">5:00 PM</div>
        </div>
      </div>

      {/* Days columns */}
      <div className="grid grid-cols-7">
        {days.map((day) => (
          <div key={day.day} className="border-r last:border-r-0">
            {/* Header */}
            <div className={`text-center py-2 border-b sticky top-0 z-10 ${day.isToday ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
              <p className="text-sm font-medium">{day.day}</p>
              <p className="text-lg font-bold">{day.date}</p>
            </div>
            {/* Grid */}
            <div className={`relative h-full divide-y ${day.isWeekend ? 'bg-muted/50' : ''}`}>
              {timeSlots.map((_, index) => (
                <div key={index} className="h-16"></div>
              ))}
              <div className="h-16"></div> {/* Extra slot for 5pm */}
              
              {/* Appointments */}
              {day.appointments.map(apt => (
                <div key={apt.title} className="absolute inset-x-2" style={{ top: `calc(${apt.start * 4}rem + 2px)`, height: `calc(${apt.duration * 4}rem - 4px)`}}>
                   <div className={`p-2 rounded-md border ${colorClasses[apt.color as keyof typeof colorClasses]}`}>
                    <p className="text-xs font-semibold">{apt.title}</p>
                    <p className="text-xs">{apt.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}