'use client';

import { useState } from 'react';

export default function DashboardPage() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Hero Section with Geometric Background */}
      <div className="w-full py-20 relative bg-Color-Tokens-Background-Secondary flex flex-col justify-start items-start gap-24 overflow-hidden">
        {/* Geometric Background Pattern */}
        <div className="w-full h-[697px] absolute left-0 top-0 overflow-hidden pointer-events-none">
          <div className="w-80 h-72 absolute left-[531.84px] top-[26.05px] outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
          <div className="w-80 h-72 absolute left-[337px] top-[721.29px] outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
          <div className="w-80 h-72 absolute left-[1252.09px] top-[511.29px] outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
          <div className="w-80 h-72 absolute left-[336.94px] top-[363.62px] outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
          <div className="w-80 h-72 absolute left-[7.09px] top-[538.29px] outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
          <div className="w-[556.88px] h-[662.65px] absolute left-[6px] top-[-190.86px] outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
          <div className="w-[556.88px] h-[662.65px] absolute left-[1297.98px] top-[1026px] origin-top-left rotate-180 outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
          <div className="w-[556.88px] h-[662.65px] absolute left-[1396.98px] top-[471px] origin-top-left rotate-180 outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
          <div className="w-[556.88px] h-[662.65px] absolute left-[872.88px] top-[-86px] origin-top-left rotate-180 outline outline-1 outline-offset-[-0.50px] outline-GlobalColors-Neutral-60"></div>
        </div>

        {/* Gradient Overlays */}
        <div className="w-full h-36 absolute left-0 top-[466px] bg-gradient-to-b from-white/0 to-white pointer-events-none"></div>
        <div className="w-full h-36 absolute left-0 top-0 bg-gradient-to-b from-white/0 to-white pointer-events-none"></div>

        {/* Header */}
        <div className="w-full px-20 flex justify-between items-center relative z-10">
          <div className="flex justify-start items-center gap-5">
            <div className="w-11 h-9 relative">
              <div className="w-5 h-4 absolute left-[23.50px] top-0 bg-Color-Tokens-Content-Dark-Primary"></div>
              <div className="w-8 h-9 absolute left-0 top-0 bg-Color-Tokens-Content-Dark-Primary"></div>
            </div>
            <div className="text-Color-Tokens-Content-Dark-Primary text-3xl font-medium font-['Inter'] leading-10">Venture</div>
          </div>
          <div className="text-right text-slate-950 text-2xl font-normal font-['Inter'] leading-loose">Dashboard</div>
        </div>

        {/* Hero Content */}
        <div className="w-full px-20 flex flex-col justify-start items-center gap-12 relative z-10">
          <div className="w-full text-Color-Tokens-Content-Dark-Primary text-8xl font-medium font-['Inter'] leading-[96px]">Dashboard</div>
          <div className="w-full text-zinc-500 text-3xl font-normal font-['Inter'] leading-10">
            Your comprehensive healthcare management platform. Access your appointments, providers, and health information all in one place.
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-14 pb-14 flex flex-col justify-start items-center gap-10">
        {/* Stats Section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <StatCard
            title="Upcoming Appointments"
            value="3"
            description="Next appointment in 2 days"
            color="bg-blue-50"
          />
          <StatCard
            title="Active Providers"
            value="5"
            description="Primary care and specialists"
            color="bg-green-50"
          />
          <StatCard
            title="Health Records"
            value="24"
            description="Documents and reports"
            color="bg-purple-50"
          />
        </div>

        {/* Quick Actions */}
        <div className="w-full flex flex-col gap-3">
          <div className="text-Color-Tokens-Content-Dark-Primary text-3xl font-medium font-['Inter'] leading-loose">
            Quick Actions
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard
              icon="📅"
              title="Book Appointment"
              description="Schedule with your provider"
            />
            <ActionCard
              icon="👨‍⚕️"
              title="Find Provider"
              description="Search for specialists"
            />
            <ActionCard
              icon="📄"
              title="View Records"
              description="Access health documents"
            />
            <ActionCard
              icon="💊"
              title="Prescriptions"
              description="Manage medications"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="w-full flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="text-Color-Tokens-Content-Dark-Primary text-3xl font-medium font-['Inter'] leading-loose">
              Recent Activity
            </div>
            <button className="text-zinc-500 text-lg font-normal font-['Inter'] hover:text-Color-Tokens-Content-Dark-Primary transition-colors">
              View All
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <ActivityItem
              avatar="https://placehold.co/40x40"
              title="Appointment with Dr. Sarah Johnson"
              subtitle="Cardiology - Completed"
              time="2 days ago"
            />
            <ActivityItem
              avatar="https://placehold.co/40x40"
              title="Lab Results Available"
              subtitle="Blood work - Ready to view"
              time="5 days ago"
            />
            <ActivityItem
              avatar="https://placehold.co/40x40"
              title="Prescription Refilled"
              subtitle="Medication - Ready for pickup"
              time="1 week ago"
            />
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="w-full flex flex-col gap-6">
          <div className="text-Color-Tokens-Content-Dark-Primary text-3xl font-medium font-['Inter'] leading-loose">
            Upcoming Appointments
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AppointmentCard
              provider="Dr. Sarah Johnson"
              specialty="Cardiology"
              date="March 15, 2024"
              time="10:00 AM"
              location="Downtown Medical Center"
              type="In-Person"
            />
            <AppointmentCard
              provider="Dr. Michael Chen"
              specialty="Dermatology"
              date="March 20, 2024"
              time="2:30 PM"
              location="Virtual Visit"
              type="Telehealth"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, description, color }: {
  title: string;
  value: string;
  description: string;
  color: string;
}) {
  return (
    <div className={`${color} rounded-lg p-6 border border-Color-Tokens-Border-Secondary`}>
      <div className="text-Color-Tokens-Content-Dark-Tertiary text-sm font-normal font-['Inter'] leading-tight mb-2">
        {title}
      </div>
      <div className="text-Color-Tokens-Content-Dark-Primary text-5xl font-medium font-['Inter'] leading-tight mb-2">
        {value}
      </div>
      <div className="text-zinc-500 text-sm font-normal font-['Inter'] leading-tight">
        {description}
      </div>
    </div>
  );
}

function ActionCard({ icon, title, description }: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <button className="bg-white rounded-lg p-6 border border-Color-Tokens-Border-Secondary hover:border-Color-Tokens-Interaction-Outline-Hover hover:shadow-md transition-all text-left">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-Color-Tokens-Content-Dark-Primary text-lg font-medium font-['Inter'] leading-tight mb-1">
        {title}
      </div>
      <div className="text-zinc-500 text-sm font-normal font-['Inter'] leading-tight">
        {description}
      </div>
    </button>
  );
}

function ActivityItem({ avatar, title, subtitle, time }: {
  avatar: string;
  title: string;
  subtitle: string;
  time: string;
}) {
  return (
    <div className="bg-white rounded-lg p-4 border border-Color-Tokens-Border-Secondary hover:bg-Color-Tokens-Interaction-Secondary-Hover transition-colors">
      <div className="flex items-center gap-3">
        <img
          src={avatar}
          alt=""
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="text-Color-Tokens-Content-Dark-Primary text-sm font-normal font-['Inter'] leading-tight">
            {title}
          </div>
          <div className="text-Color-Tokens-Content-Dark-Tertiary text-xs font-normal font-['Inter'] leading-none mt-1">
            {subtitle}
          </div>
        </div>
        <div className="text-zinc-500 text-xs font-normal font-['Inter']">
          {time}
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ provider, specialty, date, time, location, type }: {
  provider: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  type: string;
}) {
  return (
    <div className="bg-white rounded-lg p-6 border border-Color-Tokens-Border-Secondary shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-Color-Tokens-Content-Dark-Primary text-lg font-medium font-['Inter'] leading-tight mb-1">
            {provider}
          </div>
          <div className="text-zinc-500 text-sm font-normal font-['Inter'] leading-tight">
            {specialty}
          </div>
        </div>
        <div className="px-3 py-1 bg-blue-50 rounded text-blue-600 text-xs font-medium">
          {type}
        </div>
      </div>
      
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2 text-Color-Tokens-Content-Dark-Tertiary text-sm">
          <span>📅</span>
          <span>{date} at {time}</span>
        </div>
        <div className="flex items-center gap-2 text-Color-Tokens-Content-Dark-Tertiary text-sm">
          <span>📍</span>
          <span>{location}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 bg-Color-Tokens-Interaction-Primary-Base text-white rounded hover:bg-Color-Tokens-Interaction-Primary-Hover transition-colors text-sm font-medium">
          View Details
        </button>
        <button className="px-4 py-2 border border-Color-Tokens-Border-Secondary rounded hover:bg-Color-Tokens-Interaction-Secondary-Hover transition-colors text-sm font-medium">
          Reschedule
        </button>
      </div>
    </div>
  );
}
