import { type Component, For, Show } from 'solid-js'
import type { LayoutConfig, StreamLabelType } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'
import { alertStore } from '../../shared/messageStore'
import { followerCount, hasFollowerCount } from '../../shared/followerCountStore'
import { subCount, hasSubCount } from '../../shared/subCountStore'
import { viewerCount, hasReceivedCount } from '../../shared/viewerCountStore'

interface Props {
  style: LayoutConfig['widgets']['streamLabels']
}

const LABEL_NAMES: Record<StreamLabelType, string> = {
  latestFollower: 'Latest Follower',
  latestSub: 'Latest Sub',
  latestGiftSub: 'Latest Gift Sub',
  topGifter: 'Top Gifter',
  followerCount: 'Followers',
  subCount: 'Subs',
  viewerCount: 'Viewers',
}

// latestX/topGifter only reflect the in-memory alertStore buffer (capped at
// 10 entries, src/shared/messageStore.ts) and reset on page/OBS-scene
// reload — the same limitation RecentEvents.tsx already has.
function resolveLabel(type: StreamLabelType): string {
  if (type === 'latestFollower') {
    const alert = [...alertStore.alerts].reverse().find(a => a.type === 'follow')
    return alert?.username ?? '—'
  }
  if (type === 'latestSub') {
    const alert = [...alertStore.alerts].reverse().find(a => a.type === 'subscription')
    return alert?.username ?? '—'
  }
  if (type === 'latestGiftSub') {
    const alert = [...alertStore.alerts].reverse().find(a => a.type === 'gift_sub')
    return alert?.username ?? '—'
  }
  if (type === 'topGifter') {
    const top = alertStore.alerts
      .filter(a => a.type === 'gift_sub')
      .reduce<typeof alertStore.alerts[number] | undefined>(
        (best, a) => (a.quantityGifted ?? 0) > (best?.quantityGifted ?? 0) ? a : best,
        undefined,
      )
    return top ? `${top.username} (${top.quantityGifted ?? 1})` : '—'
  }
  if (type === 'followerCount') return hasFollowerCount() ? followerCount().toLocaleString() : '—'
  if (type === 'subCount') return hasSubCount() ? subCount().toLocaleString() : '—'
  return hasReceivedCount() ? viewerCount().toLocaleString() : '—'
}

const StreamLabels: Component<Props> = (props) => {
  return (
    <div style={widgetStyleToCSS(props.style)}>
      <div style={{
        position: 'absolute', inset: '0',
        'background-color': 'var(--bg-color)',
        opacity: 'var(--bg-opacity)',
        'border-radius': 'var(--border-radius)',
      }} aria-hidden="true" />

      <div style={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        'flex-direction': 'column',
        padding: '10px 12px',
        gap: '6px',
        overflow: 'hidden',
        color: 'var(--text-color)',
      }}>
        <Show
          when={props.style.items.length > 0}
          fallback={<span style={{ opacity: '0.4', 'font-size': '0.85em', margin: 'auto' }}>No labels added</span>}
        >
          <For each={props.style.items}>
            {(item) => (
              <div style={{ display: 'flex', 'justify-content': 'space-between', gap: '8px', 'font-size': '0.9em' }}>
                <span style={{ opacity: '0.7' }}>{LABEL_NAMES[item.type]}</span>
                <span style={{
                  color: 'var(--accent-color)', 'font-weight': '600',
                  overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap',
                }}>{resolveLabel(item.type)}</span>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  )
}

export default StreamLabels
