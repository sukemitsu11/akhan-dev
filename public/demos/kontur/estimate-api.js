// Только локальная демонстрация: данные и фотографии не отправляются.
export function createEstimateTransport() { return async () => ({ok:true, mode:'demo', requestId:crypto.randomUUID()}); }
