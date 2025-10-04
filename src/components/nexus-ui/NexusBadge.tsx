import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

const nexusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-nexus-accent-primary/50 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-nexus-accent-primary text-primary-foreground hover:bg-nexus-accent-primary/90 shadow-sm",
        secondary:
          "border-transparent bg-nexus-accent-secondary text-primary-foreground hover:bg-nexus-accent-secondary/90 shadow-sm",
        success:
          "border-transparent bg-nexus-success text-primary-foreground hover:bg-nexus-success/90 shadow-sm",
        warning:
          "border-transparent bg-nexus-warning text-primary-foreground hover:bg-nexus-warning/90 shadow-sm",
        error:
          "border-transparent bg-nexus-error text-primary-foreground hover:bg-nexus-error/90 shadow-sm",
        outline: 
          "border-nexus-border bg-transparent text-nexus-text-primary hover:bg-nexus-bg-elevated",
        ghost:
          "border-transparent bg-nexus-bg-elevated/50 text-nexus-text-secondary hover:bg-nexus-bg-elevated hover:text-nexus-text-primary",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface NexusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof nexusBadgeVariants> {}

function NexusBadge({ className, variant, size, ...props }: NexusBadgeProps) {
  return (
    <div className={cn(nexusBadgeVariants({ variant, size }), className)} {...props} />
  )
}

export { NexusBadge, nexusBadgeVariants }