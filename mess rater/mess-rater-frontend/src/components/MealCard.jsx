export default function MealCard({ meal, items }) {
  return <article className="meal-card"><h3>{meal}</h3>{items.length ? <ol>{items.map(i => <li key={i.id}>{i.name}</li>)}</ol> : <p className="muted">No menu uploaded.</p>}</article>;
}
