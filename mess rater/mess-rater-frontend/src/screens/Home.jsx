import { fmt } from '../lib/utils';

export default function Home({ messes, messId, setMessId, summary, setScreen }) {
  return <>
    <header className="app-head">
      <div><h1>Making Thapar's mess food better, one rating at a time.</h1>
        <p>Rate what you ate today, read how your mess is doing, and tell the committee what to fix.</p></div>
      <ul className="criteria"><li className="criteria-title">You rate each meal on</li>{['Food quality', 'Taste & variety', 'Hygiene & cleanliness', 'Your own words'].map(c => <li key={c}>✓ {c}</li>)}</ul>
    </header>
    <section className="steps">
      {[['Select your mess', 'Pick your mess below. We remember it next time.'], ['Rate your experience', 'Star each dish from today\'s menu, then score the whole meal.'], ['Explore ratings', 'See dish averages and how every mess scored this month.']].map(([t, d], i) =>
        <article key={t}><b>{i + 1}</b><h3>{t}</h3><p>{d}</p></article>)}
    </section>
    <section className="section-head"><div><h2>Select your mess</h2><p>Scores are the average of food quality, taste and hygiene over the last 30 days.</p></div></section>
    <div className="card-grid">{messes.map(m => { const s = summary[m.id]; return <article key={m.id} className={`mess-card ${m.id === messId ? 'selected' : ''}`}>
      <h3>{m.name}</h3><p className="muted">{m.hostels?.join(', ') || 'Mess'}</p>
      <div className="big-score">{fmt(s?.avg_overall)}<small>/ 5 · {s?.rating_count || 0} reviews</small></div>
      <div className="card-actions"><button className="view" onClick={() => { setMessId(m.id); setScreen('menu'); }}>View menu</button>
        <button className="connect" onClick={() => { setMessId(m.id); setScreen('rate'); }}>Rate today</button></div></article>; })}</div>
  </>;
}
