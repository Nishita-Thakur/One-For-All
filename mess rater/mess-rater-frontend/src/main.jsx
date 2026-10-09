import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './lib/supabase';
import './style.css';

const MEALS = ['Breakfast', 'Lunch', 'Dinner'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CATEGORIES = ['Hygiene', 'Food quality', 'Quantity', 'Service', 'Other'];
const CRITERIA = [['food_quality', 'Food quality'], ['taste_variety', 'Taste & variety'], ['hygiene', 'Hygiene & cleanliness']];
const initialTheme = localStorage.getItem('roommate-theme') === 'light' ? 'light' : 'dark';
document.documentElement.dataset.theme = initialTheme;

const istNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
const todayDow = () => istNow().getDay() || 7; // 1 = Monday ... 7 = Sunday
const todayISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
const fmt = n => (n == null ? '–' : Number(n).toFixed(1));

function App() {
  const [session, setSession] = useState(undefined);
  const [screen, setScreen] = useState('home');
  const [theme, setTheme] = useState(initialTheme);
  const [messes, setMesses] = useState([]);
  const [summary, setSummary] = useState({});
  const [messId, setMessId] = useState(localStorage.getItem('mess-id') || '');
  const [menu, setMenu] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const tell = useCallback(msg => { setToast(msg); setTimeout(() => setToast(''), 2400); }, []);
  const fail = useCallback(error => { console.error(error); tell(error.message || 'Something went wrong'); }, [tell]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('roommate-theme', theme); }, [theme]);

  const loadSummary = useCallback(async () => {
    const { data } = await supabase.rpc('get_mess_summary');
    setSummary(Object.fromEntries((data || []).map(r => [r.mess_id, r])));
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data, error } = await supabase.from('messes').select('*').order('name');
      if (error) return fail(error);
      setMesses(data);
      setMessId(id => (data.some(m => m.id === id) ? id : data[0]?.id || ''));
      loadSummary();
      const { data: admin } = await supabase.rpc('is_admin');
      setIsAdmin(!!admin);
    })();
  }, [session, loadSummary]);

  useEffect(() => {
    if (!messId) return;
    localStorage.setItem('mess-id', messId);
    supabase.from('menu_items').select('*').eq('mess_id', messId).order('position').then(({ data, error }) => (error ? fail(error) : setMenu(data)));
  }, [messId]);

  if (session === undefined) return <><TopBar /><main className="center-note">Loading…</main></>;
  if (!session) return <><TopBar /><Auth /></>;

  const mess = messes.find(m => m.id === messId);
  const initials = (session.user.email || 'S')[0].toUpperCase();
  const nav = [['home', '⌂', 'Overview'], ['menu', '☰', 'Menu'], ['rate', '★', 'Rate today'], ['suggest', '✎', 'Suggestions'], ...(isAdmin ? [['admin', '⚙', 'Admin panel']] : [])];
  const props = { messes, messId, setMessId, mess, menu, summary, tell, fail, setScreen };

  return <>
    <TopBar initials={initials} />
    <main className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside>
        <div className="side-heading"><div className="side-brand">Mess Rater</div>
          <button className="collapse-toggle" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">{collapsed ? '›' : '‹'}</button></div>
        <div className="side-nav">{nav.map(([id, icon, label]) => <button key={id} title={label} className={screen === id ? 'active' : ''} onClick={() => setScreen(id)}><b>{icon}</b><span>{label}</span></button>)}</div>
        <div className="side-foot">
          <button className="ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}</button>
          <button className="ghost" onClick={() => supabase.auth.signOut()}>↪ Sign out</button>
        </div>
      </aside>
      <section className="app-content">
        {!messes.length ? <Empty title="No messes set up yet" text="Run supabase/seed.sql, or add a mess from the SQL editor." /> : <>
          {screen === 'home' && <Home {...props} />}
          {screen === 'menu' && <MenuScreen {...props} />}
          {screen === 'rate' && <Rate {...props} reloadSummary={loadSummary} />}
          {screen === 'suggest' && <Suggest {...props} />}
          {screen === 'admin' && isAdmin && <Admin {...props} />}
        </>}
      </section>
      {toast && <div className="toast">✓ {toast}</div>}
    </main>
  </>;
}

function TopBar({ initials }) {
  return <header className="oneforall-bar">
    <img className="oneforall-mark" src="/mlsc-logo.png" alt="MLSC" />
    <nav className="oneforall-nav" aria-label="OneForAll products">
      <a href="#top" className="oneforall-name">ONE FOR ALL</a><a href="#top">Home</a><a href="#top">Roommate Finder</a>
      <a href="#top">Campus Map</a><a href="#top" className="current">Mess</a><a href="#top">SkillSync</a>
    </nav>
    {initials && <div className="topbar-actions"><span className="oneforall-avatar">{initials}</span></div>}
  </header>;
}

function Auth() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const submit = async e => {
    e.preventDefault(); setMsg('');
    const { error } = mode === 'signup' ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(error.message); else if (mode === 'signup') setMsg('Check your inbox to confirm your email, then sign in.');
  };
  return <main className="auth-page"><section className="auth-card">
    <div className="brand">Mess Rater</div>
    <h1>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
    <p className="muted">Use your Thapar email. It's the same account as Roommate Finder.</p>
    <form onSubmit={submit}>
      <Field label="Thapar email" value={email} onChange={setEmail} placeholder="you@thapar.edu" type="email" />
      <Field label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password" />
      {msg && <p className="form-msg">{msg}</p>}
      <button className="full">{mode === 'signup' ? 'Create account' : 'Sign in'}</button>
    </form>
    <div className="auth-switch">{mode === 'signup' ? 'Already have an account?' : 'New here?'}
      <button type="button" className="text-button" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? 'Sign in' : 'Create an account'}</button></div>
  </section></main>;
}

function MessPicker({ messes, messId, setMessId }) {
  return <label className="mess-picker">Mess<select value={messId} onChange={e => setMessId(e.target.value)}>{messes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>;
}

function Home({ messes, messId, setMessId, summary, setScreen }) {
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

function MealCard({ meal, items }) {
  return <article className="meal-card"><h3>{meal}</h3>{items.length ? <ol>{items.map(i => <li key={i.id}>{i.name}</li>)}</ol> : <p className="muted">No menu uploaded.</p>}</article>;
}

function MenuScreen({ messes, messId, setMessId, mess, menu, setScreen }) {
  const [day, setDay] = useState(todayDow());
  const by = (d, m) => menu.filter(i => i.day_of_week === d && i.meal === m);
  return <>
    <header className="app-head compact"><div><h1>{mess?.name} menu</h1><p>Today is {DAYS[todayDow() - 1]}.</p></div><MessPicker {...{ messes, messId, setMessId }} /></header>
    <div className="two-col">
      <section><h2 className="col-title">Today's menu</h2><div className="stack">{MEALS.map(m => <MealCard key={m} meal={m} items={by(todayDow(), m)} />)}</div>
        <button className="full" onClick={() => setScreen('rate')}>Rate today's food</button></section>
      <section><h2 className="col-title">This week</h2>
        <div className="request-tabs">{DAYS.map((d, i) => <button key={d} className={day === i + 1 ? 'active' : ''} onClick={() => setDay(i + 1)}>{d.slice(0, 3)}</button>)}</div>
        <div className="stack">{MEALS.map(m => <MealCard key={m} meal={m} items={by(day, m)} />)}</div></section>
    </div>
  </>;
}

function Stars({ value = 0, onChange, label }) {
  return <div className="stars" role="radiogroup" aria-label={label}>{[1, 2, 3, 4, 5].map(n =>
    <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} className={n <= value ? 'on' : ''} onClick={() => onChange(n)}>★</button>)}</div>;
}

function Rate({ messes, messId, setMessId, mess, menu, tell, fail, reloadSummary }) {
  const [meal, setMeal] = useState(MEALS[0]);
  const [mine, setMine] = useState({});     // menu_item_id -> rating
  const [stats, setStats] = useState({});   // menu_item_id -> stats row
  const [review, setReview] = useState({ food_quality: 0, taste_variety: 0, hygiene: 0, comment: '' });
  const items = useMemo(() => menu.filter(i => i.day_of_week === todayDow() && i.meal === meal), [menu, meal]);

  const loadStats = useCallback(async () => {
    const { data } = await supabase.rpc('get_item_stats', { p_mess_id: messId });
    setStats(Object.fromEntries((data || []).map(r => [r.menu_item_id, r])));
  }, [messId]);
  useEffect(() => { if (messId) loadStats(); }, [messId, loadStats]);
  useEffect(() => {
    if (!messId) return;
    (async () => {
      const [r, v] = await Promise.all([
        supabase.from('item_ratings').select('menu_item_id, rating').eq('rating_date', todayISO()),
        supabase.from('meal_reviews').select('*').eq('mess_id', messId).eq('meal', meal).eq('rating_date', todayISO()).maybeSingle()]);
      setMine(Object.fromEntries((r.data || []).map(x => [x.menu_item_id, x.rating])));
      setReview(v.data ? { ...v.data, comment: v.data.comment || '' } : { food_quality: 0, taste_variety: 0, hygiene: 0, comment: '' });
    })();
  }, [messId, meal]);

  const rateItem = async (item, rating) => {
    const before = mine[item.id];
    setMine(m => ({ ...m, [item.id]: rating }));
    const { error } = await supabase.rpc('submit_item_rating', { p_menu_item_id: item.id, p_rating: rating });
    if (error) { setMine(m => ({ ...m, [item.id]: before })); return fail(error); }
    loadStats();
  };
  const submitReview = async () => {
    if (!review.food_quality || !review.taste_variety || !review.hygiene) return tell('Give all three scores first');
    const { error } = await supabase.rpc('submit_meal_review', { p_mess_id: messId, p_meal: meal, p_food: review.food_quality, p_taste: review.taste_variety, p_hygiene: review.hygiene, p_comment: review.comment });
    if (error) return fail(error);
    tell(`${meal} review saved`); reloadSummary();
  };

  return <>
    <header className="app-head compact"><div><h1>Rate today's food</h1><p>{mess?.name} · {DAYS[todayDow() - 1]}. Ratings are anonymous to other students.</p></div><MessPicker {...{ messes, messId, setMessId }} /></header>
    <div className="request-tabs">{MEALS.map(m => <button key={m} className={meal === m ? 'active' : ''} onClick={() => setMeal(m)}>{m}</button>)}</div>
    {!items.length ? <Empty title={`No ${meal.toLowerCase()} menu for today`} text="Ask an admin to upload this mess's menu." /> : <>
      <section className="settings-card"><h2>Rate a dish</h2>
        {items.map(item => { const s = stats[item.id]; return <div className="rate-row" key={item.id}>
          <div><b>{item.name}</b><small>{s?.count_today ? `Today ${fmt(s.avg_today)} · ${s.count_today} rating${s.count_today > 1 ? 's' : ''}` : 'Be the first to rate this today'}</small></div>
          <Stars value={mine[item.id]} label={`Rate ${item.name}`} onChange={n => rateItem(item, n)} /></div>; })}
      </section>
      <section className="settings-card"><h2>Rate the whole {meal.toLowerCase()}</h2>
        {CRITERIA.map(([key, label]) => <div className="rate-row" key={key}><b>{label}</b><Stars value={review[key]} label={label} onChange={n => setReview(r => ({ ...r, [key]: n }))} /></div>)}
        <Field label="Anything to add? (optional)" textarea value={review.comment} onChange={v => setReview(r => ({ ...r, comment: v.slice(0, 500) }))} />
        <button onClick={submitReview}>Save {meal.toLowerCase()} review</button>
      </section></>}
  </>;
}

function Suggest({ messes, messId, setMessId, mess, tell, fail }) {
  const [kind, setKind] = useState('suggestion');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [body, setBody] = useState('');
  const [history, setHistory] = useState([]);
  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const q = t => supabase.from(t).select('*, messes(name)').eq('user_id', user.id).order('created_at', { ascending: false });
    const [s, c] = await Promise.all([q('suggestions'), q('complaints')]);
    setHistory([...(s.data || []).map(x => ({ ...x, kind: 'Suggestion' })), ...(c.data || []).map(x => ({ ...x, kind: 'Complaint' }))].sort((a, b) => b.created_at.localeCompare(a.created_at)));
  }, []);
  useEffect(() => { load(); }, [load]);
  const submit = async () => {
    if (body.trim().length < 5) return tell('Write at least a few words');
    const { error } = kind === 'suggestion' ? await supabase.from('suggestions').insert({ mess_id: messId, body: body.trim() }) : await supabase.from('complaints').insert({ mess_id: messId, category, body: body.trim() });
    if (error) return fail(error);
    setBody(''); tell(kind === 'suggestion' ? 'Suggestion sent' : 'Complaint sent'); load();
  };
  return <>
    <header className="app-head compact"><div><h1>Suggestions & complaints</h1><p>Goes straight to the mess admin for {mess?.name}.</p></div><MessPicker {...{ messes, messId, setMessId }} /></header>
    <section className="settings-card">
      <div className="request-tabs">{['suggestion', 'complaint'].map(k => <button key={k} className={kind === k ? 'active' : ''} onClick={() => setKind(k)}>{k === 'suggestion' ? 'Make a suggestion' : 'File a complaint'}</button>)}</div>
      {kind === 'complaint' && <Select label="What is it about?" value={category} options={CATEGORIES} onChange={setCategory} />}
      <Field label={kind === 'suggestion' ? 'What would you like to suggest?' : 'What went wrong?'} textarea value={body} onChange={v => setBody(v.slice(0, 1000))} />
      <div className="form-actions"><small className="muted">{body.length}/1000</small><button onClick={submit}>{kind === 'suggestion' ? 'Send suggestion' : 'Send complaint'}</button></div>
    </section>
    <section className="settings-card"><h2>Your submissions</h2>{history.length ? history.map(h => <div className="log-row" key={h.id}>
      <div><b>{h.kind}{h.category ? ` · ${h.category}` : ''} · {h.messes?.name}</b><p>{h.body}</p>{h.admin_note && <p className="note">Admin: {h.admin_note}</p>}</div><span className={`pill ${h.status}`}>{h.status.replace('_', ' ')}</span></div>) : <p className="muted">Nothing sent yet.</p>}</section>
  </>;
}

function Admin({ messes, messId, setMessId, tell, fail }) {
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

function Empty({ title, text }) { return <section className="settings-card empty"><h3>{title}</h3><p className="muted">{text}</p></section>; }
function Field({ label, value, onChange, placeholder = '', type = 'text', textarea }) {
  return <label className="field">{label}{textarea ? <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} /> : <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} required />}</label>;
}
function Select({ label, value, options, onChange }) {
  return <label className="field">{label}<select value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o}>{o}</option>)}</select></label>;
}

createRoot(document.getElementById('root')).render(<App />);
