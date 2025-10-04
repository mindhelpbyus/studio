import React from 'react';

export interface VentureButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-pill' | 'ghost' | 'destructive-outline' | 'link' | 'primary-shadow';
  size?: 'lg' | 'md' | 'sm' | 'xs';
  iconOnly?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const VentureButton = React.forwardRef<HTMLButtonElement, VentureButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      iconOnly = false,
      leftIcon,
      rightIcon,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseClass = 'venture-btn';
    const variantClass = `venture-btn-${variant}`;
    const sizeClass = iconOnly ? `venture-btn-icon-${size}` : `venture-btn-${size}`;

    const classes = `${baseClass} ${variantClass} ${sizeClass} ${className}`.trim();

    return (
      <button ref={ref} className={classes} {...props}>
        {leftIcon && <span className="venture-icon">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="venture-icon">{rightIcon}</span>}
      </button>
    );
  }
);

VentureButton.displayName = 'VentureButton';

// Example icon component (you can replace with your icon library)
export const PlaceholderIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 16 16">
    <path d="M6.5 8.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
    <path d="M3 3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3z" />
  </svg>
);

// Usage Examples
export const ButtonExamples = () => (
  <div className="space-y-8 p-8">
    {/* Primary Buttons */}
    <div className="space-y-4">
      <h3 className="text-venture-h4 font-medium font-venture text-content-dark-primary">Primary Buttons</h3>
      <div className="flex flex-wrap gap-4">
        <VentureButton size="lg" leftIcon={<PlaceholderIcon />} rightIcon={<PlaceholderIcon />}>
          Large
        </VentureButton>
        <VentureButton size="md" leftIcon={<PlaceholderIcon />} rightIcon={<PlaceholderIcon />}>
          Medium
        </VentureButton>
        <VentureButton size="sm" leftIcon={<PlaceholderIcon />} rightIcon={<PlaceholderIcon />}>
          Small
        </VentureButton>
        <VentureButton size="xs" leftIcon={<PlaceholderIcon />} rightIcon={<PlaceholderIcon />}>
          Extra Small
        </VentureButton>
      </div>
      <div className="flex flex-wrap gap-4">
        <VentureButton size="lg" iconOnly>
          <PlaceholderIcon />
        </VentureButton>
        <VentureButton size="md" iconOnly>
          <PlaceholderIcon />
        </VentureButton>
        <VentureButton size="sm" iconOnly>
          <PlaceholderIcon />
        </VentureButton>
        <VentureButton size="xs" iconOnly>
          <PlaceholderIcon />
        </VentureButton>
      </div>
    </div>

    {/* Secondary Buttons */}
    <div className="space-y-4">
      <h3 className="text-venture-h4 font-medium font-venture text-content-dark-primary">Secondary Buttons</h3>
      <div className="flex flex-wrap gap-4">
        <VentureButton variant="secondary" size="lg" leftIcon={<PlaceholderIcon />}>
          Large
        </VentureButton>
        <VentureButton variant="secondary" size="md" leftIcon={<PlaceholderIcon />}>
          Medium
        </VentureButton>
        <VentureButton variant="secondary" size="sm" leftIcon={<PlaceholderIcon />}>
          Small
        </VentureButton>
      </div>
    </div>

    {/* Outline Buttons */}
    <div className="space-y-4">
      <h3 className="text-venture-h4 font-medium font-venture text-content-dark-primary">Outline Buttons</h3>
      <div className="flex flex-wrap gap-4">
        <VentureButton variant="outline" size="lg" leftIcon={<PlaceholderIcon />}>
          Large
        </VentureButton>
        <VentureButton variant="outline" size="md" leftIcon={<PlaceholderIcon />}>
          Medium
        </VentureButton>
        <VentureButton variant="outline" size="sm" leftIcon={<PlaceholderIcon />}>
          Small
        </VentureButton>
      </div>
    </div>

    {/* Outline Pill Buttons */}
    <div className="space-y-4">
      <h3 className="text-venture-h4 font-medium font-venture text-content-dark-primary">Outline Pill Buttons</h3>
      <div className="flex flex-wrap gap-4">
        <VentureButton variant="outline-pill" size="lg" iconOnly>
          <PlaceholderIcon />
        </VentureButton>
        <VentureButton variant="outline-pill" size="md" iconOnly>
          <PlaceholderIcon />
        </VentureButton>
        <VentureButton variant="outline-pill" size="sm" iconOnly>
          <PlaceholderIcon />
        </VentureButton>
      </div>
    </div>

    {/* Ghost Buttons */}
    <div className="space-y-4">
      <h3 className="text-venture-h4 font-medium font-venture text-content-dark-primary">Ghost Buttons</h3>
      <div className="flex flex-wrap gap-4">
        <VentureButton variant="ghost" size="lg" leftIcon={<PlaceholderIcon />}>
          Large
        </VentureButton>
        <VentureButton variant="ghost" size="md" leftIcon={<PlaceholderIcon />}>
          Medium
        </VentureButton>
        <VentureButton variant="ghost" size="sm" leftIcon={<PlaceholderIcon />}>
          Small
        </VentureButton>
      </div>
    </div>

    {/* Destructive Buttons */}
    <div className="space-y-4">
      <h3 className="text-venture-h4 font-medium font-venture text-content-dark-primary">Destructive Buttons</h3>
      <div className="flex flex-wrap gap-4">
        <VentureButton variant="destructive-outline" size="lg" leftIcon={<PlaceholderIcon />}>
          Delete
        </VentureButton>
        <VentureButton variant="destructive-outline" size="md" leftIcon={<PlaceholderIcon />}>
          Delete
        </VentureButton>
        <VentureButton variant="destructive-outline" size="sm" leftIcon={<PlaceholderIcon />}>
          Delete
        </VentureButton>
      </div>
    </div>

    {/* Link Buttons */}
    <div className="space-y-4">
      <h3 className="text-venture-h4 font-medium font-venture text-content-dark-primary">Link Buttons</h3>
      <div className="flex flex-wrap gap-4">
        <VentureButton variant="link" size="lg">
          Link Large
        </VentureButton>
        <VentureButton variant="link" size="md">
          Link Medium
        </VentureButton>
        <VentureButton variant="link" size="sm">
          Link Small
        </VentureButton>
      </div>
    </div>

    {/* Disabled States */}
    <div className="space-y-4">
      <h3 className="text-venture-h4 font-medium font-venture text-content-dark-primary">Disabled States</h3>
      <div className="flex flex-wrap gap-4">
        <VentureButton disabled leftIcon={<PlaceholderIcon />}>
          Primary Disabled
        </VentureButton>
        <VentureButton variant="secondary" disabled leftIcon={<PlaceholderIcon />}>
          Secondary Disabled
        </VentureButton>
        <VentureButton variant="outline" disabled leftIcon={<PlaceholderIcon />}>
          Outline Disabled
        </VentureButton>
        <VentureButton variant="destructive-outline" disabled leftIcon={<PlaceholderIcon />}>
          Destructive Disabled
        </VentureButton>
      </div>
    </div>
  </div>
);
