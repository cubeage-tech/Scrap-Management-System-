// Generic, domain-agnostic label + input/select field for simple modal forms.
// Pass `options` (array of strings) to render a <select>; otherwise renders
// an <input> of the given `type`. Knows nothing about what form it's in.

const baseClass =
  "w-full px-3.5 py-2 text-sm bg-surface-muted border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground";

const FormField = ({
  label,
  required = false,
  type = "text",
  value,
  onChange,
  placeholder,
  options,
  uppercase = false,
}) => (
  <div>
    <label className="block text-xs font-semibold text-foreground mb-1">{label}</label>

    {options ? (
      <select value={value} onChange={onChange} className={`${baseClass} cursor-pointer`}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={uppercase ? `${baseClass} uppercase` : baseClass}
      />
    )}
  </div>
);

export default FormField;
