import { useCallback, useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { initialTheme, THEME_KEY } from './lib/theme';
import TopBar from './components/TopBar';
import Empty from './components/Empty';
import Auth from './screens/Auth';
import Home from './screens/Home';
import MenuScreen from './screens/MenuScreen';
import Rate from './screens/Rate';
import Suggest from './screens/Suggest';
import Admin from './screens/Admin';

export default function App() {
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
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem(THEME_KEY, theme); }, [theme]);

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
