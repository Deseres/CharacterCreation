import { useState } from 'react'
import { StepNavigation } from '../../components/WizardComponents'

interface AbilityScoresPageProps {
  scores: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  onSelect: (scores: any) => void
  onNext: () => void
  onPrev: () => void
}

const scoreCost: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 }

export function AbilityScoresPage({
  scores,
  onSelect,
  onNext,
  onPrev,
}: AbilityScoresPageProps) {
  const [localScores, setLocalScores] = useState(scores)

  const pointBuyCost = Object.values(localScores).reduce((sum, value) => sum + (scoreCost[value] ?? 99), 0)
  const pointBuyValid = pointBuyCost <= 27 && Object.values(localScores).every((value) => Number.isInteger(value) && value >= 8 && value <= 15)

  const updateScore = (ability: string, value: number) => {
    setLocalScores((prev: any) => ({
      ...prev,
      [ability]: Math.max(8, Math.min(15, value)),
    }))
  }

  return (
    <div>
      <h1>Set Ability Scores</h1>
      <p className="muted">
        Use point-buy to allocate your ability scores. You have 27 points to spend, with scores ranging from 8 to 15.
      </p>

      <div className="card">
        <div className="stat-grid">
          {Object.entries(localScores).map(([k, v]: [string, any]) => (
            <div key={k} className="form-group">
              <label htmlFor={k} className="stat-label">{k.slice(0, 3).toUpperCase()}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => updateScore(k, v - 1)}
                  disabled={v <= 8}
                  style={{ padding: '0.4rem 0.6rem', fontSize: '1rem' }}
                >
                  −
                </button>
                <input
                  id={k}
                  type="number"
                  min={8}
                  max={15}
                  value={v}
                  onChange={(e) => updateScore(k, Number(e.target.value))}
                  onKeyDown={(e) => e.preventDefault()}
                  style={{ textAlign: 'center', fontSize: '1.25rem', flex: 1 }}
                />
                <button
                  onClick={() => updateScore(k, v + 1)}
                  disabled={v >= 15}
                  style={{ padding: '0.4rem 0.6rem', fontSize: '1rem' }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: '1rem',
            backgroundColor: pointBuyValid ? '#d1fae5' : '#fee2e2',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: pointBuyValid ? '#065f46' : '#7f1d1d',
            border: pointBuyValid ? '1px solid #6ee7b7' : '1px solid #fca5a5',
          }}
        >
          Point buy: <strong>{pointBuyCost}</strong>/27 {!pointBuyValid && '⚠ Invalid'}
        </div>
      </div>

      <StepNavigation
        currentStep={4}
        totalSteps={6}
        onNext={() => {
          onSelect(localScores)
          onNext()
        }}
        onPrev={onPrev}
        nextDisabled={!pointBuyValid}
        stepNames={['Race', 'Subrace', 'Class', 'Skills', 'Ability Scores', 'Review']}
      />
    </div>
  )
}
