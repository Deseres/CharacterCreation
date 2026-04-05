import { useEffect, useState } from 'react'
import { getClass } from '../../api/characters'
import { StepNavigation } from '../../components/WizardComponents'
import type { ClassData } from '../../api/characters'

interface SkillsSelectionPageProps {
  className: string
  selectedSkills: string[]
  onSelect: (skills: string[]) => void
  onNext: () => void
  onPrev: () => void
}

export function SkillsSelectionPage({
  className,
  selectedSkills,
  onSelect,
  onNext,
  onPrev,
}: SkillsSelectionPageProps) {
  const [classData, setClassData] = useState<ClassData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [localSkills, setLocalSkills] = useState<string[]>(selectedSkills)

  useEffect(() => {
    const loadClass = async () => {
      try {
        setLoading(true)
        const data = await getClass(className)
        setClassData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load class')
      } finally {
        setLoading(false)
      }
    }
    loadClass()
  }, [className])

  if (loading) return <p>Loading class details...</p>
  if (error) return <div className="error">{error}</div>
  if (!classData) return <div className="error">Class not found</div>

  if (!classData.skillChoices || classData.skillChoices.length === 0) {
    return (
      <div>
        <h1>Skills</h1>
        <p className="muted">{className} doesn't have selectable skills. Continuing...</p>
        <StepNavigation
          currentStep={3}
          totalSteps={6}
          onNext={onNext}
          onPrev={onPrev}
          stepNames={['Race', 'Subrace', 'Class', 'Skills', 'Ability Scores', 'Review']}
        />
      </div>
    )
  }

  const toggleSkill = (skill: string) => {
    setLocalSkills((prev) => {
      if (prev.includes(skill)) {
        return prev.filter((s) => s !== skill)
      }
      return [...prev, skill]
    })
  }

  const totalSkillsNeeded = classData.skillChoices.reduce((sum, choice) => sum + choice.count, 0)
  const isValid = localSkills.length === totalSkillsNeeded

  return (
    <div>
      <h1>Select Your Skills</h1>
      <p className="muted">
        Choose {totalSkillsNeeded} skill{totalSkillsNeeded !== 1 ? 's' : ''} from the available options.
      </p>

      <div className="card">
        <div className="stack" style={{ gap: '1rem' }}>
          {classData.allAvailableSkills.map((skill) => (
            <label
              key={skill}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                backgroundColor: localSkills.includes(skill) ? '#e0e7ff' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={localSkills.includes(skill)}
                onChange={() => toggleSkill(skill)}
                style={{ cursor: 'pointer' }}
              />
              <span>{skill}</span>
            </label>
          ))}
        </div>

        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: isValid ? '#d1fae5' : '#fee2e2', borderRadius: '0.5rem', fontSize: '0.875rem', color: isValid ? '#065f46' : '#7f1d1d' }}>
          Skills selected: <strong>{localSkills.length}</strong>/{totalSkillsNeeded} {!isValid && '(invalid)'}
        </div>
      </div>

      <StepNavigation
        currentStep={3}
        totalSteps={6}
        onNext={() => {
          onSelect(localSkills)
          onNext()
        }}
        onPrev={onPrev}
        nextDisabled={!isValid}
        stepNames={['Race', 'Subrace', 'Class', 'Skills', 'Ability Scores', 'Review']}
      />
    </div>
  )
}
