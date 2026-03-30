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
      <p><Link to="/characters">Back to list</Link></p>
      <h1>{sheet.name}</h1>

      <section className="grid">
        <div className="card">
          <h2>Race / Class</h2>
          <label>
            Race
            <select value={sheet.race} onChange={(e) => void onSaveRace(e.target.value)}>
              {races.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label>
            Class
            <select value={sheet.class} onChange={(e) => void onSaveClass(e.target.value)}>
              {classes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <div className="card">
          <h2>Ability Scores</h2>
          <form onSubmit={onSaveScores} className="stack">
            {Object.entries(scoresForm).map(([k, v]) => (
              <label key={k}>
                {k}
                <input
                  type="number"
                  min={8}
                  max={15}
                  value={v}
                  onChange={(e) => setScoresForm((prev) => ({ ...prev, [k]: Number(e.target.value) }))}
                />
              </label>
            ))}
            <p className="muted">
              Point buy cost: {pointBuyCost}/27 {!pointBuyValid && '(invalid)'}
            </p>
            <button type="submit" disabled={!pointBuyValid}>Save scores</button>
          </form>
        </div>

        <div className="card">
          <h2>Calculated Stats</h2>
          <p>Proficiency bonus: +{sheet.proficiencyBonus}</p>
          <ul className="list">
            {Object.entries(sheet.finalScores).map(([k, v]) => (
              <li key={k}>{k}: {v} (mod {sheet.abilityModifiers[k as keyof AbilityScores]})</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Inventory</h2>
          <form onSubmit={onAddItem} className="row">
            <input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Item name" required />
            <input value={newItemType} onChange={(e) => setNewItemType(e.target.value)} placeholder="Type" />
            <button type="submit">Add</button>
          </form>
          <ul className="list">
            {inventory.map((item) => (
              <li key={item.id}>
                {item.name} ({item.itemType}) {item.isEquipped ? `[${item.equippedSlot}]` : ''}
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Equipment</h2>
          {slots.map((slot) => (
            <div key={slot} className="row">
              <strong>{slot}</strong>
              <span>{equippedBySlot[slot]?.name ?? 'Empty'}</span>
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) void onEquip(slot, e.target.value)
                }}
              >
                <option value="">Equip...</option>
                {inventory.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <button onClick={() => void onUnequip(slot)}>Unequip</button>
            </div>
          ))}
        </div>

        <div className="card">
          <h2>Applied Modifiers</h2>
          <ul className="list">
            {sheet.appliedModifiers.map((m, idx) => (
              <li key={`${m.source}-${m.ability}-${idx}`}>
                {m.source}: {m.ability} {m.value >= 0 ? '+' : ''}{m.value}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {isLoading && <p className="muted">Refreshing sheet...</p>}
      {success && <p>{success}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}
