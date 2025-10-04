"use client"

import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"

export interface NexusCheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  size?: 'sm' | 'md' | 'lg'
}

const NexusCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  NexusCheckboxProps
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const iconSizeClasses = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3', 
    lg: 'h-4 w-4'
  }

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer shrink-0 rounded border-2 border-nexus-border bg-nexus-bg-surface transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nexus-accent-primary/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-nexus-accent-primary data-[state=checked]:border-nexus-accent-primary data-[state=checked]:text-primary-foreground hover:border-nexus-accent-primary/50",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <Check className={iconSizeClasses[size]} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
NexusCheckbox.displayName = CheckboxPrimitive.Root.displayName

export { NexusCheckbox }