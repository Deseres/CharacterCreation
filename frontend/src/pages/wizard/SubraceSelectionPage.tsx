import { useEffect, useState } from 'react'
import { getSubraces } from '../../api/characters'
import { CardGrid, StepNavigation } from '../../components/WizardComponents'
import type { SubraceData } from '../../api/characters'

interface SubraceSelectionPageProps {
  race: string
  selectedSubrace: string | null
  onSelect: (subrace: string | null) => void
  onNext: () => void
  onPrev: () => void
  hasSubraces: boolean
}

export function SubraceSelectionPage({
  race,
  selectedSubrace,
  onSelect,
  onNext,
  onPrev,
  hasSubraces,
}: SubraceSelectionPageProps) {
  const [subraces, setSubraces] = useState<SubraceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSubraces = async () => {
      try {
        setLoading(true)
        const data = await getSubraces(race)
        setSubraces(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subraces')
      } finally {
        setLoading(false)
      }
    }
    loadSubraces()
  }, [race])

  if (!hasSubraces) {
    return (
      <div>
        <h1>Subrace</h1>
        <p className="muted">{race} does not have subraces. Continuing...</p>
        <StepNavigation
          currentStep={1}
          totalSteps={6}
          onNext={onNext}
          onPrev={onPrev}
          stepNames={['Race', 'Subrace', 'Class', 'Skills', 'Ability Scores', 'Review']}
        />
      </div>
    )
  }

  if (loading) return <p>Loading subraces...</p>
  if (error) return <div className="error">{error}</div>

  const cards = subraces.map((s) => ({
    id: s.name,
    title: s.name,
    description: s.description,
  }))

  return (
    <div>
      <h1>Choose Your {race} Subrace</h1>
      <p className="muted">Select a subrace variant. This grants additional bonuses and features.</p>

      <CardGrid
        cards={cards}
        onSelect={(card: any) => onSelect(card.id)}
        selectedId={selectedSubrace ?? undefined}
      />

      {selectedSubrace && (
        <div className="card" style={{ marginTop: '2rem', backgroundColor: '#f1f5f9' }}>
          {subraces.find((s) => s.name === selectedSubrace) && (
            <>
              <h3>{selectedSubrace}</h3>
              <div>
                <p>
                  <strong>Additional Ability Bonuses:</strong>{' '}
                  {subraces
                    .find((s) => s.name === selectedSubrace)
                    ?.additionalAbilityBonuses.map((b: any) => `${b.ability} +${b.bonus}`)
                    .join(', ') || 'None'}
                </p>
                <p>
                  <strong>Additional Languages:</strong>{' '}
                  {subraces
                    .find((s) => s.name === selectedSubrace)
                    ?.additionalLanguages.join(', ') || 'None'}
                </p>
                <p>
                  <strong>Additional Traits:</strong>{' '}
                  {subraces
                    .find((s) => s.name === selectedSubrace)
                    ?.additionalTraits.join(', ')}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <StepNavigation
        currentStep={1}
        totalSteps={6}
        onNext={onNext}
        onPrev={onPrev}
        nextDisabled={!selectedSubrace}
        stepNames={['Race', 'Subrace', 'Class', 'Skills', 'Ability Scores', 'Review']}
      />
    </div>
  )
}
