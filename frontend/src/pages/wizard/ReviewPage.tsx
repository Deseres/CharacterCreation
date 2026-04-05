import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { createCharacterWithWizard } from '../../api/characters'
import { useNavigate } from 'react-router-dom'
import type { CreateCharacterWizardRequest } from '../../api/characters'

interface ReviewPageProps {
  characterName: string
  race: string
  subrace: string | null
  className: string
  scores: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  skills: string[]
  onPrev: () => void
}

export function ReviewPage({
  characterName,
  race,
  subrace,
  className,
  scores,
  skills,
  onPrev,
}: ReviewPageProps) {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      const payload: CreateCharacterWizardRequest = {
        name: characterName,
        race,
        subrace: subrace || undefined,
        class: className,
        strength: scores.strength,
        dexterity: scores.dexterity,
        constitution: scores.constitution,
        intelligence: scores.intelligence,
        wisdom: scores.wisdom,
        charisma: scores.charisma,
        selectedSkills: skills,
      }

      await createCharacterWithWizard(token, payload)
      navigate('/characters')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Review Your Character</h1>
      <p className="muted">Check all details and create your character!</p>

      <div className="grid">
        <div className="card">
          <h3>Basic Info</h3>
          <p>
            <strong>Name:</strong> {characterName}
          </p>
          <p>
            <strong>Race:</strong> {race}
            {subrace && ` (${subrace})`}
          </p>
          <p>
            <strong>Class:</strong> {className}
          </p>
        </div>

        <div className="card">
          <h3>Ability Scores</h3>
          <div className="stat-grid">
            {Object.entries(scores).map(([k, v]: [string, any]) => (
              <div key={k} className="stat-box">
                <div className="stat-value">{v}</div>
                <div className="stat-label">{k.slice(0, 3)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {skills.length > 0 ? (
              skills.map((skill) => (
                <span key={skill} className="badge">
                  {skill}
                </span>
              ))
            ) : (
              <p className="muted">No skills selected</p>
            )}
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button onClick={onPrev} disabled={loading} className="secondary">
          ← Previous
        </button>
        <button onClick={handleCreate} disabled={loading}>
          {loading ? 'Creating...' : 'Create Character'}
        </button>
      </div>
    </div>
  )
}
