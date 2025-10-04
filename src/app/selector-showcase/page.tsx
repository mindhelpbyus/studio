'use client';

import { useState } from 'react';
import {
  VentureSelect,
  VentureMultiSelect,
  VentureRadioSelect,
  VentureAvatarSelect,
  VentureDetailedSelect,
  VentureDatePicker,
  VentureCheckbox,
  VentureRadio,
} from '@/components/ui/venture-select';
import { VentureHero } from '@/components/ui/venture-hero';
import { VentureCard } from '@/components/ui/venture-card';

export default function SelectorShowcase() {
  const [country, setCountry] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [priority, setPriority] = useState('');
  const [assignedUser, setAssignedUser] = useState('');
  const [department, setDepartment] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('light');

  const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
  ];

  const skillOptions = [
    { value: 'js', label: 'JavaScript' },
    { value: 'ts', label: 'TypeScript' },
    { value: 'react', label: 'React' },
    { value: 'node', label: 'Node.js' },
    { value: 'python', label: 'Python' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const userOptions = [
    {
      value: '1',
      label: 'John Doe',
      description: 'john@example.com',
      avatar: 'https://placehold.co/40x40',
    },
    {
      value: '2',
      label: 'Jane Smith',
      description: 'jane@example.com',
      avatar: 'https://placehold.co/40x40',
    },
    {
      value: '3',
      label: 'Bob Johnson',
      description: 'bob@example.com',
      avatar: 'https://placehold.co/40x40',
    },
  ];

  const departmentOptions = [
    {
      value: 'eng',
      label: 'Engineering',
      description: 'Software development team',
      icon: '⚙️',
    },
    {
      value: 'design',
      label: 'Design',
      description: 'Product design team',
      icon: '🎨',
    },
    {
      value: 'marketing',
      label: 'Marketing',
      description: 'Marketing and growth team',
      icon: '📢',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white">
      <VentureHero
        title="Selector Showcase"
        subtitle="Selector"
        description="Comprehensive showcase of all selector components with all states, variants, and use cases. Built with semantic color tokens for consistent theming across light and dark modes."
      />

      {/* Content Sections */}
      <div className="px-14 pb-14 flex flex-col gap-10">
        {/* Select Section */}
        <VentureCard
          title="Select"
          description="Select allows users to make a single selection or multiple selections from a list of options."
        >
          <div className="p-10 flex flex-col gap-6">
            <VentureSelect
              label="Country"
              placeholder="Select country"
              options={countryOptions}
              value={country}
              onChange={setCountry}
            />

            <VentureSelect
              label="Country (Hover)"
              placeholder="Select country"
              options={countryOptions}
              value={country}
              onChange={setCountry}
            />

            <VentureSelect
              label="Country (With Value)"
              placeholder="Select country"
              options={countryOptions}
              value="us"
              onChange={setCountry}
            />

            <VentureSelect
              label="Country (Disabled)"
              placeholder="Select country"
              options={countryOptions}
              disabled
            />
          </div>
        </VentureCard>

        {/* Date Picker Section */}
        <VentureCard
          title="Date Picker"
          description="A date picker allows the user to select a particular date."
        >
          <div className="p-10 flex flex-col gap-6">
            <VentureDatePicker
              label="Start Date"
              placeholder="Select Date Range"
              value={startDate}
              onChange={setStartDate}
            />

            <VentureDatePicker
              label="Due Date"
              placeholder="Select Date Range"
              value={dueDate}
              onChange={setDueDate}
            />

            <VentureDatePicker
              label="Date (With Value)"
              placeholder="Select Date Range"
              value="2024-01-15"
              onChange={setDueDate}
            />

            <VentureDatePicker
              label="Date (Disabled)"
              placeholder="Select Date Range"
              disabled
            />
          </div>
        </VentureCard>

        {/* Menu / Option Section */}
        <VentureCard
          title="Menu / Option"
          description="Select allows users to make a single selection or multiple selections from a list of options."
        >
          <div className="p-10 flex flex-col gap-6">
            {/* Multi-select with Checkboxes */}
            <VentureMultiSelect
              label="Skills (Multi-select)"
              placeholder="Select skills"
              options={skillOptions}
              value={skills}
              onChange={setSkills}
            />

            {/* Radio Select */}
            <VentureRadioSelect
              label="Priority (Radio)"
              placeholder="Select priority"
              options={priorityOptions}
              value={priority}
              onChange={setPriority}
            />

            {/* Avatar Select */}
            <VentureAvatarSelect
              label="Assign to (Avatar)"
              placeholder="Select user"
              options={userOptions}
              value={assignedUser}
              onChange={setAssignedUser}
            />

            {/* Detailed Select */}
            <VentureDetailedSelect
              label="Department (Detailed)"
              placeholder="Select department"
              options={departmentOptions}
              value={department}
              onChange={setDepartment}
            />

            {/* Standalone Checkboxes */}
            <div className="flex flex-col gap-4 p-6 bg-gray-50 rounded">
              <h3 className="text-sm font-medium text-Color-Tokens-Content-Dark-Primary">
                Checkboxes
              </h3>
              <VentureCheckbox
                label="I agree to the terms and conditions"
                checked={agreeTerms}
                onChange={setAgreeTerms}
              />
              <VentureCheckbox
                label="Enable notifications"
                checked={notifications}
                onChange={setNotifications}
              />
              <VentureCheckbox label="Disabled checkbox" disabled />
            </div>

            {/* Standalone Radio Buttons */}
            <div className="flex flex-col gap-4 p-6 bg-gray-50 rounded">
              <h3 className="text-sm font-medium text-Color-Tokens-Content-Dark-Primary">
                Radio Buttons
              </h3>
              <VentureRadio
                label="Light theme"
                name="theme"
                value="light"
                checked={theme === 'light'}
                onChange={() => setTheme('light')}
              />
              <VentureRadio
                label="Dark theme"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={() => setTheme('dark')}
              />
              <VentureRadio label="Disabled radio" name="theme" disabled />
            </div>
          </div>
        </VentureCard>

        <VenturePageFooter />
      </div>
    </div>
  );
}
