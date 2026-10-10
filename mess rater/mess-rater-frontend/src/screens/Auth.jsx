import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Field } from '../components/Field';

export default function Auth() {
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
