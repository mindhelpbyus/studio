'use client';

import { useState } from 'react';
import {
  VentureSelect,
  VentureDetailedSelect,
  VentureDatePicker,
  VentureRadioSelect,
  VentureCheckbox,
} from '@/components/ui/venture-select';
import { VentureHero } from '@/components/ui/venture-hero';
import { VentureContentCard } from '@/components/ui/venture-card';
import { VentureDataTable } from '@/components/ui/venture-table';
import { VentureModal, VentureConfirmModal } from '@/components/ui/venture-modal';

export default function PatientDashboard() {
  const [appointmentProvider, setAppointmentProvider] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [reminderMethod, setReminderMethod] = useState('');
  const [emailReminders, setEmailReminders] = useState(true);
  const [smsReminders, setSmsReminders] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  const providerOptions = [
    {
      value: 'dr-smith',
      label: 'Dr. Sarah Smith',
      description: 'Cardiology • Downtown Medical',
      avatar: 'https://placehold.co/40x40',
    },
    {
      value: 'dr-johnson',
      label: 'Dr. Michael Johnson',
      description: 'Family Medicine • Westside Clinic',
      avatar: 'https://placehold.co/40x40',
    },
    {
      value: 'dr-williams',
      label: 'Dr. Emily Williams',
      description: 'Pediatrics • Eastside Health',
      avatar: 'https://placehold.co/40x40',
    },
  ];

  const timeSlotOptions = [
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
  ];

  const reasonOptions = [
    { value: 'annual', label: 'Annual Physical' },
    { value: 'follow-up', label: 'Follow-up Visit' },
    { value: 'new-issue', label: 'New Health Issue' },
    { value: 'prescription', label: 'Prescription Refill' },
    { value: 'consultation', label: 'Consultation' },
  ];

  const reminderOptions = [
    { value: 'email', label: 'Email Only' },
    { value: 'sms', label: 'SMS Only' },
    { value: 'both', label: 'Email & SMS' },
    { value: 'none', label: 'No Reminders' },
  ];

  const handleBookAppointment = () => {
    console.log('Booking appointment:', {
      appointmentProvider,
      appointmentDate,
      appointmentTime,
      appointmentReason,
      reminderMethod,
      emailReminders,
      smsReminders,
    });
    setShowBookingModal(true);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    setShowCancelModal(true);
  };

  const confirmCancelAppointment = () => {
    console.log('Cancelling appointment:', selectedAppointment);
    setSelectedAppointment(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <VentureHero
        title="Patient Dashboard"
        subtitle="Book Appointment"
        description="Manage your appointments, view your healthcare providers, and access your medical records all in one place. Built with semantic color tokens for consistent theming."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Book Appointment Card */}
            <VentureContentCard>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Book New Appointment
              </h2>

              <div className="space-y-6">
                {/* Provider Selection with Avatar */}
                <VentureDetailedSelect
                  label="Select Provider"
                  placeholder="Choose your provider"
                  options={providerOptions}
                  value={appointmentProvider}
                  onChange={setAppointmentProvider}
                />

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <VentureDatePicker
                    label="Appointment Date"
                    placeholder="Select date"
                    value={appointmentDate}
                    onChange={setAppointmentDate}
                  />

                  <VentureSelect
                    label="Time Slot"
                    placeholder="Select time"
                    options={timeSlotOptions}
                    value={appointmentTime}
                    onChange={setAppointmentTime}
                  />
                </div>

                {/* Reason for Visit */}
                <VentureSelect
                  label="Reason for Visit"
                  placeholder="Select reason"
                  options={reasonOptions}
                  value={appointmentReason}
                  onChange={setAppointmentReason}
                />

                {/* Reminder Preferences */}
                <VentureRadioSelect
                  label="Reminder Preferences"
                  placeholder="Select reminder method"
                  options={reminderOptions}
                  value={reminderMethod}
                  onChange={setReminderMethod}
                />

                {/* Additional Options */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <VentureCheckbox
                    label="Send email confirmation"
                    checked={emailReminders}
                    onChange={setEmailReminders}
                  />
                  <VentureCheckbox
                    label="Send SMS reminder 24 hours before"
                    checked={smsReminders}
                    onChange={setSmsReminders}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleBookAppointment}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors"
                  >
                    Book Appointment
                  </button>
                  <button className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </VentureContentCard>

            {/* Upcoming Appointments */}
            <VentureDataTable
              title="Upcoming Appointments"
              description="Your scheduled appointments"
              columns={[
                { key: 'date', label: 'Date & Time', width: '180px' },
                { key: 'provider', label: 'Provider', width: '200px' },
                { key: 'specialty', label: 'Specialty', width: '150px' },
                { key: 'location', label: 'Location', width: '200px' },
                { key: 'actions', label: 'Actions', width: '150px' },
              ]}
              data={[
                {
                  date: 'Mar 15, 2024 10:00 AM',
                  provider: 'Dr. Sarah Smith',
                  specialty: 'Cardiology',
                  location: 'Downtown Medical',
                  actions: (
                    <div className="flex gap-2">
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        Reschedule
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-700">
                        Cancel
                      </button>
                    </div>
                  ),
                },
                {
                  date: 'Mar 22, 2024 2:00 PM',
                  provider: 'Dr. Michael Johnson',
                  specialty: 'Family Medicine',
                  location: 'Westside Clinic',
                  actions: (
                    <div className="flex gap-2">
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        Reschedule
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-700">
                        Cancel
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <VentureContentCard>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Upcoming Appointments</span>
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Prescriptions</span>
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Results</span>
                  <span className="text-2xl font-bold text-orange-600">1</span>
                </div>
              </div>
            </VentureContentCard>

            {/* Recent Activity */}
            <VentureContentCard>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">Lab Results Available</p>
                  <p className="text-gray-600">2 days ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">Prescription Refilled</p>
                  <p className="text-gray-600">5 days ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">Appointment Completed</p>
                  <p className="text-gray-600">1 week ago</p>
                </div>
              </div>
            </VentureContentCard>

            {/* Quick Actions */}
            <VentureContentCard>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  📋 View Medical Records
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  💊 Request Prescription Refill
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  📧 Message Provider
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  💳 Pay Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <VentureConfirmModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onConfirm={() => console.log('Appointment confirmed')}
        title="Appointment Booked"
        message="Your appointment has been successfully booked. You will receive a confirmation email shortly."
        confirmText="OK"
        cancelText="Close"
        variant="info"
      />

      {/* Cancel Appointment Modal */}
      <VentureConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancelAppointment}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="Keep Appointment"
        variant="danger"
      />
    </div>
  );
}
