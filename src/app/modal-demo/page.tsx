'use client';

import { useState } from 'react';
import { VentureHero } from '@/components/ui/venture-hero';
import { VentureModal, VentureConfirmModal } from '@/components/ui/venture-modal';
import { VentureContentCard } from '@/components/ui/venture-card';
import { VentureSelect, VentureDatePicker } from '@/components/ui/venture-select';

export default function ModalDemo() {
  const [basicModal, setBasicModal] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [dangerModal, setDangerModal] = useState(false);
  const [largeModal, setLargeModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    category: '',
  });

  return (
    <div className="min-h-screen bg-white">
      <VentureHero
        title="Modal Demo"
        subtitle="Modal Components"
        description="Modal dialogs for displaying content, forms, and confirmations with backdrop overlay and keyboard support. Built with semantic color tokens for consistent theming."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Modal */}
          <VentureContentCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Modal</h3>
            <p className="text-sm text-gray-600 mb-4">
              Simple modal with title, content, and close button
            </p>
            <button
              onClick={() => setBasicModal(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Open Basic Modal
            </button>
          </VentureContentCard>

          {/* Form Modal */}
          <VentureContentCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Modal</h3>
            <p className="text-sm text-gray-600 mb-4">
              Modal with form inputs and action buttons
            </p>
            <button
              onClick={() => setFormModal(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Open Form Modal
            </button>
          </VentureContentCard>

          {/* Confirm Modal */}
          <VentureContentCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Modal</h3>
            <p className="text-sm text-gray-600 mb-4">
              Confirmation dialog with cancel and confirm actions
            </p>
            <button
              onClick={() => setConfirmModal(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Open Confirm Modal
            </button>
          </VentureContentCard>

          {/* Danger Modal */}
          <VentureContentCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Modal</h3>
            <p className="text-sm text-gray-600 mb-4">
              Destructive action confirmation with red button
            </p>
            <button
              onClick={() => setDangerModal(true)}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Open Danger Modal
            </button>
          </VentureContentCard>

          {/* Large Modal */}
          <VentureContentCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Large Modal</h3>
            <p className="text-sm text-gray-600 mb-4">
              Extra large modal for detailed content
            </p>
            <button
              onClick={() => setLargeModal(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Open Large Modal
            </button>
          </VentureContentCard>
        </div>
      </div>

      {/* Basic Modal */}
      <VentureModal
        isOpen={basicModal}
        onClose={() => setBasicModal(false)}
        title="Basic Modal"
        footer={
          <button
            onClick={() => setBasicModal(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-Color-Tokens-Content-Dark-Primary text-sm">
            This is a basic modal dialog. It can contain any content you need to display to the
            user.
          </p>
          <p className="text-Color-Tokens-Content-Dark-Secondary text-sm">
            Click the close button, press Escape, or click outside the modal to close it.
          </p>
        </div>
      </VentureModal>

      {/* Form Modal */}
      <VentureModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title="Create New Record"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setFormModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                console.log('Form submitted:', formData);
                setFormModal(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
            />
          </div>

          <VentureSelect
            label="Category"
            placeholder="Select category"
            options={[
              { value: 'medical', label: 'Medical' },
              { value: 'administrative', label: 'Administrative' },
              { value: 'billing', label: 'Billing' },
            ]}
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value })}
          />

          <VentureDatePicker
            label="Date"
            placeholder="Select date"
            value={formData.date}
            onChange={(value) => setFormData({ ...formData, date: value })}
          />
        </div>
      </VentureModal>

      {/* Confirm Modal */}
      <VentureConfirmModal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={() => console.log('Confirmed!')}
        title="Confirm Action"
        message="Are you sure you want to proceed with this action? This will update the record."
        confirmText="Yes, Proceed"
        cancelText="Cancel"
        variant="info"
      />

      {/* Danger Modal */}
      <VentureConfirmModal
        isOpen={dangerModal}
        onClose={() => setDangerModal(false)}
        onConfirm={() => console.log('Deleted!')}
        title="Delete Record"
        message="Are you sure you want to delete this record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Large Modal */}
      <VentureModal
        isOpen={largeModal}
        onClose={() => setLargeModal(false)}
        title="Patient Medical History"
        size="xl"
        footer={
          <button
            onClick={() => setLargeModal(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        }
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical History</h3>
            <p className="text-sm text-gray-600 mb-4">
              Complete medical history and records for the patient.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium text-gray-900 mb-2">Allergies</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Penicillin - Severe reaction</li>
                <li>Peanuts - Anaphylaxis</li>
                <li>Latex - Mild reaction</li>
              </ul>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium text-gray-900 mb-2">Current Medications</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Lisinopril 10mg - Once daily</li>
                <li>Metformin 500mg - Twice daily</li>
                <li>Atorvastatin 20mg - Once daily</li>
              </ul>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium text-gray-900 mb-2">Past Surgeries</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Appendectomy - 2015</li>
                <li>Knee arthroscopy - 2018</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Chronic Conditions</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Hypertension - Controlled</li>
                <li>Type 2 Diabetes - Managed</li>
                <li>High Cholesterol - Treated</li>
              </ul>
            </div>
          </div>
        </div>
      </VentureModal>
    </div>
  );
}
