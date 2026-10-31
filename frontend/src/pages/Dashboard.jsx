import { useState } from 'react'
import { Link } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useHistory } from '../hooks/useHistory'
import { predict } from '../api'
import Logo from '../components/Logo'
import { EMPTY_READING, FAULTS, FIELDS, SAMPLES } from '../constants'
import './Dashboard.css'

const AXIS = '#8d97b8'
const RING_R = 52
const RING_C = 2 * Math.PI * RING_R

const formatTime = (date) =>
  date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

function TimelineDot({ cx, cy, payload }) {
  if (cx == null || cy == null) return null
  const color = FAULTS[payload.classIndex].color
  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={color}
      stroke="#06080f"
      strokeWidth={2}
      style={{ filter: `drop-shadow(0 0 6px ${color})` }}
    />
  )
}

function TimelineTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="dash-tip">
      <strong>
        <span className="dash-pip" style={{ background: FAULTS[point.classIndex].color }} />
        {point.label}
      </strong>
      <span>{(point.confidence * 100).toFixed(1)}% confidence</span>
      <span>{formatTime(point.createdAt)}</span>
    </div>
  )
}

export default function Dashboard() {
  const { user, logOut } = useAuth()
  const { items, loading: historyLoading, error: historyError } = useHistory(user.uid)

  const [values, setValues] = useState(EMPTY_READING)
  const [result, setResult] = useState(null)
  const [runId, setRunId] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const firstName = (user.displayName || user.email.split('@')[0]).split(' ')[0]
  const setValue = (key, value) => setValues((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)

    const reading = Object.fromEntries(FIELDS.map((f) => [f.key, Number(values[f.key])]))

    let prediction
    try {
      prediction = await predict(reading)
    } catch (err) {
      console.error(err)
      setError('Could not reach the diagnosis service. Make sure the backend is running.')
      setBusy(false)
      return
    }

    setResult(prediction)
    setRunId((n) => n + 1)

    try {
      await addDoc(collection(db, 'users', user.uid, 'predictions'), {
        inputs: reading,
        classIndex: prediction.predicted_class,
        label: prediction.predicted_label,
        confidence: prediction.confidence,
        probabilities: prediction.probabilities,
        createdAt: serverTimestamp(),
      })
    } catch {
      setNotice('Diagnosis done, but it could not be saved to your history.')
    }
    setBusy(false)
  }

  const chartData = items.slice(0, 20).reverse().map((item) => ({
    ...item,
    time: formatTime(item.createdAt),
  }))

  const counts = FAULTS.map((_, i) => items.filter((item) => item.classIndex === i).length)
  const accent = result ? FAULTS[result.predicted_class].color : undefined

  return (
    <div className="dash">
      <header className="dash-bar">
        <div className="dash-wrap dash-bar-inner">
          <Link to="/" className="dash-brand">
            <Logo />
            Aurum
          </Link>
          <div className="dash-user">
            <span className="dash-avatar" aria-hidden="true">
              {firstName[0].toUpperCase()}
            </span>
            <span className="dash-name">{user.displayName || user.email}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={logOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="dash-wrap dash-main">
        <div className="dash-hello">
          <h1>Welcome, {firstName}</h1>
          <p>Run a diagnosis or review how your array has been doing.</p>
        </div>

        <div className="dash-top">
          <form className="dash-panel" onSubmit={handleSubmit}>
            <h2 className="dash-h2">New diagnosis</h2>

            <div className="dash-samples">
              <span>Load a sample</span>
              {SAMPLES.map((sample, i) => (
                <button
                  type="button"
                  key={sample.name}
                  className="dash-chip"
                  onClick={() => setValues(sample.values)}
                >
                  <span className="dash-pip" style={{ background: FAULTS[i].color }} />
                  {sample.name}
                </button>
              ))}
            </div>

            <div className="dash-fields">
              {FIELDS.map((field) => (
                <label key={field.key} className="dash-field">
                  <span>
                    {field.label} <em>{field.hint}</em>
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={values[field.key]}
                    onChange={(e) => setValue(field.key, e.target.value)}
                    required
                  />
                </label>
              ))}
            </div>

            <button type="submit" className="btn btn-primary dash-run" disabled={busy}>
              {busy && <span className="dash-spinner" aria-hidden="true" />}
              {busy ? 'Analysing…' : 'Run diagnosis'}
            </button>

            {error && (
              <p className="dash-error" role="alert">
                {error}
              </p>
            )}
          </form>

          <section
            className={`dash-panel dash-result ${result ? 'has-result' : ''}`}
            style={accent ? { '--c': accent } : undefined}
            aria-live="polite"
          >
            <h2 className="dash-h2">Result</h2>

            {result ? (
              <div className="dash-result-body" key={runId}>
                <div className="dash-verdict-row">
                  <div className="dash-ring">
                    <svg viewBox="0 0 132 132" aria-hidden="true">
                      <circle className="dash-ring-track" cx="66" cy="66" r={RING_R} />
                      <circle
                        className="dash-ring-fill"
                        cx="66"
                        cy="66"
                        r={RING_R}
                        transform="rotate(-90 66 66)"
                        strokeDasharray={RING_C}
                        strokeDashoffset={RING_C * (1 - result.confidence)}
                      />
                    </svg>
                    <span className="dash-ring-val">
                      {(result.confidence * 100).toFixed(1)}
                      <small>%</small>
                    </span>
                  </div>
                  <div>
                    <p className="dash-kicker">Most likely condition</p>
                    <p className="dash-verdict">{result.predicted_label}</p>
                  </div>
                </div>

                <ul className="dash-probs">
                  {FAULTS.map((fault) => {
                    const p = result.probabilities[fault.name] ?? 0
                    return (
                      <li key={fault.name}>
                        <span className="dash-prob-name">{fault.name}</span>
                        <span className="dash-track">
                          <span
                            className="dash-fill"
                            style={{ width: `${p * 100}%`, '--f': fault.color }}
                          />
                        </span>
                        <span className="dash-prob-val">{(p * 100).toFixed(1)}%</span>
                      </li>
                    )
                  })}
                </ul>
                {notice && <p className="dash-notice">{notice}</p>}
              </div>
            ) : (
              <div className="dash-idle">
                <span className="dash-radar" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <p>
                  Enter the six sensor readings (or load a sample) and run a diagnosis. The
                  condition and its confidence appear here.
                </p>
              </div>
            )}
          </section>
        </div>

        <section className="dash-panel dash-history">
          <div className="dash-history-head">
            <h2 className="dash-h2">Condition over time</h2>
            <ul className="dash-legend">
              {FAULTS.map((fault, i) => (
                <li key={fault.name} className={counts[i] === 0 ? 'is-zero' : ''}>
                  <span className="dash-pip" style={{ background: fault.color }} />
                  {fault.name}
                  <b>{counts[i]}</b>
                </li>
              ))}
            </ul>
          </div>

          {historyError && <p className="dash-error">{historyError}</p>}

          {historyLoading ? (
            <p className="dash-empty">Loading your history…</p>
          ) : items.length === 0 ? (
            <p className="dash-empty">
              No diagnoses yet. Run your first one and it will be plotted here.
            </p>
          ) : (
            <>
              <div className="dash-chart">
                <ResponsiveContainer width="100%" height={290}>
                  <LineChart data={chartData} margin={{ top: 12, right: 24, left: 0, bottom: 4 }}>
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ffd36b" />
                        <stop offset="100%" stopColor="#ff8a3d" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="rgba(255,255,255,0.1)"
                      tick={{ fill: AXIS, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                      interval="preserveStartEnd"
                      minTickGap={48}
                    />
                    <YAxis
                      type="number"
                      domain={[-0.5, 4.5]}
                      ticks={[0, 1, 2, 3, 4]}
                      tickFormatter={(i) => FAULTS[i].name}
                      width={104}
                      stroke="rgba(255,255,255,0.1)"
                      tick={{ fill: AXIS, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                    />
                    <Tooltip
                      content={<TimelineTooltip />}
                      cursor={{ stroke: 'rgba(255,194,75,0.35)', strokeDasharray: '4 4' }}
                    />
                    <Line
                      dataKey="classIndex"
                      type="stepAfter"
                      stroke="url(#lineGrad)"
                      strokeWidth={2}
                      dot={<TimelineDot />}
                      activeDot={<TimelineDot />}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <table className="dash-table">
                <thead>
                  <tr>
                    <th scope="col">Time</th>
                    <th scope="col">Condition</th>
                    <th scope="col">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {items.slice(0, 10).map((item) => (
                    <tr key={item.id}>
                      <td>{formatTime(item.createdAt)}</td>
                      <td>
                        <span
                          className="dash-pill"
                          style={{ '--c': FAULTS[item.classIndex].color }}
                        >
                          {item.label}
                        </span>
                      </td>
                      <td>{(item.confidence * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>
      </main>
    </div>
  )
}