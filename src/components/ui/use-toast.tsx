import * as React from 'react';
import { ToastAction } from '@radix-ui/react-toast';
import { useToast as useRadixToast } from '@/hooks/use-toast';

type ToastActionElement = React.ReactElement<typeof ToastAction>;


interface ToastProps {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: 'default' | 'destructive';
}

export function toast({ title, description, action, variant = 'default' }: ToastProps) {
  const { toast } = useRadixToast();
  const toastProps: any = { title, description, variant };
  if (action) toastProps.action = action;
  return toast(toastProps);
}