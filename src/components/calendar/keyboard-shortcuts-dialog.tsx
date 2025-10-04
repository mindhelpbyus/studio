import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/nexus-ui';
import { Button } from '@/components/nexus-ui';
import { Keyboard } from 'lucide-react';

interface ShortcutInfo {
  key: string;
  description: string;
}

interface KeyboardShortcutsDialogProps {
  shortcuts: ShortcutInfo[];
}

export function KeyboardShortcutsDialog({ shortcuts }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Keyboard Shortcuts">
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use these keyboard shortcuts to quickly navigate and manage the calendar.
          </p>
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {shortcut.key}
                </span>
                <span className="text-sm text-muted-foreground flex-1 ml-4">
                  {shortcut.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
