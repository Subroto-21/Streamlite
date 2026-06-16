import { createStore, reconcile, unwrap } from 'solid-js/store'
import type { LayoutConfig } from '../../shared/types'
import { DEFAULT_CONFIG } from '../../shared/stateEncoder'
import type { ConfigSetter } from '../../shared/applyConfigPatch'

export const [builderConfig, _setBRaw] = createStore<LayoutConfig>(
  structuredClone(DEFAULT_CONFIG),
)

export const setBuilderConfig: ConfigSetter = (updater) => {
  _setBRaw(reconcile(updater(unwrap(builderConfig))))
}

export function setKickChannelSlug(slug: string): void {
  _setBRaw('kickChannelSlug', slug)
}
