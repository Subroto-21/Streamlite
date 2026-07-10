import { createStore, reconcile, unwrap } from "solid-js/store";
import type { LayoutConfig } from "../../shared/types";
import { getUrlState } from "../../shared/stateEncoder";
import type { ConfigSetter } from "../../shared/applyConfigPatch";

export const [config, _setRaw] = createStore<LayoutConfig>(getUrlState());

// WHY: setConfig wraps the raw store setter to accept a functional-update
// form matching ConfigSetter's contract. This lets applyConfigPatch and the
// builder dashboard both call the same interface without knowing store
// internals. reconcile diffs old/new state and updates the reactive proxy
// in place - widget components that read config.widgets.X remain valid and
// reactively update without receiving new prop references.
export const setConfig: ConfigSetter = (updater) => {
  _setRaw(reconcile(updater(unwrap(config))));
};
