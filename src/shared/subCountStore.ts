import { createSignal } from 'solid-js'

export const [subCount, setSubCount] = createSignal<number>(0)
export const [hasSubCount, setHasSubCount] = createSignal<boolean>(false)
