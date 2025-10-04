"use client"

import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

const nexusLabelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-nexus-text-primary transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "text-nexus-text-primary",
        secondary: "text-nexus-text-secondary", 
        muted: "text-nexus-text-muted",
        accent: "text-nexus-accent-primary",
        error: "text-nexus-error",
      },
      size: {
        sm: "text-xs",
        md: "text-sm", 
        lg: "text-base",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface NexusLabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof nexusLabelVariants> {}

const NexusLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  NexusLabelProps
>(({ className, variant, size, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(nexusLabelVariants({ variant, size }), className)}
    {...props}
  />
))
NexusLabel.displayName = LabelPrimitive.Root.displayName

export { NexusLabel }