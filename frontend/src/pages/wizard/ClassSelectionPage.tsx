import { useEffect, useState } from 'react'
import { getClasses } from '../../api/characters'
import { CardGrid, StepNavigation } from '../../components/WizardComponents'
import type { ClassData } from '../../api/characters'

interface ClassSelectionPageProps {
  selectedClass: string | null
  onSelect: (className: string) => void
  onNext: () => void
  onPrev: () => void
}

export function ClassSelectionPage({
  selectedClass,
  onSelect,
  onNext,
  onPrev,
}: ClassSelectionPageProps) {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true)
        const data = await getClasses()
        setClasses(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load classes')
      } finally {
        setLoading(false)
      }
    }
    loadClasses()
  }, [])

  if (loading) return <p>Loading classes...</p>
  if (error) return <div className="error">{error}</div>

  const cards = classes.map((c) => ({
    id: c.name,
    title: c.name,
    description: c.description,
  }))

  return (
    <div>
      <h1>Choose Your Class</h1>
      <p className="muted">
        Select your character's class. Each class has unique abilities, proficiencies, and skills.
      </p>

      <CardGrid
        cards={cards}
        onSelect={(card: any) => onSelect(card.id)}
        selectedId={selectedClass ?? undefined}
      />

      {selectedClass && (
        <div className="card" style={{ marginTop: '2rem', backgroundColor: '#f1f5f9' }}>
          {classes.find((c) => c.name === selectedClass) && (
            <>
              <h3>{selectedClass}</h3>
              <div className="stack" style={{ gap: '1rem' }}>
                <p>
                  <strong>Hit Dice:</strong> {classes.find((c) => c.name === selectedClass)?.hitDice}
                </p>
                <div>
                  <strong>Armor Proficiencies:</strong>
                  <p className="muted">
                    {classes
                      .find((c) => c.name === selectedClass)
                      ?.armorProficiencies.join(', ') || 'None'}
                  </p>
                </div>
                <div>
                  <strong>Weapon Proficiencies:</strong>
                  <p className="muted">
                    {classes
                      .find((c) => c.name === selectedClass)
                      ?.weaponProficiencies.join(', ') || 'None'}
                  </p>
                </div>
                <div>
                  <strong>Saving Throw Proficiencies:</strong>
                  <p className="muted">
                    {classes
                      .find((c) => c.name === selectedClass)
                      ?.savingThrowProficiencies.join(', ')}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <StepNavigation
        currentStep={2}
        totalSteps={6}
        onNext={onNext}
        onPrev={onPrev}
        nextDisabled={!selectedClass}
        stepNames={['Race', 'Subrace', 'Class', 'Skills', 'Ability Scores', 'Review']}
      />
    </div>
  )
}
