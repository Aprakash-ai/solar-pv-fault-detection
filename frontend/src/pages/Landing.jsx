import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FAULTS, FIELDS, SAMPLES } from '../constants'
import { useReveal } from '../hooks/useReveal'
import './Landing.css'

const BRAND = 'Aurum'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const trackPointer = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--cx', `${event.clientX - rect.left}px`)
  event.currentTarget.style.setProperty('--cy', `${event.clientY - rect.top}px`)
}

const CONDITION_COPY = [
  'Voltage and current match what the sunlight and temperature should produce.',
  'A low-resistance path forms in a string and throws it out of balance with the other.',
  'Added resistance in a string quietly cuts the power it delivers.',
  "A string's circuit is broken: current stops while voltage keeps reading.",
  'Part of the array is shaded, so power drops unevenly across the strings.',
]

const STEPS = [
  {
    title: 'Read six sensors',
    text: 'Voltage and current on both strings, plus irradiance and panel temperature.',
    icon: <path d="M3 12h4l2-6 4 12 2-6h6" />,
  },
  {
    title: 'Derive seven signals',
    text: 'Power per string, total power, the imbalance between strings and power per unit of sunlight are computed from the raw readings.',
    icon: (
      <>
        <rect x="6" y="6" width="12" height="12" rx="2" />
        <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
      </>
    ),
  },
  {
    title: 'Classify with XGBoost',
    text: 'The model returns the most likely condition with a confidence score for each of the five states.',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12.5l3 3 5-6" />
      </>
    ),
  },
]

function Logo() {
  return (
    <svg width="24" height="24" viewBox="0 0 22 22" aria-hidden="true">
      <circle cx="11" cy="11" r="5" fill="#ffb84d" />
      <path
        d="M11 1.5v3M11 17.5v3M1.5 11h3M17.5 11h3M4.3 4.3l2.1 2.1M15.6 15.6l2.1 2.1M4.3 17.7l2.1-2.1M15.6 6.4l2.1-2.1"
        stroke="#ffb84d"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function CountUp({ to, decimals = 0, suffix = '', duration = 1600 }) {
  const ref = useRef(null)
  const reduced = prefersReducedMotion()
  const [value, setValue] = useState(reduced ? to : 0)

  useEffect(() => {
    if (reduced) return
    let frame
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1)
          setValue(to * (1 - Math.pow(1 - t, 3)))
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    observer.observe(ref.current)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [to, duration, reduced])

  return (
    <span ref={ref}>
      {value.toFixed(decimals)}
      {suffix}
    </span>
  )
}

function LiveConsole() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const id = setInterval(() => setIndex((i) => (i + 1) % SAMPLES.length), 3400)
    return () => clearInterval(id)
  }, [])

  const sample = SAMPLES[index]

  return (
    <figure className="lp-console" aria-label="Animated example of a diagnosis">
      <div className="lp-console-bar">
        <span className="lp-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="lp-console-title">diagnosis.live</span>
      </div>

      <div className="lp-console-body">
        <span className="lp-scan" key={`scan-${index}`} aria-hidden="true" />

        <div className="lp-readings" key={`read-${index}`}>
          {FIELDS.map((field) => (
            <div className="lp-reading" key={field.key}>
              <span className="lp-k">{field.key}</span>
              <span className="lp-v">{sample.values[field.key]}</span>
            </div>
          ))}
        </div>

        <ul className="lp-detect">
          {FAULTS.map((fault, i) => (
            <li
              key={fault.name}
              className={i === index ? 'is-on' : ''}
              style={{ '--c': fault.color }}
            >
              <span className="lp-detect-dot" />
              <span className="lp-detect-name">{fault.name}</span>
              <span className="lp-detect-tag">detected</span>
            </li>
          ))}
        </ul>
      </div>

      <figcaption className="lp-console-note">
        Real sample readings from the dataset, cycled for illustration.
      </figcaption>
    </figure>
  )
}

export default function Landing() {
  useReveal()

  return (
    <div className="lp">
      <div className="lp-bg" aria-hidden="true">
        <span className="lp-orb lp-orb-a" />
        <span className="lp-orb lp-orb-b" />
      </div>

      <div className="lp-nav-wrap">
        <nav className="lp-wrap lp-nav" aria-label="Main">
          <Link to="/" className="lp-brand">
            <Logo />
            {BRAND}
          </Link>
          <div className="lp-links">
            <a href="#how">How it works</a>
            <a href="#conditions">Conditions</a>
            <a href="#results">Results</a>
          </div>
          <div className="lp-nav-actions">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Sign in
            </Link>
            <Link to="/login" className="btn btn-primary btn-sm lp-hide-sm">
              Get started
            </Link>
          </div>
        </nav>
      </div>

      <header className="lp-hero" onMouseMove={trackPointer}>
        <div className="lp-wrap lp-hero-grid">
          <div>
            <p className="lp-badge lp-rise" style={{ '--d': '0ms' }}>
              <span className="lp-pulse" />
              XGBoost classifier · Macro-F1 0.998
            </p>
            <h1 className="lp-title lp-rise" style={{ '--d': '100ms' }}>
              Catch <span className="lp-grad">solar faults</span> before they cost you power.
            </h1>
            <p className="lp-lead lp-rise" style={{ '--d': '200ms' }}>
              Enter six sensor readings and get the operating condition of your PV system, with a
              confidence score for each of the five possible states.
            </p>
            <div className="lp-actions lp-rise" style={{ '--d': '300ms' }}>
              <Link to="/login" className="btn btn-primary">
                Start diagnosing
                <Arrow />
              </Link>
              <a href="#how" className="btn btn-ghost">
                See how it works
              </a>
            </div>
          </div>

          <div className="lp-rise lp-console-wrap" style={{ '--d': '420ms' }}>
            <LiveConsole />
          </div>
        </div>
      </header>

      <main>
        <section id="how" className="lp-section">
          <div className="lp-wrap">
            <div className="lp-head reveal">
              <h2 className="lp-h2">From six readings to a verdict</h2>
              <p className="lp-sub">
                Every diagnosis runs the same pipeline you trained and validated, end to end.
              </p>
            </div>

            <div className="lp-flow reveal">
              {STEPS.map((step, i) => (
                <div className="lp-step" key={step.title} style={{ '--i': i + 1 }}>
                  <span className="lp-step-icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {step.icon}
                    </svg>
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="conditions" className="lp-section">
          <div className="lp-wrap">
            <div className="lp-head reveal">
              <h2 className="lp-h2">Five conditions, told apart</h2>
              <p className="lp-sub">What the model looks for, in plain terms.</p>
            </div>

            <div className="lp-bento">
              {FAULTS.map((fault, i) => (
                <article
                  key={fault.name}
                  className={`lp-card reveal ${i < 2 ? 'span-3' : 'span-2'}`}
                  style={{ '--c': fault.color, '--i': i }}
                  onMouseMove={trackPointer}
                >
                  <h3>
                    <span className="lp-card-dot" />
                    {fault.name}
                  </h3>
                  <p>{CONDITION_COPY[i]}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="results" className="lp-section">
          <div className="lp-wrap">
            <div className="lp-metrics reveal">
              <div>
                <strong>
                  <CountUp to={1.37} decimals={2} suffix="M" />
                </strong>
                <span>sensor readings used</span>
              </div>
              <div>
                <strong>
                  <CountUp to={5} />
                </strong>
                <span>operating conditions</span>
              </div>
              <div>
                <strong>
                  <CountUp to={0.998} decimals={3} />
                </strong>
                <span>Macro-F1 on unseen data</span>
              </div>
            </div>
            <p className="lp-note reveal">
              Measured on a held-out 20% of a controlled testbed dataset. The faults in it were
              introduced deliberately, so results on a different plant with noisier sensors may be
              lower.
            </p>
          </div>
        </section>

        <section className="lp-section">
          <div className="lp-wrap">
            <div className="lp-cta reveal">
              <h2 className="lp-h2">Run your first diagnosis</h2>
              <p className="lp-sub">Create a free account and keep a history of every reading.</p>
              <Link to="/login" className="btn btn-primary">
                Get started
                <Arrow />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-row">
          <span>
            © 2026 {BRAND}. Machine-learning fault diagnosis for photovoltaic systems.
          </span>
          <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            Back to top
          </a>
        </div>
      </footer>
    </div>
  )
}