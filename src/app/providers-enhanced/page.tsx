'use client';

import { useState } from 'react';
import {
  VentureSelect,
  VentureMultiSelect,
  VentureRadioSelect,
  VentureDatePicker,
  VentureCheckbox,
} from '@/components/ui/venture-select';
import { VentureHero } from '@/components/ui/venture-hero';
import { VentureContentCard } from '@/components/ui/venture-card';
import { VentureDataTable } from '@/components/ui/venture-table';
import { VentureModal } from '@/components/ui/venture-modal';

export default function ProvidersEnhancedPage() {
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [insurance, setInsurance] = useState<string[]>([]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [acceptingNewPatients, setAcceptingNewPatients] = useState(false);
  const [telehealth, setTelehealth] = useState(false);

  const specialtyOptions = [
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'family-medicine', label: 'Family Medicine' },
    { value: 'internal-medicine', label: 'Internal Medicine' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'psychiatry', label: 'Psychiatry' },
    { value: 'orthopedics', label: 'Orthopedics' },
  ];

  const locationOptions = [
    { value: 'downtown', label: 'Downtown Medical Center' },
    { value: 'westside', label: 'Westside Clinic' },
    { value: 'eastside', label: 'Eastside Health Center' },
    { value: 'northside', label: 'Northside Hospital' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ar', label: 'Arabic' },
  ];

  const insuranceOptions = [
    { value: 'blue-cross', label: 'Blue Cross Blue Shield' },
    { value: 'aetna', label: 'Aetna' },
    { value: 'cigna', label: 'Cigna' },
    { value: 'united', label: 'UnitedHealthcare' },
    { value: 'medicare', label: 'Medicare' },
    { value: 'medicaid', label: 'Medicaid' },
  ];

  const appointmentTypeOptions = [
    { value: 'new-patient', label: 'New Patient Visit' },
    { value: 'follow-up', label: 'Follow-up Visit' },
    { value: 'annual-physical', label: 'Annual Physical' },
    { value: 'consultation', label: 'Consultation' },
  ];

  const handleSearch = () => {
    console.log('Search filters:', {
      specialty,
      location,
      languages,
      insurance,
      appointmentDate,
      appointmentType,
      acceptingNewPatients,
      telehealth,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <VentureHero
        title="Provider Search"
        subtitle="Find a Provider"
        description="Search and filter healthcare providers by specialty, location, insurance, and availability. Book appointments with providers that match your needs."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <VentureContentCard className="sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Search Filters</h2>

              <div className="space-y-6">
                {/* Specialty */}
                <VentureSelect
                  label="Specialty"
                  placeholder="Select specialty"
                  options={specialtyOptions}
                  value={specialty}
                  onChange={setSpecialty}
                />

                {/* Location */}
                <VentureSelect
                  label="Location"
                  placeholder="Select location"
                  options={locationOptions}
                  value={location}
                  onChange={setLocation}
                />

                {/* Languages */}
                <VentureMultiSelect
                  label="Languages Spoken"
                  placeholder="Select languages"
                  options={languageOptions}
                  value={languages}
                  onChange={setLanguages}
                />

                {/* Insurance */}
                <VentureMultiSelect
                  label="Insurance Accepted"
                  placeholder="Select insurance"
                  options={insuranceOptions}
                  value={insurance}
                  onChange={setInsurance}
                />

                {/* Appointment Date */}
                <VentureDatePicker
                  label="Preferred Appointment Date"
                  placeholder="Select date"
                  value={appointmentDate}
                  onChange={setAppointmentDate}
                />

                {/* Appointment Type */}
                <VentureRadioSelect
                  label="Appointment Type"
                  placeholder="Select type"
                  options={appointmentTypeOptions}
                  value={appointmentType}
                  onChange={setAppointmentType}
                />

                {/* Additional Filters */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <VentureCheckbox
                    label="Accepting new patients"
                    checked={acceptingNewPatients}
                    onChange={setAcceptingNewPatients}
                  />
                  <VentureCheckbox
                    label="Telehealth available"
                    checked={telehealth}
                    onChange={setTelehealth}
                  />
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors"
                >
                  Search Providers
                </button>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSpecialty('');
                    setLocation('');
                    setLanguages([]);
                    setInsurance([]);
                    setAppointmentDate('');
                    setAppointmentType('');
                    setAcceptingNewPatients(false);
                    setTelehealth(false);
                  }}
                  className="w-full text-gray-600 py-2 px-4 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </VentureContentCard>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-2">
            <VentureContentCard>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Available Providers
                </h2>
                <span className="text-sm text-gray-600">24 providers found</span>
              </div>

              {/* Provider Table */}
              <VentureDataTable
                title="Available Providers"
                description="24 providers found"
                columns={[
                  { key: 'name', label: 'Provider', width: '250px' },
                  { key: 'specialty', label: 'Specialty', width: '150px' },
                  { key: 'location', label: 'Location', width: '200px' },
                  { key: 'languages', label: 'Languages', width: '150px' },
                  { key: 'availability', label: 'Availability', width: '180px' },
                  { key: 'actions', label: '', width: '150px' },
                ]}
                data={[
                  {
                    name: 'Dr. Sarah Johnson',
                    specialty: 'Cardiology',
                    location: 'Downtown Medical Center',
                    languages: 'English, Spanish',
                    availability: (
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New Patients
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Telehealth
                        </span>
                      </div>
                    ),
                    actions: (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                        Book
                      </button>
                    ),
                  },
                  {
                    name: 'Dr. Michael Chen',
                    specialty: 'Family Medicine',
                    location: 'Westside Clinic',
                    languages: 'English, Chinese',
                    availability: (
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New Patients
                        </span>
                      </div>
                    ),
                    actions: (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                        Book
                      </button>
                    ),
                  },
                  {
                    name: 'Dr. Emily Williams',
                    specialty: 'Pediatrics',
                    location: 'Eastside Health Center',
                    languages: 'English, French',
                    availability: (
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Telehealth
                        </span>
                      </div>
                    ),
                    actions: (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                        Book
                      </button>
                    ),
                  },
                  {
                    name: 'Dr. James Rodriguez',
                    specialty: 'Orthopedics',
                    location: 'Northside Hospital',
                    languages: 'English, Spanish',
                    availability: (
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New Patients
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Telehealth
                        </span>
                      </div>
                    ),
                    actions: (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                        Book
                      </button>
                    ),
                  },
                ]}
              />

              {/* Pagination */}
              <div className="mt-8 flex justify-center">
                <nav className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
                    1
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    3
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    Next
                  </button>
                </nav>
              </div>
            </VentureContentCard>
          </div>
        </div>
      </div>
    </div>
  );
}
