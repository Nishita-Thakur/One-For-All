import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Field } from '../components/Field';

export default function Auth({ mode, setMode, back, continueTo }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  async function handleAuth(event){

    event.preventDefault();
    console.log("SIGNUP CLICKED", email, password);


    const { data, error } = mode === "signup"
      ?
      await supabase.auth.signUp({
        email,
        password
      })
      :
      await supabase.auth.signInWithPassword({
        email,
        password
      });


    if(error){
      console.log(error.message);
      return;
    }


    console.log("AUTH SUCCESS:", data);

    continueTo();

  }


  return (
    <main className="auth-page">

      <section className="auth-card">

        <button className="back-link" onClick={back}>
          ← Back to Roommate Finder
        </button>

        <div className="brand">
          Roommate Finder
        </div>

        <p className="eyebrow">
          THAPAR STUDENT COMMUNITY
        </p>

        <h1>
          {mode === 'signup'
          ? 'Create your account'
          : 'Welcome back'}
        </h1>

        <p>
          {mode === 'signup'
          ? 'Start with your Thapar email. Your complete profile comes next.'
          : 'Sign in to see your matches and conversations.'}
        </p>


        <form onSubmit={handleAuth}>

          <Field
            label="Thapar email"
            value={email}
            onChange={setEmail}
            placeholder="you@thapar.edu"
          />


          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />


          <button className="full">
            {mode === 'signup'
            ? 'Continue to profile →'
            : 'Sign in →'}
          </button>

        </form>


        <div className="auth-switch">

          {mode === 'signup'
          ? 'Already have an account?'
          : 'New to Roommate Finder?'}

          <button
            onClick={() =>
              setMode(mode === 'signup' ? 'signin' : 'signup')
            }
          >
            {mode === 'signup'
            ? 'Sign in'
            : 'Create an account'}
          </button>

        </div>

      </section>

    </main>
  );

}
