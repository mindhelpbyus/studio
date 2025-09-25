# Calendar Testing Guide

## Setup Instructions

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm run dev
```
4. Navigate to http://localhost:3000/provider-portal/calendar

## Test Cases

### 1. Calendar View Navigation

- [ ] Verify day view displays correctly
- [ ] Verify week view displays correctly
- [ ] Verify month view displays correctly
- [ ] Check navigation between months using arrows
- [ ] Verify today button returns to current date

### 2. Appointment Creation

- [ ] Click on an empty time slot
- [ ] Fill in appointment details:
  - Patient name
  - Service type
  - Duration
  - Notes (if applicable)
- [ ] Verify appointment appears on calendar
- [ ] Verify color coding matches service type
- [ ] Verify error handling for conflicting appointments

### 3. Appointment Editing

- [ ] Click on existing appointment
- [ ] Modify appointment details
- [ ] Save changes
- [ ] Verify updates reflect on calendar
- [ ] Verify error handling for invalid changes

### 4. Appointment Deletion

- [ ] Click on existing appointment
- [ ] Click delete button
- [ ] Confirm deletion
- [ ] Verify appointment is removed from calendar

### 5. Drag and Drop

- [ ] Drag appointment to new time slot
- [ ] Verify appointment moves successfully
- [ ] Verify error handling for invalid moves
- [ ] Check conflict detection works

### 6. Working Hours

- [ ] Verify appointments can only be created within working hours
- [ ] Verify breaks are displayed correctly
- [ ] Verify drag and drop respects working hours

### 7. Services

- [ ] Verify all service types are available
- [ ] Verify duration is set correctly for each service
- [ ] Verify color coding is consistent

### 8. Error Scenarios

- [ ] Try to create overlapping appointments
- [ ] Try to schedule outside working hours
- [ ] Try to create appointment with missing required fields
- [ ] Verify error messages are clear and helpful

### 9. Responsiveness

- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Verify all functions work across devices

## Running Unit Tests

To run the automated tests:

```bash
npm test
```

### Expected Test Coverage

The test suite covers:
- Calendar rendering
- Appointment CRUD operations
- Conflict detection
- Service management
- Working hours validation

## Reporting Issues

When reporting issues, please include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots if applicable
5. Browser and device information

## Known Limitations

- Calendar view is optimized for desktop use
- Drag and drop might be limited on mobile devices
- Real-time updates require page refresh