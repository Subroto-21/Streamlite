import { createSignal } from 'solid-js'
import type { LayoutConfig } from '../../shared/types'

const STORAGE_KEY = 'streamlite_overlays'

export interface SavedOverlay {
  id: string
  name: string
  savedAt: number
  config: LayoutConfig
}

function load(): SavedOverlay[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedOverlay[]) : []
  } catch {
    return []
  }
}

function persist(overlays: SavedOverlay[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overlays))
}

export const [savedOverlays, setSavedOverlays] = createSignal<SavedOverlay[]>(load())

export function saveOverlay(name: string, config: LayoutConfig): void {
  const trimmed = name.trim() || 'My Overlay'
  const existing = savedOverlays()
  const idx = existing.findIndex((o) => o.name === trimmed)
  let next: SavedOverlay[]
  if (idx !== -1) {
    next = existing.map((o, i) =>
      i === idx ? { ...o, savedAt: Date.now(), config } : o,
    )
  } else {
    next = [
      ...existing,
      { id: crypto.randomUUID(), name: trimmed, savedAt: Date.now(), config },
    ]
  }
  persist(next)
  setSavedOverlays(next)
}

export function deleteOverlay(id: string): void {
  const next = savedOverlays().filter((o) => o.id !== id)
  persist(next)
  setSavedOverlays(next)
}

export function renameOverlay(id: string, name: string): void {
  const trimmed = name.trim()
  if (!trimmed) return
  const next = savedOverlays().map((o) =>
    o.id === id ? { ...o, name: trimmed } : o,
  )
  persist(next)
  setSavedOverlays(next)
}
