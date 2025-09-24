
const timeSlots = Array.from({ length: 24 }, (_, i) => `${i}:00`);

const days = [
  { day: 'Mon', date: 15, appointments: [] },
  {
    day: 'Tue', date: 16, appointments: [
      { start: 10, duration: 1, title: 'MANICURE', name: 'Kelly G.', time: '10:00 AM - 11:00 AM', color: 'orange', type: 'appointment' },
      { start: 12, duration: 1, title: 'LUNCH BREAK', name: '', time: '12:00 PM - 1:00 PM', color: 'gray', type: 'break' },
      { start: 13, duration: 1, title: '50-MIN FACIAL', name: 'Lucy C.', time: '1:00 PM - 2:00 PM', color: 'pink', active: true, type: 'appointment' },
      { start: 15, duration: 2, title: 'PEDICURE', name: 'Nathaniel J.', time: '3:00 PM - 5:00 PM', color: 'purple', type: 'appointment' },
    ]
  },
  {
    day: 'Wed', date: 17, appointments: [
      { start: 9, duration: 2, title: 'CONSULTATION', name: 'Alex R.', time: '9:00 AM - 11:00 AM', color: 'blue', type: 'appointment' },
      { start: 14, duration: 1, title: 'FOLLOW-UP', name: 'Maria S.', time: '2:00 PM - 3:00 PM', color: 'orange', type: 'appointment' },
    ]
  },
  {
    day: 'Thu', date: 18, appointments: [
      { start: 11, duration: 2, title: 'DEEP MASSAGE', name: 'John D.', time: '11:00 AM - 1:00 PM', color: 'blue', type: 'appointment' },
    ]
  },
  {
    day: 'Fri', date: 19, appointments: [
      { start: 14, duration: 2, title: 'FACIAL TREATMENT', name: 'Samantha B.', time: '2:00 PM - 4:00 PM', color: 'pink', type: 'appointment' },
      { start: 16, duration: 1, title: 'QUICK TOUCH-UP', name: 'Emma W.', time: '4:00 PM - 5:00 PM', color: 'orange', type: 'appointment' },
    ]
  },
];

const slotHeight = 4; // rem per hour
const appointmentGap = 0.5; // rem vertical gap

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

interface WeekViewCalendarProps {
  currentDate: Date;
}

export function WeekViewCalendar({ currentDate }: WeekViewCalendarProps) {
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
                  {parseInt(time) === 0
                    ? '12:00 AM'
                    : parseInt(time) < 12
                      ? `${parseInt(time)}:00 AM`
                      : parseInt(time) === 12
                        ? '12:00 PM'
                        : `${parseInt(time) - 12}:00 PM`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Day Columns */}
        <div className="grid grid-cols-5 min-h-full">
          {days.map((day, dayIndex) => (
            <div key={day.day} className="border-r last:border-r-0 relative">
              {/* Day Header */}
              <div className="text-center h-16 border-b flex flex-col items-center justify-center sticky top-0 bg-card z-10 shadow-sm">
                <span className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{day.day}</span>
                <span className="font-bold text-2xl text-foreground">{day.date}</span>
              </div>

              {/* Time Grid Background */}
              <div className="relative">
                {timeSlots.map((_, index) => (
                  <div
                    key={index}
                    style={{ height: `${slotHeight}rem` }}
                    className="border-b border-muted/50 hover:bg-muted/20 transition-colors relative"
                  >
                    <div className="absolute top-0 left-0 w-2 h-px bg-muted-foreground/20"></div>
                  </div>
                ))}

                {/* Appointments */}
                {day.appointments.map((apt, aptIndex) => {
                  const colorSet = apt.active ? activeColorClasses : colorClasses;
                  const top = apt.start * slotHeight;
                  const height = apt.duration * slotHeight;

                  return (
                    <div
                      key={`${apt.title}-${apt.name}-${aptIndex}`}
                      className="absolute left-1 right-1 cursor-pointer group"
                      style={{
                        top: `${top}rem`,
                        height: `calc(${height}rem - ${appointmentGap}rem)`
                      }}
                    >
                      <div className={`
                        p-2 rounded-lg border-l-4 h-full overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 
                        ${colorSet[apt.color as keyof typeof colorSet]} 
                        ${apt.type === 'break' ? 'opacity-75' : ''}
                      `}>
                        <div className="flex flex-col h-full justify-between">
                          <div>
                            <p className="font-semibold text-xs uppercase tracking-wide truncate mb-1">{apt.title}</p>
                            {apt.name && (
                              <p className="font-medium text-xs truncate mb-1">{apt.name}</p>
                            )}
                          </div>
                          <p className="text-xs opacity-75 truncate mt-auto">{apt.time}</p>
                        </div>
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