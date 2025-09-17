
import { Badge } from '@/components/ui/badge';

const timeSlots = Array.from({ length: 24 }, (_, i) => `${i}:00`);

const days = [
    { day: 'Mon', date: 15, appointments: [] },
    { day: 'Tue', date: 16, appointments: [
        { start: 13, duration: 2, title: '50-Min Facial', name: 'Lucy C.', time: '1:00 PM', color: 'pink', active: true, type: 'appointment' },
        { start: 12, duration: 1, title: 'Lunch', name: 'Therapist', time: '12:00 PM', color: 'gray', type: 'break' },
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

export function WeekViewCalendar() {
  const slotHeight = 2; // 2rem per 30 minutes, so 4rem per hour.

  return (
    <div className="grid grid-cols-[auto_1fr] h-full bg-background">
      {/* Time column */}
      <div className="border-r">
         <div className="py-2 border-b h-[5.5rem] sticky top-0 bg-card z-10"></div>
        <div className="divide-y text-xs text-muted-foreground text-right pr-2">
          {timeSlots.map((time, index) => (
            <div key={index} className={`h-${slotHeight * 2} flex items-center justify-end`}>
              {parseInt(time) % 12 || 12}:00 {parseInt(time) < 12 ? 'AM' : 'PM'}
            </div>
          ))}
        </div>
      </div>

      {/* Days columns */}
      <div className="grid grid-cols-5">
        {days.map((day) => (
          <div key={day.day} className="border-r last:border-r-0">
            {/* Header */}
            <div className={`text-center py-2 border-b h-[5.5rem] flex flex-col items-center justify-center sticky top-0 bg-card z-10`}>
                <span className='font-medium text-sm'>{day.day.toUpperCase()}</span>
                <span className='font-bold text-3xl'>{day.date}</span>
            </div>
            {/* Grid */}
            <div className={`relative h-full divide-y`}>
              {timeSlots.map((_, index) => (
                <div key={index} className={`h-${slotHeight * 2}`}></div>
              ))}
              
              {/* Appointments */}
              {day.appointments.map(apt => {
                const colorSet = apt.active ? activeColorClasses : colorClasses;
                const topPosition = apt.start * slotHeight;
                const height = apt.duration * slotHeight;
                return (
                    <div key={apt.name} className="absolute inset-x-0.5" style={{ top: `${topPosition}rem`, height: `calc(${height}rem - 2px)`}}>
                        <div className={`p-1 rounded-md border h-full overflow-hidden text-xs ${colorSet[apt.color as keyof typeof colorSet]} ${apt.type === 'break' ? 'italic' : ''}`}>
                            <p className="font-bold uppercase truncate">{apt.title}</p>
                            <p className="font-semibold truncate">{apt.name}</p>
                            <p className="truncate">{apt.time}</p>
                        </div>
                    </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
