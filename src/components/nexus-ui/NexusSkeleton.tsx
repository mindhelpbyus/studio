import { cn } from "@/lib/utils"

export interface NexusSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circular' | 'rectangular'
}

function NexusSkeleton({
  className,
  variant = 'default',
  ...props
}: NexusSkeletonProps) {
  const variantClasses = {
    default: 'rounded-lg',
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none'
  }

  return (
    <div
      className={cn(
        "nexus-animate-pulse bg-nexus-bg-elevated border border-nexus-border/50",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { NexusSkeleton }