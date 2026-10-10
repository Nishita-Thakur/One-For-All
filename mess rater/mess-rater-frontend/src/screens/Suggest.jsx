import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../lib/constants';
import MessPicker from '../components/MessPicker';
import { Field, Select } from '../components/Field';

export default function Suggest({ messes, messId, setMessId, mess, tell, fail }) {
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
