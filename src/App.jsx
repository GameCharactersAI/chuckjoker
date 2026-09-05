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
        <div className="hero">
          <img src={cnuckNorris} className="base" width="434" height="612" alt="Chuck Norris" />
        </div>
        <div>
          <h1>Get your random Chuck Norris joke to make your day!</h1>
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
    </>
  )
}

export default App
