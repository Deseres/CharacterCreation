import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  addInventoryItem,
  equipItem,
  getCharacterSheet,
  getInventory,
  unequipSlot,
  updateAbilityScores,
  updateCharacterClass,
  updateCharacterRace,
} from '../api/characters'
import { useAuth } from '../auth/AuthContext'
import type { AbilityScores, CharacterSheet, InventoryItem } from '../types'

const races = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling']
const classes = ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard']
const slots = ['MainHand', 'OffHand', 'Armor', 'Helmet', 'Ring']
const scoreCost: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 }

export function CharacterSheetPage() {
  const { token } = useAuth()
  const { id } = useParams<{ id: string }>()

  const [sheet, setSheet] = useState<CharacterSheet | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [scoresForm, setScoresForm] = useState<AbilityScores>({
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8,
  })
  const [newItemName, setNewItemName] = useState('')
  const [newItemType, setNewItemType] = useState('Misc')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const load = async () => {
    if (!token || !id) return
    setIsLoading(true)
    setError(null)
    try {
      const [sheetData, inventoryData] = await Promise.all([
        getCharacterSheet(token, id),
        getInventory(token, id),
      ])
      setSheet(sheetData)
      setInventory(inventoryData)
      setScoresForm(sheetData.baseScores)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sheet')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token, id])

  const equippedBySlot = useMemo(() => {
    const map: Record<string, InventoryItem | undefined> = {}
    for (const slot of slots) {
      map[slot] = inventory.find((x) => x.isEquipped && x.equippedSlot?.toLowerCase() === slot.toLowerCase())
    }
    return map
  }, [inventory])

  if (!id) return <p>Invalid character id.</p>
  if (!sheet) return <p>Loading sheet...</p>

  const onSaveRace = async (race: string) => {
    if (!token) return
    setSuccess(null)
    try {
      await updateCharacterRace(token, id, race)
      await load()
      setSuccess('Race updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update race')
    }
  }

  const onSaveClass = async (charClass: string) => {
    if (!token) return
    setSuccess(null)
    try {
      await updateCharacterClass(token, id, charClass)
      await load()
      setSuccess('Class updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update class')
    }
  }

  const onSaveScores = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return
    setSuccess(null)
    const values = Object.values(scoresForm)
    if (values.some((value) => !Number.isInteger(value) || value < 8 || value > 15)) {
      setError('Ability scores must be integers between 8 and 15.')
      return
    }
    const pointCost = values.reduce((sum, value) => sum + scoreCost[value], 0)
    if (pointCost > 27) {
      setError(`Point-buy cost is ${pointCost}. Maximum allowed is 27.`)
      return
    }
    try {
      await updateAbilityScores(token, id, scoresForm)
      await load()
      setSuccess('Ability scores saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ability scores')
    }
  }

  const onAddItem = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return
    setSuccess(null)
    try {
      await addInventoryItem(token, id, { name: newItemName, itemType: newItemType, quantity: 1 })
      setNewItemName('')
      await load()
      setSuccess('Inventory item added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add inventory item')
    }
  }

  const onEquip = async (slot: string, itemId: string) => {
    if (!token) return
    setSuccess(null)
    try {
      const updated = await equipItem(token, id, slot, itemId)
      setSheet(updated)
      await load()
      setSuccess(`Equipped item in ${slot}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to equip item')
    }
  }

  const onUnequip = async (slot: string) => {
    if (!token) return
    setSuccess(null)
    try {
      const updated = await unequipSlot(token, id, slot)
      setSheet(updated)
      await load()
      setSuccess(`Unequipped ${slot}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unequip item')
    }
  }

  const pointBuyCost = Object.values(scoresForm).reduce((sum, value) => sum + (scoreCost[value] ?? 99), 0)
  const pointBuyValid = pointBuyCost <= 27 && Object.values(scoresForm).every((value) => Number.isInteger(value) && value >= 8 && value <= 15)

  return (
    <div className="page">
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/characters" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
          ← Back to characters
        </Link>
      </div>

      <div className="topbar" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>{sheet.name}</h1>
          <p className="muted">{sheet.race} {sheet.class} · Level {sheet.level}</p>
        </div>
      </div>

      <div className="grid">
        {/* Race & Class */}
        <div className="card">
          <h2>Race & Class</h2>
          <div className="stack">
            <div className="form-group">
              <label htmlFor="race">Race</label>
              <select id="race" value={sheet.race} onChange={(e) => void onSaveRace(e.target.value)}>
                {races.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="class">Class</label>
              <select id="class" value={sheet.class} onChange={(e) => void onSaveClass(e.target.value)}>
                {classes.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Ability Scores */}
        <div className="card">
          <h2>Ability Scores</h2>
          <form onSubmit={onSaveScores} className="stack">
            <div className="stat-grid">
              {Object.entries(scoresForm).map(([k, v]) => (
                <div key={k} className="form-group">
                  <label htmlFor={k} className="stat-label">{k.slice(0, 3).toUpperCase()}</label>
                  <input
                    id={k}
                    type="number"
                    min={8}
                    max={15}
                    value={v}
                    onChange={(e) => setScoresForm((prev) => ({ ...prev, [k]: Number(e.target.value) }))}
                    onKeyDown={(e) => e.preventDefault()}
                    style={{ textAlign: 'center', fontSize: '1.25rem' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ backgroundColor: pointBuyValid ? '#d1fae5' : '#fee2e2', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', color: pointBuyValid ? '#065f46' : '#7f1d1d', border: pointBuyValid ? '1px solid #6ee7b7' : '1px solid #fca5a5' }}>
              Point buy: <strong>{pointBuyCost}</strong>/27 {!pointBuyValid && '⚠ Invalid'}
            </div>
            <button type="submit" disabled={!pointBuyValid}>Save ability scores</button>
          </form>
        </div>

        {/* Final Stats */}
        <div className="card">
          <h2>Final Stats</h2>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ margin: '0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Proficiency Bonus</p>
            <p style={{ margin: '0', fontSize: '1.75rem', fontWeight: 700 }}>+{sheet.proficiencyBonus}</p>
          </div>
          <div className="stat-grid">
            {Object.entries(sheet.finalScores).map(([k, v]) => (
              <div key={k} className="stat-box">
                <div className="stat-value">{v}</div>
                <div className="stat-label">{k.slice(0, 3)}</div>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--primary)' }}>
                  {sheet.abilityModifiers[k as keyof AbilityScores] >= 0 ? '+' : ''}{sheet.abilityModifiers[k as keyof AbilityScores]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment Status */}
        <div className="card">
          <h2>Equipment</h2>
          <div className="stack" style={{ gap: '0.75rem' }}>
            {slots.map((slot) => {
              const equipped = equippedBySlot[slot]
              return (
                <div key={slot} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ margin: '0', fontSize: '0.875rem', fontWeight: 600 }}>{slot}</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {equipped ? equipped.name : 'Empty'}
                    </p>
                  </div>
                  <button
                    onClick={() => void onUnequip(slot)}
                    disabled={!equipped}
                    className="secondary"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Add Inventory */}
        <div className="card">
          <h2>Add Item</h2>
          <form onSubmit={onAddItem} className="stack">
            <div className="form-group">
              <label htmlFor="item-name">Item name</label>
              <input
                id="item-name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter item name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="item-type">Type</label>
              <input
                id="item-type"
                value={newItemType}
                onChange={(e) => setNewItemType(e.target.value)}
                placeholder=""
              />
            </div>
            <button type="submit">Add to inventory</button>
          </form>
        </div>

        {/* Inventory List */}
        {inventory.length > 0 && (
          <div className="card">
            <h2>Inventory ({inventory.length})</h2>
            <div className="stack" style={{ gap: '0.5rem' }}>
              {inventory.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ margin: '0', fontWeight: 500 }}>{item.name}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span className="badge">{item.itemType}</span>
                      {item.isEquipped && (
                        <span className="badge" style={{ background: 'var(--primary)', color: 'white' }}>{item.equippedSlot}</span>
                      )}
                    </div>
                  </div>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) void onEquip(e.target.value, item.id)
                    }}
                    style={{ padding: '0.4rem' }}
                  >
                    <option value="">Equip to...</option>
                    {slots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applied Modifiers */}
        {sheet.appliedModifiers.length > 0 && (
          <div className="card">
            <h2>Applied Modifiers</h2>
            <div className="stack" style={{ gap: '0.5rem' }}>
              {sheet.appliedModifiers.map((m, idx) => (
                <div key={`${m.source}-${m.ability}-${idx}`} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                  <p style={{ margin: '0', fontSize: '0.875rem' }}>
                    <strong>{m.source}</strong>: {m.ability} <span style={{ color: m.value >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {m.value >= 0 ? '+' : ''}{m.value}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {isLoading && <p className="muted" style={{ textAlign: 'center' }}>Refreshing sheet...</p>}
    </div>
  )
}

