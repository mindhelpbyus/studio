





const timeSlots = Array.from({ length: 24 }, (_, i) => `${i}:00`);

const appointments = [
  { start: 13, duration: 2, title: '50-Minute Facial', name: 'Lucy Carmichael', time: '1:00 PM - 2:00 PM', color: 'pink', active: true, type: 'appointment' },
  { start: 15, duration: 2, title: 'Gel Manicure', name: 'Kelly Green', time: '3:00 PM - 4:00 PM', color: 'orange', type: 'appointment' },
  { start: 12, duration: 1, title: 'Lunch Break', name: '', time: '12:00 PM - 1:00 PM', color: 'gray', type: 'break' },
  { start: 10, duration: 2, title: 'Deep Tissue Massage', name: 'John Smith', time: '10:00 AM - 11:00 AM', color: 'blue', type: 'appointment' },
  { start: 18, duration: 1, title: 'Personal Break', name: '', time: '6:00 PM - 6:30 PM', color: 'gray', type: 'break' },

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


interface DayViewCalendarProps {
  currentDate: Date;
}

export function DayViewCalendar({ currentDate }: DayViewCalendarProps) {
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

        {/* Day column */}
        <div className="relative">
          <div className="h-16 border-b bg-card sticky top-0 z-10 shadow-sm"></div>

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
            {appointments.map((apt, index) => {
              const colorSet = apt.active ? activeColorClasses : colorClasses;
              const topPosition = apt.start * slotHeight;
              const height = apt.duration * slotHeight;

              return (
                <div
                  key={`${apt.title}-${apt.name}-${index}`}
                  className="absolute left-4 right-4 cursor-pointer calendar-appointment"
                  style={{
                    top: `${topPosition}rem`,
                    height: `${height - 0.25}rem`
                  }}
                >
                  <div className={`p-3 rounded-lg border-l-4 h-full overflow-hidden shadow-sm ${colorSet[apt.color as keyof typeof colorSet]} ${apt.type === 'break' ? 'opacity-75' : ''}`}>
                    <p className="font-semibold text-sm uppercase tracking-wide truncate mb-2">
                      {apt.title}
                    </p>
                    {apt.name && (
                      <p className="font-medium text-base truncate mb-2">{apt.name}</p>
                    )}
                    <p className="text-sm opacity-75 truncate">{apt.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
