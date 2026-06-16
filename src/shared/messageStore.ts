import { createStore } from 'solid-js/store'
import type { AlertEvent, ChatMessage } from './types'

const MAX_MESSAGES = 50
const MAX_ALERTS = 10

export const [messageStore, setMessageStore] = createStore<{ messages: ChatMessage[] }>({
  messages: [],
})

export function addMessage(msg: ChatMessage): void {
  setMessageStore('messages', msgs => {
    const next = [...msgs, msg]
    return next.length > MAX_MESSAGES ? next.slice(1) : next
  })
}

export function clearMessages(): void {
  setMessageStore('messages', [])
}

export const [alertStore, setAlertStore] = createStore<{ alerts: AlertEvent[] }>({
  alerts: [],
})

export function addAlert(alert: AlertEvent): void {
  setAlertStore('alerts', alerts => {
    const next = [...alerts, alert]
    return next.length > MAX_ALERTS ? next.slice(1) : next
  })
}

export function clearAlerts(): void {
  setAlertStore('alerts', [])
}
