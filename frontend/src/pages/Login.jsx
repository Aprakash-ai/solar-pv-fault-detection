import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import './Auth.css'

const ERRORS = {
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/email-already-in-use': 'An account with this email already exists. Sign in instead.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/popup-blocked': 'Your browser blocked the Google window. Allow pop-ups and try again.',
  'auth/account-exists-with-different-credential':
    'This email is registered with a password. Sign in with email instead.',
}

// Closing the Google window is not an error worth showing.
const SILENT = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request']

/* Waveform for the decorative signal monitor. 3 cycles per tile, tiled twice. */
const TILE = 600
const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

function buildTrace(withFault) {
  let d = ''
  for (let x = 0; x <= TILE * 2; x += 4) {
    const t = (x % TILE) / TILE
    const dip = withFault ? smooth(0.5, 0.57, t) - smooth(0.69, 0.76, t) : 0
    const amp = 30 - 27 * dip
    const y = 60 - Math.sin(t * 3 * Math.PI * 2) * amp
    d += `${x === 0 ? 'M' : 'L'}${x},${y.toFixed(2)} `
  }
  return d
}

const TRACE_FAULT = buildTrace(true)
const TRACE_STEADY = buildTrace(false)

function Channel({ label, path, tone }) {
  return (
    <div className="au-chan">
      <span className="au-chan-label">{label}</span>
      <svg viewBox={`0 0 ${TILE} 120`} preserveAspectRatio="none">
        <g className={`au-trace au-trace-${tone}`}>
          <path d={path} className={`au-line au-line-${tone}`} vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"
      />
      <path
        fill="#FBBC05"
        d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
      />
    </svg>
  )
}

export default function Login() {
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const isSignUp = mode === 'signup'

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  const fail = (err) => {
    if (!SILENT.includes(err.code)) {
      setError(ERRORS[err.code] || 'Something went wrong. Please try again.')
    }
    setBusy(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isSignUp) {
        await signUp(name.trim(), email.trim(), password)
      } else {
        await signIn(email.trim(), password)
      }
    } catch (err) {
      fail(err)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      fail(err)
    }
  }

  const switchMode = () => {
    setMode(isSignUp ? 'signin' : 'signup')
    setError('')
  }

  return (
    <div className="au">
      <aside className="au-side">
        <Link to="/" className="au-brand">
          <Logo />
          Aurum
        </Link>

        <div className="au-side-body">
          <h2 className="au-headline">
            Every fault leaves a <span className="au-grad">signature.</span>
          </h2>
          <div className="au-monitor" aria-hidden="true">
            <Channel label="vdc1" path={TRACE_FAULT} tone="a" />
            <Channel label="vdc2" path={TRACE_STEADY} tone="b" />
          </div>
          <p className="au-side-note">
            Breaks in voltage and current are what the model reads to tell five conditions apart.
          </p>
        </div>

        <span className="au-side-foot">XGBoost · 5 conditions · Macro-F1 0.998</span>
      </aside>

      <main className="au-main">
        <form className="au-card" onSubmit={handleSubmit}>
          <div className="au-head" key={mode}>
            <h1 className="au-title">{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
            <p className="au-sub">
              {isSignUp
                ? 'Your predictions are saved to your account.'
                : 'Sign in to run diagnoses and see your history.'}
            </p>
          </div>

          <button type="button" className="btn btn-ghost au-wide" onClick={handleGoogle} disabled={busy}>
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="au-divider">
            <span>or use email</span>
          </div>

          {isSignUp && (
            <label className="au-field au-field-in">
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </label>
          )}

          <label className="au-field">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="au-field">
            Password
            <span className="au-pass">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                minLength={6}
                required
              />
              <button
                type="button"
                className="au-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </span>
          </label>

          {error && (
            <p className="au-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary au-wide" disabled={busy}>
            {busy ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>

          <p className="au-switch">
            {isSignUp ? 'Already have an account?' : 'New here?'}{' '}
            <button type="button" className="au-link" onClick={switchMode}>
              {isSignUp ? 'Sign in' : 'Create an account'}
            </button>
          </p>
        </form>
      </main>
    </div>
  )
}