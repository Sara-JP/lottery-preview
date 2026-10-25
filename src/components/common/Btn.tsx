import { forwardRef, type ReactNode } from "react"

export type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "gold"
export type BtnSize = "sm" | "md" | "lg"

export interface BtnProps {
  children: ReactNode
  variant?: BtnVariant
  size?: BtnSize
  onClick?: () => void
  className?: string
  disabled?: boolean
  icon?: string
  type?: "button" | "submit"
}

const VARIANTS: Record<BtnVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 yellow-shadow",
  secondary:
    "bg-secondary text-foreground border border-border hover:bg-secondary/80",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary",
  danger: "bg-danger/15 text-danger border border-danger/25 hover:bg-danger/25",
  gold: "bg-accent text-accent-foreground hover:bg-accent/90 gold-shadow",
}

const SIZES: Record<BtnSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
}

export const Btn = forwardRef<HTMLButtonElement, BtnProps>(function Btn(
  {
    children,
    variant = "primary",
    size = "md",
    onClick,
    className = "",
    disabled = false,
    icon,
    type = "button",
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-base ${VARIANTS[variant]} ${SIZES[size]} ${className} ${
        disabled ? "opacity-40 cursor-not-allowed" : ""
      }`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
})
