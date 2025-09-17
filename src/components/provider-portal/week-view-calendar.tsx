
import { Badge } from '@/components/ui/badge';

const timeSlots = Array.from({ length: 11 }, (_, i) => `${i + 7}:00`);

const days = [
    { day: 'Mon', date: 15, appointments: [] },
    { day: 'Tue', date: 16, appointments: [
        { start: 5, duration: 2, title: '50-Minute Facial', name: 'Lucy Carmichael', time: '1:00 PM - 2:00 PM', color: 'pink', active: true },
        { start: 7, duration: 3, title: 'Pedicure', name: 'Nathaniel James', time: '2:00 PM - 3:00 PM', color: 'purple' },
        { start: 8, duration: 2, title: 'Gel Manicure', name: 'Kelly Green', time: '3:00 PM - 4:00 PM', color: 'orange' },
    ] },
    { day: 'Wed', date: 17, appointments: [] },
    { day: 'Thu', date: 18, appointments: [] },
    { day: 'Fri', date: 19, appointments: [] },
];

const colorClasses = {
    pink: 'bg-pink-100 border-pink-300 text-pink-900',
    purple: 'bg-purple-100 border-purple-300 text-purple-900',
    orange: 'bg-orange-100 border-orange-300 text-orange-900',
};

const activeColorClasses = {
    pink: 'bg-pink-200 border-2 border-pink-500 text-pink-900',
    purple: 'bg-purple-200 border-2 border-purple-500 text-purple-900',
    orange: 'bg-orange-200 border-2 border-orange-500 text-orange-900',
};

export function WeekViewCalendar() {
  return (
    <div className="grid grid-cols-[auto_1fr] h-full bg-background">
      {/* Time column */}
      <div className="border-r">
         <div className="py-2 border-b h-[2.5rem]"></div>
        <div className="divide-y text-xs text-muted-foreground text-right pr-2">
          {timeSlots.map((time, index) => (
            <div key={index} className="h-16 flex items-center justify-end">
              {parseInt(time) % 12 || 12}:00 {parseInt(time) < 12 || parseInt(time) === 24 ? 'AM' : 'PM'}
            </div>
          ))}
          <div className="h-16 flex items-center justify-end">6:00 PM</div>
        </div>
      </div>

      {/* Days columns */}
      <div className="grid grid-cols-5">
        {days.map((day) => (
          <div key={day.day} className="border-r last:border-r-0">
            {/* Header */}
            <div className={`text-center py-2 border-b h-10 flex flex-col items-center justify-center`}>
                <span className='font-medium text-sm'>{day.day.toUpperCase()}</span>
                <span className='font-bold text-xl'>{day.date}</span>
            </div>
            {/* Grid */}
            <div className={`relative h-full divide-y`}>
              {timeSlots.map((_, index) => (
                <div key={index} className="h-16"></div>
              ))}
              <div className="h-16"></div> {/* Extra slot */}
              
              {/* Appointments */}
              {day.appointments.map(apt => {
                const colorSet = apt.active ? activeColorClasses : colorClasses;
                return (
                    <div key={apt.name} className="absolute inset-x-0.5" style={{ top: `calc(${apt.start * 4}rem + 2px)`, height: `calc(${apt.duration * 4}rem - 4px)`}}>
                        <div className={`p-2 rounded-md border h-full ${colorSet[apt.color as keyof typeof colorSet]}`}>
                            <p className="text-xs font-bold uppercase">{apt.title}</p>
                            <p className="text-sm font-semibold">{apt.name}</p>
                            <p className="text-xs">{apt.time}</p>
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
