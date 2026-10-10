export function Field({ label, value, onChange, placeholder = '', type = 'text', textarea }) { return <label className="field">{label}{textarea ? <textarea value={value ?? ""} onChange={event => onChange(event.target.value)} placeholder={placeholder} /> : <input type={type} value={value ?? ""} onChange={event => onChange(event.target.value)} placeholder={placeholder} />}</label>; }

export function Select({ label, value, options, onChange }) {
  return (
    <label className="field">
      {label}

      <select
    value={value || ""}
    onChange={(e) => {
        console.log(label, e.target.value);
        onChange(e.target.value);
    }}
>
    <option value="">Select...</option>

    {options.map(option => (
        <option key={option} value={option}>
            {option}
        </option>
    ))}
</select>

    </label>
  );
}
