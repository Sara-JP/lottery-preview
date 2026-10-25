export function ActiveToggle({
  value,
  onChange,
  label = "وضعیت فعال بودن کمپین",
}: {
  value: boolean
  onChange: (v: boolean) => void
  label?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        value ? "bg-success" : "bg-secondary border border-border"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${
          value ? "right-0.5" : "right-5"
        }`}
      />
    </button>
  )
}
