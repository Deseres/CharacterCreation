interface Card {
  id: string
  title: string
  description: string
}

interface CardGridProps<T extends Card> {
  cards: T[]
  onSelect: (card: T) => void
  selectedId?: string
}

export function CardGrid<T extends Card>({ cards, onSelect, selectedId }: CardGridProps<T>) {
  return (
    <div className="grid">
      {cards.map((card) => (
        <div
          key={card.id}
          className="card"
          onClick={() => onSelect(card)}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: selectedId === card.id ? '2px solid var(--primary)' : '1px solid var(--border)',
            transform: selectedId === card.id ? 'scale(1.02)' : 'scale(1)',
            boxShadow: selectedId === card.id ? 'var(--shadow-md)' : 'var(--shadow)',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = selectedId === card.id ? 'scale(1.02)' : 'scale(1.02)'
            el.style.boxShadow = 'var(--shadow-md)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = selectedId === card.id ? 'scale(1.02)' : 'scale(1)'
            el.style.boxShadow = selectedId === card.id ? 'var(--shadow-md)' : 'var(--shadow)'
          }}
        >
          <h3>{card.title}</h3>
          <p className="muted">{card.description}</p>
        </div>
      ))}
    </div>
  )
}

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  nextDisabled?: boolean
  stepNames: string[]
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  nextDisabled = false,
  stepNames,
}: StepNavigationProps) {
  return (
    <div>
      {/* Step Indicator */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <p className="muted">
          Step {currentStep + 1} of {totalSteps}: <strong>{stepNames[currentStep]}</strong>
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: i <= currentStep ? 'var(--primary)' : 'var(--border)',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button onClick={onPrev} disabled={currentStep === 0} className="secondary">
          ← Previous
        </button>
        <button onClick={onNext} disabled={nextDisabled}>
          Next →
        </button>
      </div>
    </div>
  )
}
