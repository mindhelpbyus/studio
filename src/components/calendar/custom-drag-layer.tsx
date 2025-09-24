'use client';

import React from 'react';
import { useDragLayer } from 'react-dnd';
import { CalendarAppointment } from '@/lib/calendar-types';
import { ItemTypes } from './drag-drop-provider';

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(initialOffset: any, currentOffset: any) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }

  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

interface AppointmentDragPreviewProps {
  appointment: CalendarAppointment;
}

const AppointmentDragPreview: React.FC<AppointmentDragPreviewProps> = ({ appointment }) => {
  return (
    <div className="bg-blue-500 text-white p-2 rounded-lg shadow-lg">
      <p className="font-bold">{appointment.patientName}</p>
      <p>{`${appointment.startTime.toLocaleTimeString()} - ${appointment.endTime.toLocaleTimeString()}`}</p>
    </div>
  );
};

export const CustomDragLayer: React.FC = () => {
  const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  function renderItem() {
    switch (itemType) {
      case ItemTypes.APPOINTMENT:
        return <AppointmentDragPreview appointment={item.appointment} />;
      default:
        return null;
    }
  }

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>{renderItem()}</div>
    </div>
  );
};
