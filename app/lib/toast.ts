type Listener = (msg: string) => void;
let _listener: Listener | null = null;

export const toast = {
  setListener: (fn: Listener | null) => { _listener = fn; },
  show: (msg: string) => { _listener?.(msg); },
};
