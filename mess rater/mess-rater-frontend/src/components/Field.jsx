export function Field({ label, value, onChange, placeholder = '', type = 'text', textarea }) {
  return <label className="field">{label}{textarea ? <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} /> : <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} required />}</label>;
}

export function Select({ label, value, options, onChange }) {
  return <label className="field">{label}<select value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o}>{o}</option>)}</select></label>;
}
