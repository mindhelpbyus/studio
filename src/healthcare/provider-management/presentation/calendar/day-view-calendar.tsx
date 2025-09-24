const timeSlots = Array.from({ length: 24 }, (_, i) => `${i}:00`);

// Sample appointments that match the reference design
const appointments = [
  { start: 9, duration: 1, title: 'DEEP TISSUE MASSAGE', name: 'Lisa Brown', time: '9:00 AM - 10:00 AM', color: 'blue', type: 'appointment' },
  { start: 10, duration: 1.5, title: 'SWEDISH MASSAGE', name: 'Mike Davis', time: '10:00 AM - 11:30 AM', color: 'blue', type: 'appointment' },
  { start: 12, duration: 1, title: 'LUNCH BREAK', name: '', time: '12:00 PM - 1:00 PM', color: 'gray', type: 'break' },
  { start: 13, duration: 1, title: '50-MINUTE FACIAL', name: 'Lucy Carmichael', time: '1:00 PM - 2:00 PM', color: 'pink', active: true, type: 'appointment' },
  { start: 15, duration: 2, title: 'GEL MANICURE', name: 'Kelly Green', time: '3:00 PM - 5:00 PM', color: 'orange', type: 'appointment' },
];

const colorClasses = {
  pink: 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-400 text-pink-900',
  purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-400 text-purple-900',
  orange: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-400 text-orange-900',
  blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400 text-blue-900',
  gray: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-400 text-gray-700',
};

const activeColorClasses = {
  pink: 'bg-gradient-to-br from-pink-100 to-pink-200 border-pink-500 text-pink-900 ring-2 ring-pink-200',
  purple: 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-500 text-purple-900 ring-2 ring-purple-200',
  orange: 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-500 text-orange-900 ring-2 ring-orange-200',
  blue: 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-500 text-blue-900 ring-2 ring-blue-200',
  gray: 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-500 text-gray-800 ring-2 ring-gray-200',
};

interface DayViewCalendarProps {
  currentDate: Date;
}

export function DayViewCalendar({ currentDate }: DayViewCalendarProps) {
  const slotHeight = 4; // 4rem per hour

  return (
    <div className="h-full overflow-auto">
      <div className="grid grid-cols-[80px_1fr] min-h-full bg-background">
        {/* Time column */}
        <div className="border-r bg-muted/30">
          <div className="h-16 border-b bg-card sticky top-0 z-20"></div>
          <div className="text-xs text-muted-foreground">
            {timeSlots.map((time, index) => (
              <div
                key={index}
                style={{ height: `${slotHeight}rem` }}
                className="flex items-start justify-end pr-3 pt-1 border-b border-muted/50"
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
                className="border-b border-muted/50 hover:bg-muted/20 transition-colors relative"
              >
                <div className="absolute top-0 left-0 w-4 h-px bg-muted-foreground/20"></div>
              </div>
            ))}

            {/* Appointments */}
            {appointments.map((apt, index) => {
              const colorSet = apt.active ? activeColorClasses : colorClasses;
              const topPosition = apt.start * slotHeight;
              const height = apt.duration * slotHeight;

              return (
                <div
                  key={`${apt.title}-${apt.name}-${index}`}
                  className="absolute left-3 right-3 cursor-pointer group"
                  style={{
                    top: `${topPosition}rem`,
                    height: `${height - 0.25}rem`
                  }}
                >
                  <div className={`p-3 rounded-lg border-l-4 h-full overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${colorSet[apt.color as keyof typeof colorSet]} ${apt.type === 'break' ? 'opacity-75' : ''}`}>
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <p className="font-semibold text-sm uppercase tracking-wide truncate mb-1">
                          {apt.title}
                        </p>
                        {apt.name && (
                          <p className="font-medium text-base truncate mb-1">{apt.name}</p>
                        )}
                      </div>
                      <p className="text-sm opacity-75 truncate mt-auto">{apt.time}</p>
                    </div>
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