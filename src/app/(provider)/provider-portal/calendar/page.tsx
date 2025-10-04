'use client';

import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CalendarContainer } from '@/components/calendar/CalendarContainer';
import { Button } from '@/components/nexus-ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/nexus-ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/nexus-ui/card';
import { UserRole } from '@/new-calendar/types/appointment';
import { Calendar, Users, User, Settings } from 'lucide-react';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [currentUserId, setCurrentUserId] = useState('1'); // Default therapist ID
  const [showRoleSelector, setShowRoleSelector] = useState(true);

  // Mock therapist data for role selection
  const therapistOptions = [
    { id: '1', name: 'Dr. Sarah Johnson' },
    { id: '2', name: 'Dr. Michael Chen' },
    { id: '3', name: 'Dr. Emily Rodriguez' },
    { id: '4', name: 'Dr. David Thompson' },
    { id: '5', name: 'Dr. Jessica Williams' },
    { id: '6', name: 'Dr. Robert Martinez' },
    { id: '7', name: 'Dr. Lisa Anderson' },
    { id: '8', name: 'Dr. Mark Taylor' },
  ];

  const handleRoleSelection = () => {
    setShowRoleSelector(false);
  };

  const resetRoleSelection = () => {
    setShowRoleSelector(true);
  };

  if (showRoleSelector) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Wellness Calendar</CardTitle>
            <CardDescription>
              Choose your role to access the calendar system
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Role</label>
              <Select value={userRole} onValueChange={(value: UserRole) => setUserRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <div>
                        <div>Wellness Admin</div>
                        <div className="text-xs text-muted-foreground">
                          View all therapists' calendars
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="therapist">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <div>Individual Therapist</div>
                        <div className="text-xs text-muted-foreground">
                          View your own calendar only
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Therapist Selection (only for therapist role) */}
            {userRole === 'therapist' && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Select Therapist</label>
                <Select value={currentUserId} onValueChange={setCurrentUserId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {therapistOptions.map(therapist => (
                      <SelectItem key={therapist.id} value={therapist.id}>
                        {therapist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Role Description */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                {userRole === 'admin' ? (
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                ) : (
                  <User className="h-5 w-5 text-primary mt-0.5" />
                )}
                <div className="text-sm">
                  {userRole === 'admin' ? (
                    <>
                      <div className="font-medium mb-1">Admin Features:</div>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• View multiple therapists side-by-side</li>
                        <li>• Filter calendars by therapist</li>
                        <li>• Manage all appointments</li>
                        <li>• Day, Week, and Month views</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <div className="font-medium mb-1">Therapist Features:</div>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• View your own calendar only</li>
                        <li>• Book, edit, and delete appointments</li>
                        <li>• Add breaks and lunch sessions</li>
                        <li>• Day, Week, and Month views</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button onClick={handleRoleSelection} className="w-full">
              Access Calendar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-background">
        {/* App Header */}
        <div className="bg-card border-b border-border px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-semibold">Wellness Calendar</h1>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {userRole === 'admin' ? (
                <>
                  <Users className="h-4 w-4" />
                  <span>Admin View</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  <span>
                    {therapistOptions.find(t => t.id === currentUserId)?.name || 'Therapist'}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={resetRoleSelection}>
            <Settings className="h-4 w-4 mr-2" />
            Switch Role
          </Button>
        </div>

        {/* Calendar Content */}
        <div className="flex-1 overflow-hidden">
          <CalendarContainer
            userRole={userRole}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </DndProvider>
  );
}
