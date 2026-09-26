import { useEffect, useEffectEvent, useRef, useState } from 'react'
import cnuckNorris from './assets/chucknorris.webp'
import './App.css'

const API = 'https://api.chucknorris.io/jokes'
const SITE_URL = 'https://gamecharactersai.github.io/chuckjoker'
const COUNT_KEY = 'chuckjoker:count'
const RECENT_KEY = 'chuckjoker:recent'
const REMEMBER_KEY = 'chuckjoker:remember'
const RECENT_LIMIT = 6

const LOADING_LINES = [
  'Charging roundhouse...',
  'Consulting Chuck...',
  'Chuck is deciding...',
  'Breaking the fourth wall...',
]

// Nothing is stored on the device unless the visitor switches "Remember" on
function readRemember() {
  try {
    return localStorage.getItem(REMEMBER_KEY) === '1'
  } catch {
    return false
  }
}

function readCount() {
  try {
    return Number(localStorage.getItem(COUNT_KEY)) || 0
  } catch {
    return 0
  }
}

function readRecent() {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY))
    return Array.isArray(list) ? list.filter((item) => typeof item === 'string').slice(0, RECENT_LIMIT) : []
  } catch {
    return []
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage unavailable, the value just won't persist
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(REMEMBER_KEY)
    localStorage.removeItem(COUNT_KEY)
    localStorage.removeItem(RECENT_KEY)
  } catch {
    // Storage unavailable, so nothing was saved either
  }
}

// Show the privacy dialog with keyboard focus on its "Got it" button
function openDialog(dialog) {
  if (!dialog || dialog.open) return
  dialog.showModal()
  dialog.querySelector('[data-autofocus]')?.focus()
}

// Put `joke` at the front of `list`, dropping duplicates and anything past the limit
function pushRecent(list, joke) {
  return [joke, ...list.filter((item) => item !== joke)].slice(0, RECENT_LIMIT)
}

function App() {
  const [remember, setRemember] = useState(readRemember)
  const [count, setCount] = useState(() => (remember ? readCount() : 0))
  const [joke, setJoke] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingLine, setLoadingLine] = useState(LOADING_LINES[0])
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [copied, setCopied] = useState(false)
  const [recent, setRecent] = useState(() => (remember ? readRecent() : []))
  const privacyRef = useRef(null)

  useEffect(() => {
    fetch(`${API}/categories`)
      .then((response) => (response.ok ? response.json() : []))
      .then((list) => setCategories(list.filter((name) => name !== 'explicit')))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (remember) {
      writeStorage(REMEMBER_KEY, '1')
      writeStorage(COUNT_KEY, String(count))
      writeStorage(RECENT_KEY, JSON.stringify(recent))
    } else {
      clearStorage()
    }
  }, [remember, count, recent])

  // Open the privacy note when the address ends in #privacy (on load, or when a link changes it)
  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === '#privacy') openDialog(privacyRef.current)
    }
    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [])

  async function getJoke() {
    if (loading) return
    setLoading(true)
    setCopied(false)
    setLoadingLine(LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)])

    try {
      const query = category ? `?category=${encodeURIComponent(category)}` : ''
      const response = await fetch(`${API}/random${query}`)

      if (!response.ok) {
        throw new Error('Failed to fetch joke')
      }

      const data = await response.json()
      if (joke && !error) setRecent((list) => pushRecent(list, joke))
      setJoke(data.value)
      setError(false)
      setCount((value) => value + 1)
    } catch {
      setJoke('Chuck Norris could not be bothered to tell a joke. Try again.')
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = useEffectEvent((event) => {
    const tag = event.target.tagName
    if (privacyRef.current?.open) return
    if (event.code !== 'Space' || tag === 'BUTTON' || tag === 'A' || tag === 'INPUT') return
    event.preventDefault()
    getJoke()
  })

  useEffect(() => {
    const handler = (event) => onKeyDown(event)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  async function copyJoke() {
    try {
      await navigator.clipboard.writeText(joke)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard blocked, nothing to do
    }
  }

  function recallJoke(item) {
    setRecent((list) => {
      const rest = list.filter((entry) => entry !== item)
      return joke && !error ? pushRecent(rest, joke) : rest
    })
    setJoke(item)
    setError(false)
    setCopied(false)
  }

  const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(`${joke}\n\nvia Chuckjoker`)}&url=${encodeURIComponent(SITE_URL)}`
  const hasJoke = joke && !error

  return (
    <>
      <section id="center">
        <header className="menubar">
          <a className="logo" href={SITE_URL}>
            Chuckjoker
          </a>
          <nav className="menubar-buttons">
            <a href={SITE_URL}>Home</a>
            <a href="https://x.com/GameCharacterAI" target="_blank" rel="noopener noreferrer">
              Follow me on X
            </a>
          </nav>
        </header>

        <main className="stage">
          <div className={`hero${loading ? ' is-loading' : ''}`}>
            <img src={cnuckNorris} className="base" width="434" height="612" alt="Chuck Norris" />
            <span className="hero-tag">SUBJECT: C. NORRIS // THREAT LEVEL: ∞</span>
          </div>

          <div className="console">
            <h1>
              Get your random <span className="hero-highlight">Chuck Norris</span> joke to make your day!
            </h1>

            {categories.length > 0 && (
              <div className="chips" role="radiogroup" aria-label="Joke category">
                {['', ...categories].map((name) => (
                  <button
                    key={name || 'any'}
                    type="button"
                    role="radio"
                    aria-checked={category === name}
                    className={`chip${category === name ? ' is-active' : ''}`}
                    onClick={() => setCategory(name)}
                  >
                    {name || 'any'}
                  </button>
                ))}
              </div>
            )}

            <div className="cta">
              <button type="button" className="cta-button" onClick={getJoke} disabled={loading}>
                {loading ? loadingLine : joke ? 'Another one!' : 'Entertain me!'}
              </button>
              <span className="hint">
                or press <kbd>Space</kbd>
              </span>
            </div>

            <div className={`joke-container${error ? ' is-error' : ''}`}>
              <div className="joke-header">
                <span>{error ? 'ERR // TRANSMISSION FAILED' : joke ? `INCOMING // #${String(count).padStart(3, '0')}` : 'STANDBY // NO SIGNAL'}</span>
                {hasJoke && (
                  <div className="joke-actions">
                    <button type="button" className="ghost" onClick={copyJoke}>
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <a className="ghost" href={shareUrl} target="_blank" rel="noopener noreferrer">
                      Share on X
                    </a>
                  </div>
                )}
              </div>
              <p id="joke" key={joke} aria-live="polite" className={joke ? 'is-new' : 'is-empty'}>
                {joke || 'Awaiting input'}
              </p>
            </div>

            <div className="stats-row">
              <p className="stats">
                Jokes served <strong>{String(count).padStart(3, '0')}</strong>
              </p>
              <label className="remember">
                <input
                  type="checkbox"
                  role="switch"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span>Remember my jokes on this device</span>
              </label>
            </div>
          </div>
        </main>

        {recent.length > 0 && (
          <section className="log" aria-labelledby="log-title">
            <div className="log-header">
              <h2 id="log-title">Recent transmissions</h2>
              <button type="button" className="ghost" onClick={() => setRecent([])}>
                Clear log
              </button>
            </div>
            <ol className="log-list">
              {recent.map((item, index) => (
                <li key={item}>
                  <button type="button" className="log-item" onClick={() => recallJoke(item)}>
                    <span className="log-meta">
                      <span>#{String(index + 1).padStart(2, '0')}</span>
                      <span className="log-recall">Recall →</span>
                    </span>
                    <span className="log-text">{item}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        )}
      </section>

      <footer id="footer">
        <div className="footer">
          <div>
            <p className="footer-status">ONLINE // RANDOM ACCESS</p>
            <a className="footer-social" href="https://x.com/GameCharacterAI" target="_blank" rel="noopener noreferrer">
              Follow me on X
            </a>
          </div>
          <div className="footer-meta">
            <button type="button" className="footer-link" onClick={() => openDialog(privacyRef.current)}>
              Privacy
            </button>
            <p>Chuckjoker v. 1.1.0 © 2026 GameCharactersAI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <dialog
        ref={privacyRef}
        className="privacy"
        aria-labelledby="privacy-title"
        onClick={(event) => event.target === event.currentTarget && event.currentTarget.close()}
      >
        <div className="privacy-body">
          <h2 id="privacy-title">Privacy</h2>
          <p>
            Chuckjoker has no cookies, analytics, ads or tracking. This site doesn't collect or keep any information
            about you.
          </p>

          <h3>Saved on your device</h3>
          <p>
            Nothing is saved unless you switch on <em>Remember my jokes on this device</em>. When it's on, your joke
            counter and your last {RECENT_LIMIT} jokes are kept in your browser's local storage so they're still
            there next time. This data stays on your device and is never sent anywhere. Switching it off deletes it
            straight away, and clearing your browsing data removes it too.
          </p>

          <h3>Other services</h3>
          <ul>
            <li>
              <strong>Jokes</strong> are fetched by your browser from{' '}
              <a href="https://api.chucknorris.io" target="_blank" rel="noopener noreferrer">
                api.chucknorris.io
              </a>
              , which receives your IP address like any website you visit.
            </li>
            <li>
              <strong>Hosting</strong> is provided by GitHub Pages. GitHub may log visitors' IP addresses for
              security, as described in the{' '}
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Privacy Statement
              </a>
              .
            </li>
            <li>
              <strong>Fonts and images</strong> are served from this site. Nothing is loaded from Google or other
              third parties.
            </li>
            <li>
              <strong>X links</strong> only contact X if you click them.
            </li>
          </ul>

          <h3>Questions</h3>
          <p>
            Message{' '}
            <a href="https://x.com/GameCharacterAI" target="_blank" rel="noopener noreferrer">
              @GameCharacterAI
            </a>{' '}
            on X.
          </p>

          <form method="dialog">
            <button type="submit" data-autofocus>
              Got it
            </button>
          </form>
        </div>
      </dialog>
    </>
  )
}

export default App
