import type { LayoutConfig } from './types'

export type ConfigSetter = (updater: (prev: LayoutConfig) => LayoutConfig) => void

export function applyConfigPatch(
  setConfig: ConfigSetter,
  patch: Partial<{ [K in keyof LayoutConfig['widgets']]: Partial<LayoutConfig['widgets'][K]> }>
): void {
  setConfig((prev) => {
    const next: LayoutConfig = { ...prev, widgets: { ...prev.widgets } }
    for (const key in patch) {
      const k = key as keyof LayoutConfig['widgets']
      // Type assertion required: TypeScript can't correlate the heterogeneous
      // widget union (followerGoal has extra fields) through a dynamic key.
      // The runtime spread is correct in all cases.
      ;(next.widgets as Record<string, unknown>)[k] = {
        ...(prev.widgets as Record<string, unknown>)[k] as object,
        ...(patch as Record<string, unknown>)[k] as object,
      }
    }
    return next
  })
}
