"use client"

import * as AvatarPrimitive from "@radix-ui/react-avatar"
import * as React from "react"
import { cn } from "@/lib/utils"

const NexusAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    size?: 'sm' | 'md' | 'lg' | 'xl'
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border-2 border-nexus-border transition-all duration-200 hover:border-nexus-accent-primary/50",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
})
NexusAvatar.displayName = AvatarPrimitive.Root.displayName

const NexusAvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
NexusAvatarImage.displayName = AvatarPrimitive.Image.displayName

const NexusAvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-nexus-accent-primary to-nexus-accent-secondary text-primary-foreground font-semibold text-sm",
      className
    )}
    {...props}
  />
))
NexusAvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { NexusAvatar, NexusAvatarImage, NexusAvatarFallback }