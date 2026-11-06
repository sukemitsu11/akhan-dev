/** Номер счётчика Яндекс Метрики. Загружается только после согласия посетителя (см. CookieBanner.astro). */
export const metrikaId = 114112178;

/** Ключ в localStorage, где хранится выбор посетителя. */
export const consentKey = 'akhan-consent';

/** Версия согласия: при смене текста политики увеличить число, и плашка спросит заново. */
export const consentVersion = 1;
