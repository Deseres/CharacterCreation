import { useState } from 'react'
import { RaceSelectionPage } from './wizard/RaceSelectionPage'
import { SubraceSelectionPage } from './wizard/SubraceSelectionPage'
import { ClassSelectionPage } from './wizard/ClassSelectionPage'
import { SkillsSelectionPage } from './wizard/SkillsSelectionPage'
import { AbilityScoresPage } from './wizard/AbilityScoresPage'
import { ReviewPage } from './wizard/ReviewPage'
import { Link } from 'react-router-dom'

export function CharacterCreationWizard() {
  const [step, setStep] = useState(0)
  const [characterName, setCharacterName] = useState('')
  const [race, setRace] = useState<string | null>(null)
  const [raceHasSubraces, setRaceHasSubraces] = useState(false)
  const [subrace, setSubrace] = useState<string | null>(null)
  const [className, setClassName] = useState<string | null>(null)
  const [skills, setSkills] = useState<string[]>([])
  const [scores, setScores] = useState({
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8,
  })

  const handleRaceSelect = (selectedRace: string) => {
    setRace(selectedRace)
    // Check if this race has subraces
    const raceNames = ['Elf', 'Dwarf']
    setRaceHasSubraces(raceNames.includes(selectedRace))
  }

  const handleSubraceSelect = (selectedSubrace: string | null) => {
    setSubrace(selectedSubrace)
  }

  const handleCharacterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharacterName(e.target.value)
  }

  const nextStep = () => {
    // Skip subrace step if race doesn't have subraces
    if (step === 1 && !raceHasSubraces) {
      setStep(3) // Jump to class selection
    } else {
      setStep((prev) => Math.min(prev + 1, 6))
    }
  }
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0))

  return (
    <div className="page">
      <Link to="/characters" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500, marginBottom: '2rem', display: 'block' }}>
        ← Back to characters
      </Link>

      {/* Step 0: Character Name */}
      {step === 0 && (
        <div>
          <h1>Welcome to Character Creation</h1>
          <p className="muted">Let's create an amazing character! Start by choosing a name.</p>

          <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
            <div className="form-group">
              <label htmlFor="character-name">Character Name</label>
              <input
                id="character-name"
                type="text"
                value={characterName}
                onChange={handleCharacterNameChange}
                placeholder="Enter character name"
                autoFocus
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <button onClick={nextStep} disabled={!characterName.trim()}>
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Race Selection */}
      {step === 1 && <RaceSelectionPage selectedRace={race} onSelect={handleRaceSelect} onNext={nextStep} onPrev={prevStep} />}

      {/* Step 2: Subrace Selection (only if race has subraces) */}
      {step === 2 && raceHasSubraces && (
        <SubraceSelectionPage
          race={race!}
          selectedSubrace={subrace}
          onSelect={handleSubraceSelect}
          onNext={nextStep}
          onPrev={prevStep}
          hasSubraces={raceHasSubraces}
        />
      )}

      {/* Step 3: Class Selection */}
      {step === 3 && (
        <ClassSelectionPage
          selectedClass={className}
          onSelect={setClassName}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}

      {/* Step 4: Skills Selection */}
      {step === 4 && className && (
        <SkillsSelectionPage className={className} selectedSkills={skills} onSelect={setSkills} onNext={nextStep} onPrev={prevStep} />
      )}

      {/* Step 5: Ability Scores */}
      {step === 5 && (
        <AbilityScoresPage scores={scores} onSelect={setScores} onNext={nextStep} onPrev={prevStep} />
      )}

      {/* Step 6: Review */}
      {step === 6 && characterName && race && className && (
        <ReviewPage
          characterName={characterName}
          race={race}
          subrace={subrace}
          className={className}
          scores={scores}
          skills={skills}
          onPrev={prevStep}
        />
      )}
    </div>
  )
}
