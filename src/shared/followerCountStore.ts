import { createSignal } from 'solid-js'

export const [followerCount, setFollowerCount] = createSignal<number>(0)
export const [hasFollowerCount, setHasFollowerCount] = createSignal<boolean>(false)
