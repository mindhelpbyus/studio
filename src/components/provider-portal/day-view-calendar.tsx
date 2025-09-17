


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


export function DayViewCalendar() {
  // Height of each 30-minute slot in rem
  const slotHeight = 3; // 3rem for 30 mins, so 6rem for an hour

  return (
    <div className="grid grid-cols-[auto_1fr] h-full bg-background">
      {/* Time column */}
      <div className="border-r">
         <div className="py-2 border-b h-10"></div>
        <div className="divide-y text-xs text-muted-foreground text-right pr-2">
          {timeSlots.map((time, index) => (
            <div key={index} style={{ height: `${slotHeight * 2}rem`}} className={`flex items-center justify-end`}>
              {parseInt(time) % 12 || 12}:00 {parseInt(time) < 12 ? 'AM' : 'PM'}
            </div>
          ))}
        </div>
      </div>

      {/* Day column */}
      <div className="border-r last:border-r-0">
        <div className={`text-center py-2 border-b h-10 flex flex-col items-center justify-center`}>
            {/* This space is intentionally blank to align with the page header */}
        </div>
        <div className={`relative h-full divide-y`}>
          {timeSlots.map((_, index) => (
            <div key={index} style={{ height: `${slotHeight * 2}rem`}}></div>
          ))}

          {/* Appointments */}
          {appointments.map(apt => {
            const colorSet = apt.active ? activeColorClasses : colorClasses;
            const topPosition = apt.start * (slotHeight * 2 / 2); // e.g., start at 13:00 (1pm) -> 13 * 6rem
            const height = apt.duration * (slotHeight * 2 / 2); // e.g., 2 * 30-min blocks -> 2 * 3rem
            
            return (
                <div key={apt.name} className="absolute inset-x-1" style={{ top: `${topPosition}rem`, height: `calc(${height}rem - 2px)`}}>
                    <div className={`p-2 rounded-lg border h-full ${colorSet[apt.color as keyof typeof colorSet]} ${apt.type === 'break' ? 'bg-stripes' : ''}`}>
                        <p className="text-sm font-bold uppercase">{apt.title}</p>
                        <p className="text-base font-semibold">{apt.name}</p>
                        <p className="text-sm">{apt.time}</p>
                    </div>
                </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
