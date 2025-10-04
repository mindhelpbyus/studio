"use client"

import * as SeparatorPrimitive from "@radix-ui/react-separator"
import * as React from "react"
import { cn } from "@/lib/utils"

export interface NexusSeparatorProps extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  variant?: 'default' | 'dashed' | 'dotted' | 'gradient'
}

const NexusSeparator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  NexusSeparatorProps
>(
  (
    { className, orientation = "horizontal", decorative = true, variant = 'default', ...props },
    ref
  ) => {
    const variantClasses = {
      default: 'bg-nexus-border',
      dashed: 'border-dashed border-t border-nexus-border bg-transparent',
      dotted: 'border-dotted border-t border-nexus-border bg-transparent', 
      gradient: 'bg-gradient-to-r from-transparent via-nexus-accent-primary to-transparent'
    }

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0 transition-colors duration-200",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    )
  }
)
NexusSeparator.displayName = SeparatorPrimitive.Root.displayName

export { NexusSeparator }