import { apiRequest } from './http'
import type { Character, CharacterSheet, InventoryItem } from '../types'

export async function getCharacters(token: string): Promise<Character[]> {
  return apiRequest<Character[]>('/characters', {}, token)
}

export async function createCharacter(
  token: string,
  payload: { name: string; race: string; class: string },
): Promise<Character> {
  return apiRequest<Character>(
    '/characters',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  )
}

export async function getCharacterSheet(token: string, id: string): Promise<CharacterSheet> {
  return apiRequest<CharacterSheet>(`/characters/${id}/sheet`, {}, token)
}

export async function updateCharacterRace(token: string, id: string, race: string): Promise<Character> {
  return apiRequest<Character>(
    `/characters/${id}/race`,
    { method: 'PUT', body: JSON.stringify({ race }) },
    token,
  )
}

export async function updateCharacterClass(
  token: string,
  id: string,
  charClass: string,
): Promise<Character> {
  return apiRequest<Character>(
    `/characters/${id}/class`,
    { method: 'PUT', body: JSON.stringify({ class: charClass }) },
    token,
  )
}

export async function updateAbilityScores(
  token: string,
  id: string,
  scores: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  },
): Promise<Character> {
  return apiRequest<Character>(
    `/characters/${id}/ability-scores`,
    { method: 'PUT', body: JSON.stringify(scores) },
    token,
  )
}

export async function getInventory(token: string, id: string): Promise<InventoryItem[]> {
  return apiRequest<InventoryItem[]>(`/characters/${id}/inventory/items`, {}, token)
}

export async function addInventoryItem(
  token: string,
  id: string,
  payload: { name: string; itemType: string; quantity: number },
): Promise<InventoryItem> {
  return apiRequest<InventoryItem>(
    `/characters/${id}/inventory/items`,
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  )
}

export async function equipItem(
  token: string,
  id: string,
  slot: string,
  itemId: string,
): Promise<CharacterSheet> {
  return apiRequest<CharacterSheet>(
    `/characters/${id}/equipment/${encodeURIComponent(slot)}`,
    { method: 'PUT', body: JSON.stringify({ itemId }) },
    token,
  )
}

export async function unequipSlot(token: string, id: string, slot: string): Promise<CharacterSheet> {
  return apiRequest<CharacterSheet>(
    `/characters/${id}/equipment/${encodeURIComponent(slot)}`,
    { method: 'DELETE' },
    token,
  )
}
