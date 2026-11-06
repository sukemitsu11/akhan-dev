const LANG_KEY = 'umlaut-lang';

export function setLang(code) {
  document.documentElement.dataset.lang = code;
  try { localStorage.setItem(LANG_KEY, code); } catch { /* приватный режим: цвет просто не запомнится */ }
}

export function getLang() {
  return document.documentElement.dataset.lang || 'en';
}

export function readStore(key) {
  try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; }
}

export function writeStore(key, value) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  } catch { /* без хранилища тест просто начнётся заново */ }
}

export function plural(n, one, few, many) {
  const a = n % 100, b = n % 10;
  if (a > 10 && a < 20) return many;
  if (b === 1) return one;
  return b >= 2 && b <= 4 ? few : many;
}

export function rub(value) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}
