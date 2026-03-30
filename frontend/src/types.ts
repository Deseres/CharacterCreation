export type AbilityScores = {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export type Character = {
  id: string
  name: string
  race: string
  class: string
  level: number
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export type InventoryItem = {
  id: string
  name: string
  itemType: string
  quantity: number
  isEquipped: boolean
  equippedSlot?: string | null
  strengthBonus: number
  dexterityBonus: number
  constitutionBonus: number
  intelligenceBonus: number
  wisdomBonus: number
  charismaBonus: number
}

export type StatModifier = {
  source: string
  ability: string
  value: number
}

export type CharacterSheet = {
  characterId: string
  name: string
  race: string
  class: string
  level: number
  baseScores: AbilityScores
  appliedModifiers: StatModifier[]
  finalScores: AbilityScores
  abilityModifiers: AbilityScores
  proficiencyBonus: number
}
