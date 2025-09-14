import { WeekViewCalendar } from '@/components/provider-portal/week-view-calendar';

export default function CalendarPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-4 border-b p-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-md border bg-card p-1">
            <button className="rounded-md p-1.5 hover:bg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-muted-foreground"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span className="text-sm font-medium">July 8 - 14, 2024</span>
            <button className="rounded-md p-1.5 hover:bg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-muted-foreground"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
          <div className="flex items-center rounded-md border bg-card text-sm font-medium">
            <button className="px-3 py-1.5 hover:bg-muted/50 rounded-l-md">Day</button>
            <button className="px-3 py-1.5 border-x bg-muted text-primary">Week</button>
            <button className="px-3 py-1.5 hover:bg-muted/50 rounded-r-md">Month</button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <WeekViewCalendar />
      </main>
    </div>
  );
}
