import type { LayoutConfig, WidgetStyle } from '../shared/types'
import { DEFAULT_CONFIG } from '../shared/stateEncoder'

export interface OverlayPreset {
  id: string
  name: string
  description: string
  theme: Pick<WidgetStyle,
    | 'backgroundColor' | 'backgroundOpacity' | 'textColor' | 'accentColor'
    | 'borderRadius' | 'fontFamily' | 'fontSize' | 'animation'
  >
  enabledWidgets: Array<keyof LayoutConfig['widgets']>
}

export const PRESETS: OverlayPreset[] = [
  {
    id: 'neon',
    name: 'Neon',
    description: 'Bold violet & green, punchy animations',
    theme: {
      backgroundColor: '#0d0616',
      backgroundOpacity: 0.75,
      textColor: '#ffffff',
      accentColor: '#53fc18',
      borderRadius: 18,
      fontFamily: 'poppins',
      fontSize: 16,
      animation: 'bounce',
    },
    enabledWidgets: ['chat', 'alert', 'followerGoal', 'viewerCount', 'recentEvents'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, quiet, and out of the way',
    theme: {
      backgroundColor: '#000000',
      backgroundOpacity: 0.35,
      textColor: '#f5f5f5',
      accentColor: '#e5e5e5',
      borderRadius: 6,
      fontFamily: 'inter',
      fontSize: 13,
      animation: 'fade',
    },
    enabledWidgets: ['chat', 'alert'],
  },
  {
    id: 'retro',
    name: 'Retro',
    description: 'Warm terminal vibes for a nostalgic stream',
    theme: {
      backgroundColor: '#1a0f00',
      backgroundOpacity: 0.8,
      textColor: '#ffe0b3',
      accentColor: '#ff6b35',
      borderRadius: 2,
      fontFamily: 'mono',
      fontSize: 14,
      animation: 'slide',
    },
    enabledWidgets: ['chat', 'alert', 'recentEvents', 'clock'],
  },
]

// Presets only vary cosmetic style fields + which widgets are enabled —
// position/size and per-widget extra fields (goalTarget, items, format, …)
// stay at DEFAULT_CONFIG's values to avoid hand-tuning layouts per preset.
export function buildPresetConfig(preset: OverlayPreset): LayoutConfig {
  const config = structuredClone(DEFAULT_CONFIG)
  for (const key in config.widgets) {
    const k = key as keyof LayoutConfig['widgets']
    Object.assign(config.widgets[k], preset.theme, {
      enabled: preset.enabledWidgets.includes(k),
    })
  }
  return config
}
