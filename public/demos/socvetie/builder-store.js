import { MAX_STEMS, WRAPS, stemById } from './data.js';

const KEY = 'socvetie-bouquet';

/** Порядок стеблей хранится, чтобы новый цветок ложился с краю, а не перемешивал весь букет. */
export function loadBuilder() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (raw && Array.isArray(raw.seq)) {
      return {
        seq: raw.seq.filter((s) => s && stemById(s.id) && s.uid).slice(0, MAX_STEMS),
        wrap: WRAPS.some((w) => w.id === raw.wrap) ? raw.wrap : WRAPS[0].id,
      };
    }
  } catch { /* начнём с пустого букета */ }
  return { seq: [], wrap: WRAPS[0].id };
}

function write(value) {
  try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* букет не сохранится после перезагрузки */ }
}

export const persist = write;

export function makeSeq(stems) {
  const seq = [];
  const pools = Object.entries(stems).map(([id, n]) => ({ id, left: n, n: 0 }));
  // Сорта чередуются, чтобы букет сразу выглядел перемешанным.
  while (pools.some((p) => p.left > 0)) {
    pools.forEach((p) => {
      if (p.left > 0) {
        seq.push({ id: p.id, uid: `${p.id}-${p.n}-${seq.length}` });
        p.left -= 1;
        p.n += 1;
      }
    });
  }
  return seq;
}

export function saveBuilder(stems, wrap) {
  write({ seq: makeSeq(stems), wrap });
}

export function addStems(id, count) {
  const state = loadBuilder();
  for (let i = 0; i < count && state.seq.length < MAX_STEMS; i += 1) {
    state.seq.push({ id, uid: `${id}-${Date.now().toString(36)}-${i}` });
  }
  write(state);
}
