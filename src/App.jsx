import { useState } from 'react'
import cnuckNorris from './assets/chucknorris.webp'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [joke, setJoke] = useState('')
  const [loading, setLoading] = useState(false)

  async function getJoke() {
    setLoading(true)

    try {
      const response = await fetch('https://api.chucknorris.io/jokes/random')

      if (!response.ok) {
        throw new Error('Failed to fetch joke')
      }

      const data = await response.json()
      setJoke(data.value)
      setCount((value) => value + 1)
    } catch {
      setJoke('Chuck Norris could not bothered to tell a joke.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section id="center">
        {
          // menubar on top of the page with the title "Chuckjoker" and buttons homr and follow me on x
        }
        <div className="menubar">
          <h1>Chuckjoker</h1>
          <div className="menubar-buttons">
            <a href="https://gamecharactersai.github.io/chuckjoker" target="_blank">
              Home
            </a>
            <a href="https://x.com/GameCharacterAI" target="_blank">
              Follow me on X
            </a>
          </div>
        </div>
        {
          // Section for the Chuck Norris image and the joke button
        }
        <div className="hero">
          <img src={cnuckNorris} className="base" width="434" height="612" alt="Chuck Norris" />
        </div>
        <div>
          <h1>
            Get your random <span className="hero-highlight">Chuck Norris</span> joke to make your day!
          </h1>
        </div>
        <div className="joke-container">
          <button type="button" onClick={getJoke} disabled={loading}>
            {loading ? 'Loading...' : 'Entertain me!'}
          </button>
        </div>
        <div className="joke-container">
          <p id="joke">{joke}</p>
          <p>You have laughed {count} times!</p>
        </div>
      </section>
      <section id="spacer"></section>
      {
        // Section for the social media links
      }
      <section id="social-media">
        <div className="social-media-links">
          <a href="https://x.com/GameCharacterAI" target="_blank">
            Follow me on X
          </a>
        </div>
      </section>
      <section id="spacer"></section>
      <section id="footer">
        <div className="footer">
          <p className="footer-status">ONLINE // RANDOM ACCESS</p>
          <p className="footer-meta">Chuckjoker v. 1.0.1 © 2026 GameCharactersAI. All rights reserved.</p>
        </div>
      </section>
    </>
  )
}

export default App
