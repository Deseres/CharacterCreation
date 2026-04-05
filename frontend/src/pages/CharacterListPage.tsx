import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCharacters } from '../api/characters'
import { useAuth } from '../auth/AuthContext'
import type { Character } from '../types'

export function CharacterListPage() {
  const { token, email, logout } = useAuth()
  const [characters, setCharacters] = useState<Character[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const data = await getCharacters(token)
      setCharacters(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load characters')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token])

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>My Characters</h1>
          <p className="muted">Build and manage your D&D characters</p>
        </div>
        <div className="row">
          <span className="muted">{email}</span>
          <button onClick={logout} className="secondary">Logout</button>
        </div>
      </header>

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h2>Create a new character</h2>
            <p className="muted">Start your character creation adventure</p>
          </div>
          <Link to="/characters/create" style={{ textDecoration: 'none' }}>
            <button style={{ whiteSpace: 'nowrap' }}>Start Wizard</button>
          </Link>
        </div>
      </section>

      <section className="card">
        <h2>Your characters</h2>
        {loading ? (
          <p className="muted">Loading your characters...</p>
        ) : characters.length === 0 ? (
          <p className="muted">No characters yet. Create your first one above!</p>
        ) : (
          <div className="grid">
            {characters.map((c) => (
              <Link to={`/characters/${c.id}`} key={c.id} className="card character-card" style={{ textDecoration: 'none' }}>
                <h3>{c.name}</h3>
                <div className="stack" style={{ gap: '0.5rem' }}>
                  <div className="row">
                    <span className="badge">{c.race}</span>
                    <span className="badge">{c.class}</span>
                  </div>
                  <p className="muted">Level {c.level}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {error && <div className="error">{error}</div>}
    </div>
  )
}
