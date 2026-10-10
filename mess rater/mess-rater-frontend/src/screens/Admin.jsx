import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DAYS } from '../lib/constants';
import { fmt } from '../lib/utils';
import MessPicker from '../components/MessPicker';

export default function Admin({ messes, messId, setMessId, tell, fail }) {
  const [tab, setTab] = useState('Performance');
  const [perf, setPerf] = useState([]);
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [actions, setActions] = useState([]);
  const [drafts, setDrafts] = useState({});

  const load = useCallback(async () => {
    const [p, r, s, c, a] = await Promise.all([
      supabase.rpc('admin_performance'),
      supabase.from('meal_reviews').select('*, messes(name)').not('comment', 'is', null).order('created_at', { ascending: false }).limit(30),
      supabase.from('suggestions').select('*, messes(name)').order('created_at', { ascending: false }),
      supabase.from('complaints').select('*, messes(name)').order('created_at', { ascending: false }),
      supabase.from('admin_actions').select('*, messes(name)').order('created_at', { ascending: false }).limit(50)]);
    [p, r, s, c, a].forEach(x => x.error && fail(x.error));
    setPerf(p.data || []); setReviews(r.data || []); setSuggestions(s.data || []); setComplaints(c.data || []); setActions(a.data || []);
  }, [fail]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (messId) supabase.rpc('get_item_stats', { p_mess_id: messId }).then(({ data }) => setItems((data || []).filter(i => i.count_all > 0).sort((a, b) => a.avg_all - b.avg_all).slice(0, 8))); }, [messId]);

  const setSuggestion = async (id, status) => { const { error } = await supabase.rpc('admin_update_suggestion', { p_id: id, p_status: status }); error ? fail(error) : (tell('Suggestion updated'), load()); };
  const saveComplaint = async c => { const d = drafts[c.id] || {}; const { error } = await supabase.rpc('admin_update_complaint', { p_id: c.id, p_status: d.status || c.status, p_note: d.note ?? c.admin_note ?? '' }); error ? fail(error) : (tell('Complaint updated'), load()); };

  return <>
    <header className="app-head compact"><div><h1>Admin panel</h1><p>See how each mess is doing and act on what students report.</p></div></header>
    <div className="request-tabs">{['Performance', 'Ratings & suggestions', 'Complaints', 'Actions'].map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}{t === 'Complaints' && <span>{complaints.filter(c => c.status !== 'resolved').length}</span>}</button>)}</div>

    {tab === 'Performance' && <>
      <section className="settings-card table-wrap"><h2>Hostel performance · last 30 days</h2>
        <table><thead><tr><th>Mess</th><th>Overall</th><th>Food</th><th>Taste</th><th>Hygiene</th><th>Reviews</th><th>Open complaints</th><th>Open suggestions</th></tr></thead>
          <tbody>{perf.map(p => <tr key={p.mess_id}><td>{p.mess_name}</td><td><b>{fmt(p.avg_overall)}</b></td><td>{fmt(p.avg_food)}</td><td>{fmt(p.avg_taste)}</td><td>{fmt(p.avg_hygiene)}</td><td>{p.rating_count}</td><td>{p.open_complaints}</td><td>{p.open_suggestions}</td></tr>)}</tbody></table></section>
      <section className="settings-card"><div className="between"><h2>Lowest-rated dishes</h2><MessPicker {...{ messes, messId, setMessId }} /></div>
        {items.length ? items.map(i => <div className="log-row" key={i.menu_item_id}><div><b>{i.name}</b><p className="muted">{DAYS[i.day_of_week - 1]} · {i.meal}</p></div><span className="score">{fmt(i.avg_all)} · {i.count_all}</span></div>) : <p className="muted">No dish ratings yet.</p>}</section></>}

    {tab === 'Ratings & suggestions' && <>
      <section className="settings-card"><h2>Suggestions</h2>{suggestions.length ? suggestions.map(s => <div className="log-row" key={s.id}><div><b>{s.messes?.name}</b><p>{s.body}</p></div>
        <select value={s.status} onChange={e => setSuggestion(s.id, e.target.value)}>{['open', 'reviewed', 'resolved'].map(o => <option key={o}>{o}</option>)}</select></div>) : <p className="muted">No suggestions yet.</p>}</section>
      <section className="settings-card"><h2>Recent comments with ratings</h2>{reviews.length ? reviews.map(r => <div className="log-row" key={r.id}><div><b>{r.messes?.name} · {r.meal}</b><p>{r.comment}</p></div><span className="score">{fmt((r.food_quality + r.taste_variety + r.hygiene) / 3)}</span></div>) : <p className="muted">No comments yet.</p>}</section></>}

    {tab === 'Complaints' && <section className="settings-card"><h2>Complaints</h2>{complaints.length ? complaints.map(c => <div className="log-row stack-sm" key={c.id}>
      <div><b>{c.messes?.name} · {c.category}</b><p>{c.body}</p></div>
      <div className="row-actions"><select value={drafts[c.id]?.status || c.status} onChange={e => setDrafts(d => ({ ...d, [c.id]: { ...d[c.id], status: e.target.value } }))}>{['open', 'in_progress', 'resolved'].map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}</select>
        <input placeholder="Note to student" value={drafts[c.id]?.note ?? c.admin_note ?? ''} onChange={e => setDrafts(d => ({ ...d, [c.id]: { ...d[c.id], note: e.target.value } }))} />
        <button onClick={() => saveComplaint(c)}>Save</button></div></div>) : <p className="muted">No complaints. Nice.</p>}</section>}

    {tab === 'Actions' && <section className="settings-card"><h2>Action log</h2>{actions.length ? actions.map(a => <div className="log-row" key={a.id}><div><b>{a.kind.replace(':', ' → ')}</b><p className="muted">{a.messes?.name}{a.note ? ` · ${a.note}` : ''}</p></div><small className="muted">{new Date(a.created_at).toLocaleString()}</small></div>) : <p className="muted">Actions you take on complaints and suggestions show up here.</p>}</section>}
  </>;
}
