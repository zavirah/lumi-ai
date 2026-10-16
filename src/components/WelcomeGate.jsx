import { useEffect, useState } from "react";
import { LuArrowRight, LuLockKeyhole, LuMail, LuSparkles } from "react-icons/lu";
import { supabase, supabaseConfigured } from "../lib/supabase";
import "./WelcomeGate.css";

export function WelcomeGate({ children }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!supabaseConfigured) {
      const timer = window.setTimeout(() => alive && setReady(true), 950);
      return () => { alive = false; window.clearTimeout(timer); };
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      window.setTimeout(() => alive && setReady(true), 700);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setMessage("");
    const result = mode === "signup"
      ? await supabase.auth.signUp({ email, password, options: { data: { full_name: name.trim() } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) { setMessage(result.error.message); return; }
    if (mode === "signup" && !result.data.session) setMessage("Check your email to confirm your account, then sign in here.");
  };

  if (!ready) return <div className="lumi-splash" aria-label="Loading LumiAI"><div className="splash-mark"><LuSparkles /></div><strong>Lumi<span>AI</span></strong><div className="splash-loader" /><p>A little light for your next step</p></div>;
  if (!supabaseConfigured) return <div className="setup-screen"><div className="auth-brand"><span className="brand-mark"><LuSparkles /></span><span>Lumi<strong>AI</strong></span></div><section className="auth-card setup-card"><div className="auth-kicker">ONE QUICK SETUP</div><h1>Give Lumi a home for your chats.</h1><p>Sign-up and private conversation history need a Supabase project. Add its Project URL and publishable key to the app’s environment, then this welcome screen will let people create accounts and sign in.</p><div className="setup-note"><LuLockKeyhole /><span>Use only the public publishable key in the website. Keep secret keys on the server.</span></div><p className="setup-help">The database setup is included in <code>supabase/schema.sql</code>.</p></section></div>;
  if (!session) return <div className="auth-screen"><div className="auth-brand"><span className="brand-mark"><LuSparkles /></span><span>Lumi<strong>AI</strong></span></div><div className="auth-layout"><div className="auth-story"><div className="auth-kicker">YOUR SPACE TO LEARN &amp; BE HEARD</div><h1>A thoughtful companion, ready when you are.</h1><p>Your conversations stay here, so Lumi can follow along and meet you where you are.</p><div className="auth-quote">“One small step is still a step forward.”</div></div><section className="auth-card"><div className="auth-kicker">{mode === "signup" ? "START YOUR SPACE" : "WELCOME BACK"}</div><h2>{mode === "signup" ? "Create your account" : "Sign in to Lumi"}</h2><p className="auth-subtitle">{mode === "signup" ? "Your chats and learning progress, all in one place." : "Pick up right where your last conversation ended."}</p><form onSubmit={submit}>{mode === "signup" && <label>Your name<input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="What should Lumi call you?" required /></label>}<label>Email address<span className="auth-input"><LuMail /><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></span></label><label>Password<span className="auth-input"><LuLockKeyhole /><input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required /></span></label>{message && <p className="auth-message" role="status">{message}</p>}<button className="auth-submit" disabled={busy}>{busy ? "One moment…" : mode === "signup" ? "Create account" : "Sign in"}<LuArrowRight /></button></form><p className="auth-switch">{mode === "signup" ? "Already have an account?" : "New to Lumi?"} <button onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setMessage(""); }}>{mode === "signup" ? "Sign in" : "Create an account"}</button></p><p className="auth-privacy">Your account secures your own conversations.</p></section></div></div>;

  return <>{children({ session, signOut: () => supabase.auth.signOut() })}</>;
}
