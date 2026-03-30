import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { createCharacter, getCharacters } from '../api/characters'
import { useAuth } from '../auth/AuthContext'
import type { Character } from '../types'

const defaultRace = 'Human'
const defaultClass = 'Fighter'

export function CharacterListPage() {
  const { token, email, logout } = useAuth()
  const [characters, setCharacters] = useState<Character[]>([])
  const [name, setName] = useState('')
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

  const onCreate = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return
    setError(null)
    try {
      await createCharacter(token, { name, race: defaultRace, class: defaultClass })
      setName('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <h1>Characters</h1>
        <div>
          <span className="muted">{email}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <section className="card">
        <h2>Create character</h2>
        <form onSubmit={onCreate} className="row">
          <input
            placeholder="Character name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit">Create</button>
        </form>
        <p className="muted">Default race/class: {defaultRace} / {defaultClass}</p>
      </section>

      <section className="card">
        <h2>Your list</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="list">
            {characters.map((c) => (
              <li key={c.id}>
                <Link to={`/characters/${c.id}`}>{c.name}</Link> - {c.race} {c.class} (Lv {c.level})
              </li>
            ))}
          </ul>
        )}
        {!loading && characters.length === 0 && <p>No characters yet.</p>}
      </section>

      {error && <p className="error">{error}</p>}
    </div>
  )
}
