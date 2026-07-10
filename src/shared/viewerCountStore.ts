import { createSignal } from "solid-js";

// Two signals rather than a store - viewer count is a single scalar value,
// not a collection. hasReceivedCount guards against showing "0 viewers" before
// the first real value arrives (stream offline or channel just loaded).
export const [viewerCount, setViewerCount] = createSignal<number>(0);
export const [hasReceivedCount, setHasReceivedCount] =
  createSignal<boolean>(false);
