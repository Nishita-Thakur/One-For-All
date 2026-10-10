export default function MessPicker({ messes, messId, setMessId }) {
  return <label className="mess-picker">Mess<select value={messId} onChange={e => setMessId(e.target.value)}>{messes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>;
}
