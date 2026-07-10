import { type Component, createSignal, onCleanup, onMount } from "solid-js";
import { config, setConfig } from "./store/configStore";
import { createChatAdapter } from "../shared/adapters";
import {
  addAlert,
  addMessage,
  alertStore,
  messageStore,
} from "../shared/messageStore";
import {
  setHasReceivedCount,
  setViewerCount,
} from "../shared/viewerCountStore";
import {
  setFollowerCount,
  setHasFollowerCount,
} from "../shared/followerCountStore";
import { setSubCount, setHasSubCount } from "../shared/subCountStore";
import { applyConfigPatch } from "../shared/applyConfigPatch";
import { parseOverlayCommand } from "../shared/commandParser";
import { buildOverlayUrl, DEFAULT_CONFIG } from "../shared/stateEncoder";
import ChatBox from "./components/ChatBox";
import AlertBox from "./components/AlertBox";
import FollowerGoal from "./components/FollowerGoal";
import SubGoal from "./components/SubGoal";
import ViewerCount from "./components/ViewerCount";
import SubCount from "./components/SubCount";
import RecentEvents from "./components/RecentEvents";
import StreamLabels from "./components/StreamLabels";
import ClockWidget from "./components/ClockWidget";
import CountdownTimer from "./components/CountdownTimer";
import Ticker from "./components/Ticker";
import TodoList from "./components/TodoList";
import QRCode from "./components/QRCode";
import SpotifyWidget from "./components/SpotifyWidget";
import DateTime from "./components/DateTime";
import Weather from "./components/Weather";
import ConnectionStatus, {
  type ConnState,
} from "./components/ConnectionStatus";

const STATUS_HIDE_MS = 4000;

const Overlay: Component = () => {
  const adapter = createChatAdapter("kick");

  const [connState, setConnState] = createSignal<ConnState>("connecting");
  const [statusVisible, setStatusVisible] = createSignal(true);
  let hideTimer: ReturnType<typeof setTimeout> | undefined;

  adapter.onStatusChange((status) => {
    console.log("[Streamlite] status:", status);
    if (status === "connected") {
      setConnState("connected");
      setStatusVisible(true);
      // Confirm the connection, then auto-hide so nothing lingers on-stream.
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setStatusVisible(false), STATUS_HIDE_MS);
    } else if (status === "reconnecting") {
      clearTimeout(hideTimer);
      setConnState("reconnecting");
      setStatusVisible(true);
    }
    // 'disconnected' is left as-is: it fires transiently between reconnects, so
    // showing an error on it would flap. A failure to ever connect stays on the
    // initial 'connecting' state, which is visible - exactly what we want.
  });

  adapter.onMessage((msg) => {
    addMessage(msg);

    // Authorization: only the channel owner can issue overlay commands.
    // WHY username===slug: Kick slugs are usually identical to display names
    // but this isn't guaranteed - slugs can differ in edge cases (e.g. special
    // characters stripped). A more robust check would compare the sender's
    // user ID against the channel owner ID from the kick.com/api/v2/channels
    // lookup (already performed in the adapter). Acceptable simplification for v1.
    if (msg.username.toLowerCase() === config.kickChannelSlug?.toLowerCase()) {
      const result = parseOverlayCommand(msg.message);
      if (result.matched) {
        applyConfigPatch(setConfig, {
          [result.widget]: { enabled: result.action === "show" },
        });
        console.log(`[Streamlite] command: ${result.action} ${result.widget}`);
      }
    }
  });

  adapter.onAlert((alert) => {
    console.log("[Streamlite] alert:", JSON.stringify(alert, null, 2));
    addAlert(alert);
  });

  adapter.onViewerCountUpdate(({ count }) => {
    setViewerCount(count);
    setHasReceivedCount(true);
  });

  adapter.onFollowerCountUpdate((count) => {
    setFollowerCount(count);
    setHasFollowerCount(true);
  });

  adapter.onSubscriberCountUpdate((count) => {
    setSubCount(count);
    setHasSubCount(true);
  });

  onMount(() => {
    if (!config.kickChannelSlug) {
      console.warn(
        "[Streamlite] No kickChannelSlug in config - chat not connected.",
      );
      setConnState("error");
      setStatusVisible(true);
      return;
    }
    adapter.connect(config.kickChannelSlug);
  });

  // WHY: explicit disconnect on cleanup so OBS scene refreshes and HMR
  // don't accumulate stale WebSocket connections.
  onCleanup(() => {
    clearTimeout(hideTimer);
    adapter.disconnect();
  });

  // WHY Option A (in-memory only): command-triggered toggles update configStore
  // but do not re-encode the URL. The OBS browser source URL is set once;
  // re-serialising on every chat command would be wasted work with no consumer
  // (nothing reloads the page to read the new URL). If "survives a manual OBS
  // refresh" becomes a requirement, add setUrlState(config) after applyConfigPatch.
  // See: src/shared/stateEncoder.ts → setUrlState()

  // Dev-only: expose stores and patch helpers for console testing.
  // e.g. __sl.patch({ chat: { enabled: false } })
  // e.g. __sl.addAlert({ id:'1', platform:'kick', type:'subscription', username:'Test', monthsSubscribed:3, timestamp: Date.now() })
  if (import.meta.env.DEV) {
    (window as unknown as Record<string, unknown>).__sl = {
      addMessage,
      addAlert,
      messageStore,
      alertStore,
      patch: (p: Parameters<typeof applyConfigPatch>[1]) =>
        applyConfigPatch(setConfig, p),
      // Build a full overlay URL for a given channel slug - paste into OBS or browser.
      // Usage: __sl.buildUrl('yourchannelslug')
      buildUrl: (slug: string) =>
        buildOverlayUrl(
          { ...structuredClone(DEFAULT_CONFIG), kickChannelSlug: slug },
          window.location.origin,
        ),
    };
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <ChatBox style={config.widgets.chat} />
      <AlertBox style={config.widgets.alert} />
      <FollowerGoal style={config.widgets.followerGoal} />
      <SubGoal style={config.widgets.subGoal} />
      <ViewerCount style={config.widgets.viewerCount} />
      <SubCount style={config.widgets.subCount} />
      <RecentEvents style={config.widgets.recentEvents} />
      <StreamLabels style={config.widgets.streamLabels} />
      <ClockWidget style={config.widgets.clock} />
      <CountdownTimer style={config.widgets.countdown} />
      <Ticker style={config.widgets.ticker} />
      <TodoList style={config.widgets.todoList} />
      <QRCode style={config.widgets.qrCode} />
      <SpotifyWidget style={config.widgets.spotify} />
      <DateTime style={config.widgets.dateTime} />
      <Weather style={config.widgets.weather} />
      <ConnectionStatus
        state={connState}
        visible={statusVisible}
        slug={config.kickChannelSlug}
      />
    </div>
  );
};

export default Overlay;
