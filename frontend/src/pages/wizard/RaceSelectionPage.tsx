import { useEffect, useState } from 'react'
import { getRaces } from '../../api/characters'
import { CardGrid, StepNavigation } from '../../components/WizardComponents'
import type { RaceData } from '../../api/characters'

interface RaceSelectionPageProps {
  selectedRace: string | null
  onSelect: (race: string) => void
  onNext: () => void
  onPrev: () => void
}

export function RaceSelectionPage({
  selectedRace,
  onSelect,
  onNext,
  onPrev,
}: RaceSelectionPageProps) {
  const [races, setRaces] = useState<RaceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRaces = async () => {
      try {
        setLoading(true)
        const data = await getRaces()
        setRaces(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load races')
      } finally {
        setLoading(false)
      }
    }
    loadRaces()
  }, [])

  if (loading) return <p>Loading races...</p>
  if (error) return <div className="error">{error}</div>

  const cards = races.map((r) => ({
    id: r.name,
    title: r.name,
    description: r.description,
  }))

  return (
    <div>
      <h1>Choose Your Race</h1>
      <p className="muted">
        Select your character's race. Each race grants ability bonuses, languages, and special traits.
      </p>

      <CardGrid
        cards={cards}
        onSelect={(card: any) => onSelect(card.id)}
        selectedId={selectedRace ?? undefined}
      />

      {selectedRace && (
        <div className="card" style={{ marginTop: '2rem', backgroundColor: '#f1f5f9' }}>
          {races.find((r) => r.name === selectedRace) && (
            <>
              <h3>{selectedRace}</h3>
              <div>
                <p>
                  <strong>Speed:</strong> {races.find((r) => r.name === selectedRace)?.speed} ft
                </p>
                <p>
                  <strong>Languages:</strong>{' '}
                  {races
                    .find((r) => r.name === selectedRace)
                    ?.languages.join(', ')}
                </p>
                <p>
                  <strong>Ability Bonuses:</strong>{' '}
                  {races
                    .find((r) => r.name === selectedRace)
                    ?.abilityBonuses.map((b) => `${b.ability} +${b.bonus}`)
                    .join(', ')}
                </p>
                <p>
                  <strong>Traits:</strong> {races.find((r) => r.name === selectedRace)?.traits.join(', ')}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <StepNavigation
        currentStep={0}
        totalSteps={6}
        onNext={onNext}
        onPrev={onPrev}
        nextDisabled={!selectedRace}
        stepNames={['Race', 'Subrace', 'Class', 'Skills', 'Ability Scores', 'Review']}
      />
    </div>
  )
}
