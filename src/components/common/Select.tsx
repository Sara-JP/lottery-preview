export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  label?: string
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  className?: string
  id?: string
}

export function Select({
  label,
  value,
  onChange,
  options,
  className = "",
  id,
}: SelectProps) {
  const selectId = id ?? label
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-muted-foreground"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all appearance-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
