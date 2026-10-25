export interface InputProps {
  label?: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  hint?: string
  className?: string
  error?: string
  required?: boolean
  disabled?: boolean
  id?: string
}

export function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  hint,
  className = "",
  error,
  required,
  disabled,
  id,
}: InputProps) {
  const inputId = id ?? label
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-muted-foreground"
        >
          {label}
          {required && <span className="text-danger mr-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`w-full px-4 py-2.5 rounded-xl bg-secondary border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? "border-danger focus:border-danger focus:ring-danger/30"
            : "border-border focus:border-primary/50 focus:ring-primary/30"
        }`}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
