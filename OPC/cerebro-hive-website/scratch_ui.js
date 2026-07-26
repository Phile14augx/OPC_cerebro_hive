const fs = require('fs');
const path = require('path');

const uiSrcDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages', 'ui', 'src');

const primitivesDir = path.join(uiSrcDir, 'primitives');
const layoutsDir = path.join(uiSrcDir, 'layouts');
fs.mkdirSync(primitivesDir, { recursive: true });
fs.mkdirSync(layoutsDir, { recursive: true });

// Ensure cva is in package.json for @cerebro/ui
const packageJsonPath = path.join(uiSrcDir, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (!pkg.dependencies) pkg.dependencies = {};
pkg.dependencies['class-variance-authority'] = '^0.7.0';
pkg.dependencies['clsx'] = '^2.0.0';
pkg.dependencies['tailwind-merge'] = '^2.0.0';
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));

// Utils
fs.mkdirSync(path.join(uiSrcDir, 'utils'), { recursive: true });
fs.writeFileSync(path.join(uiSrcDir, 'utils', 'cn.ts'), `
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`);

// 1. Button
const buttonDir = path.join(primitivesDir, 'Button');
fs.mkdirSync(buttonDir, { recursive: true });
fs.writeFileSync(path.join(buttonDir, 'Button.tsx'), `
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[var(--radius-md)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-border-focus)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-bg-primary)] text-white hover:bg-[var(--color-bg-primary)]/90",
        outline: "border border-[var(--color-border-default)] bg-transparent hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-primary)]",
        ghost: "hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-primary)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? (props.children as any).type : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
`);

// 2. Card / Surface
const cardDir = path.join(primitivesDir, 'Card');
fs.mkdirSync(cardDir, { recursive: true });
fs.writeFileSync(path.join(cardDir, 'Card.tsx'), `
import * as React from "react"
import { cn } from "../../utils/cn"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]", className)} {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
`);

// 3. Badge
const badgeDir = path.join(primitivesDir, 'Badge');
fs.mkdirSync(badgeDir, { recursive: true });
fs.writeFileSync(path.join(badgeDir, 'Badge.tsx'), `
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/cn"

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-bg-primary)] text-white",
        secondary:
          "border-transparent bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]",
        destructive:
          "border-transparent bg-[var(--color-text-danger)] text-white",
        outline: "text-[var(--color-text-primary)] border-[var(--color-border-default)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
`);

// 4. Skeleton
const skeletonDir = path.join(primitivesDir, 'Skeleton');
fs.mkdirSync(skeletonDir, { recursive: true });
fs.writeFileSync(path.join(skeletonDir, 'Skeleton.tsx'), `
import { cn } from "../../utils/cn"

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[var(--color-surface-raised)]", className)}
      {...props}
    />
  )
}
`);

// 5. Spinner
const spinnerDir = path.join(primitivesDir, 'Spinner');
fs.mkdirSync(spinnerDir, { recursive: true });
fs.writeFileSync(path.join(spinnerDir, 'Spinner.tsx'), `
import { cn } from "../../utils/cn"
import { Loader2 } from "lucide-react"

export function Spinner({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <Loader2 className={cn("h-4 w-4 animate-spin text-[var(--color-text-muted)]", className)} {...props} />
  )
}
`);

// 6. EmptyState
const emptyStateDir = path.join(primitivesDir, 'EmptyState');
fs.mkdirSync(emptyStateDir, { recursive: true });
fs.writeFileSync(path.join(emptyStateDir, 'EmptyState.tsx'), `
import React from 'react';
import { cn } from "../../utils/cn"

export function EmptyState({ 
  title, 
  description, 
  icon,
  className 
}: { 
  title: string; 
  description: string; 
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      {icon && <div className="mb-4 text-[var(--color-text-muted)]">{icon}</div>}
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-sm">{description}</p>
    </div>
  )
}
`);

// Index export
fs.writeFileSync(path.join(uiSrcDir, 'index.ts'), `
export * from './primitives/Button/Button';
export * from './primitives/Card/Card';
export * from './primitives/Badge/Badge';
export * from './primitives/Skeleton/Skeleton';
export * from './primitives/Spinner/Spinner';
export * from './primitives/EmptyState/EmptyState';
`);

console.log('UI Primitives generated');
