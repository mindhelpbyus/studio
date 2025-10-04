import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

const nexusAlertVariants = cva(
  "relative w-full rounded-lg border p-4 transition-all duration-200 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-nexus-bg-surface border-nexus-border text-nexus-text-primary [&>svg]:text-nexus-text-secondary",
        info: "bg-nexus-accent-primary/10 border-nexus-accent-primary/20 text-nexus-accent-primary [&>svg]:text-nexus-accent-primary",
        success: "bg-nexus-success/10 border-nexus-success/20 text-nexus-success [&>svg]:text-nexus-success",
        warning: "bg-nexus-warning/10 border-nexus-warning/20 text-nexus-warning [&>svg]:text-nexus-warning",
        error: "bg-nexus-error/10 border-nexus-error/20 text-nexus-error [&>svg]:text-nexus-error",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface NexusAlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof nexusAlertVariants> {}

const NexusAlert = React.forwardRef<HTMLDivElement, NexusAlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(nexusAlertVariants({ variant }), className)}
      {...props}
    />
  )
)
NexusAlert.displayName = "NexusAlert"

const NexusAlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
NexusAlertTitle.displayName = "NexusAlertTitle"

const NexusAlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90 [&_p]:leading-relaxed", className)}
    {...props}
  />
))
NexusAlertDescription.displayName = "NexusAlertDescription"

export { NexusAlert, NexusAlertTitle, NexusAlertDescription }