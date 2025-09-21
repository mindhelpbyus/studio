





import { Badge } from '@/components/ui/badge';

const timeSlots = Array.from({ length: 24 }, (_, i) => `${i}:00`);

const days = [
    { day: 'Mon', date: 15, appointments: [] },
    { day: 'Tue', date: 16, appointments: [
        { start: 13, duration: 2, title: '50-Min Facial', name: 'Lucy C.', time: '1:00 PM', color: 'pink', active: true, type: 'appointment' },
        { start: 12, duration: 1, title: 'Lunch Break', name: '', time: '12:00 PM', color: 'gray', type: 'break' },
        { start: 15.5, duration: 2, title: 'Pedicure', name: 'Nathaniel J.', time: '3:30 PM', color: 'purple', type: 'appointment' },
        { start: 10, duration: 1.5, title: 'Manicure', name: 'Kelly G.', time: '10:00 AM', color: 'orange', type: 'appointment' },
    ] },
    { day: 'Wed', date: 17, appointments: [
        { start: 9, duration: 2, title: 'Consult', name: 'Alex R.', time: '9:00 AM', color: 'blue', type: 'appointment' },
    ] },
    { day: 'Thu', date: 18, appointments: [] },
    { day: 'Fri', date: 19, appointments: [
        { start: 14, duration: 3, title: 'Facial', name: 'Samantha B.', time: '2:00 PM', color: 'pink', type: 'appointment' },
    ] },
];

const colorClasses = {
    pink: 'bg-pink-100 border-pink-300 text-pink-900',
    purple: 'bg-purple-100 border-purple-300 text-purple-900',
    orange: 'bg-orange-100 border-orange-300 text-orange-900',
    blue: 'bg-blue-100 border-blue-300 text-blue-900',
    gray: 'bg-muted border-gray-300 text-muted-foreground',
};

const activeColorClasses = {
    pink: 'bg-pink-200 border-2 border-pink-500 text-pink-900',
    purple: 'bg-purple-200 border-2 border-purple-500 text-purple-900',
    orange: 'bg-orange-200 border-2 border-orange-500 text-orange-900',
    blue: 'bg-blue-200 border-2 border-blue-500 text-blue-900',
    gray: 'bg-muted/80 border-2 border-gray-400 text-muted-foreground',
};

interface WeekViewCalendarProps {
  currentDate: Date;
}

export function WeekViewCalendar({ currentDate }: WeekViewCalendarProps) {
  const slotHeight = 4; // 4rem per hour for better spacing

  return (
    <div className="h-full overflow-auto calendar-scroll">
      <div className="grid grid-cols-[80px_1fr] min-h-full bg-background calendar-grid">
        {/* Time column */}
        <div className="border-r bg-muted/30">
          <div className="h-16 border-b bg-card sticky top-0 z-20"></div>
          <div className="text-xs text-muted-foreground">
            {timeSlots.map((time, index) => (
              <div 
                key={index} 
                style={{ height: `${slotHeight}rem` }} 
                className="flex items-start justify-end pr-3 pt-1 border-b border-muted/50 calendar-time-slot"
              >
                <span className="font-medium">
                  {parseInt(time) === 0 ? '12:00 AM' : 
                   parseInt(time) < 12 ? `${parseInt(time)}:00 AM` : 
                   parseInt(time) === 12 ? '12:00 PM' : 
                   `${parseInt(time) - 12}:00 PM`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Days columns */}
        <div className="grid grid-cols-5 min-h-full">
          {days.map((day, dayIndex) => (
            <div key={day.day} className="border-r last:border-r-0 relative">
              {/* Header */}
              <div className="text-center h-16 border-b flex flex-col items-center justify-center sticky top-0 bg-card z-10 shadow-sm">
                <span className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {day.day}
                </span>
                <span className="font-bold text-2xl text-foreground">{day.date}</span>
              </div>
              
              {/* Time grid background */}
              <div className="relative">
                {timeSlots.map((_, index) => (
                  <div 
                    key={index} 
                    style={{ height: `${slotHeight}rem` }} 
                    className="border-b border-muted/50 hover:bg-muted/20 transition-colors"
                  />
                ))}
                
                {/* Appointments */}
                {day.appointments.map((apt, aptIndex) => {
                  const colorSet = apt.active ? activeColorClasses : colorClasses;
                  const topPosition = apt.start * slotHeight;
                  const height = apt.duration * slotHeight;
                  
                  return (
                    <div 
                      key={`${apt.title}-${apt.name}-${aptIndex}`} 
                      className="absolute left-1 right-1 cursor-pointer calendar-appointment" 
                      style={{ 
                        top: `${topPosition}rem`, 
                        height: `${height - 0.25}rem` 
                      }}
                    >
                      <div className={`p-2 rounded-lg border-l-4 h-full overflow-hidden shadow-sm ${colorSet[apt.color as keyof typeof colorSet]} ${apt.type === 'break' ? 'opacity-75' : ''}`}>
                        <p className="font-semibold text-xs uppercase tracking-wide truncate mb-1">
                          {apt.title}
                        </p>
                        {apt.name && (
                          <p className="font-medium text-sm truncate mb-1">{apt.name}</p>
                        )}
                        <p className="text-xs opacity-75 truncate">{apt.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
