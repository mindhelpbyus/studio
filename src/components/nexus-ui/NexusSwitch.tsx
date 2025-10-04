"use client"

import * as SwitchPrimitives from "@radix-ui/react-switch"
import * as React from "react"
import { cn } from "@/lib/utils"

export interface NexusSwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  size?: 'sm' | 'md' | 'lg'
}

const NexusSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  NexusSwitchProps
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: {
      root: 'h-5 w-9',
      thumb: 'h-4 w-4 data-[state=checked]:translate-x-4'
    },
    md: {
      root: 'h-6 w-11', 
      thumb: 'h-5 w-5 data-[state=checked]:translate-x-5'
    },
    lg: {
      root: 'h-7 w-13',
      thumb: 'h-6 w-6 data-[state=checked]:translate-x-6'
    }
  }

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nexus-accent-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-nexus-bg-primary disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-nexus-accent-primary data-[state=unchecked]:bg-nexus-bg-elevated",
        sizeClasses[size].root,
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-primary-foreground shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0",
          sizeClasses[size].thumb
        )}
      />
    </SwitchPrimitives.Root>
  )
})
NexusSwitch.displayName = SwitchPrimitives.Root.displayName

export { NexusSwitch }