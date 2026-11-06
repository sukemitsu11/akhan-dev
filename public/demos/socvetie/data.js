// Магазин, цены, букеты и адрес доставки вымышлены. Месяцы: 1 = январь.

export const FLOWERS = [
  { id: 'tulip', name: 'Тюльпан', latin: 'Tulipa gesneriana', season: 'Весна', months: [2, 3, 4, 5], price: 120, days: '5-7', tone: 'yellow', size: 1, note: 'После срезки продолжает расти и тянется к свету, поэтому к утру букет меняет форму.', care: 'Вода холодная и на треть вазы. Держите подальше от батареи и от фруктов.' },
  { id: 'hyacinth', name: 'Гиацинт', latin: 'Hyacinthus orientalis', season: 'Весна', months: [2, 3, 4], price: 190, days: '5-7', tone: 'blue', size: 1, note: 'Самый сильный запах в весеннем букете. В спальню лучше не ставить.', care: 'Стебель мягкий: не подрезайте сильно и смените воду, когда она помутнеет.' },
  { id: 'ranunculus', name: 'Ранункулюс', latin: 'Ranunculus asiaticus', season: 'Весна', months: [3, 4, 5], price: 290, days: '6-8', tone: 'white', size: 1, note: 'В одном цветке бывает больше сотни лепестков, тонких как папиросная бумага.', care: 'Стебель полый и легко ломается. Наливайте воды немного и подрезайте острым ножом.' },
  { id: 'lilac', name: 'Сирень', latin: 'Syringa vulgaris', season: 'Весна', months: [5, 6], price: 350, days: '3-5', tone: 'lilac', size: 1.2, note: 'Вянет быстрее других цветов, зато ни с чем не спутаешь её запах в комнате.', care: 'Расщепите кончик ветки на пару сантиметров и уберите нижние листья.' },
  { id: 'peony', name: 'Пион', latin: 'Paeonia lactiflora', season: 'Лето', months: [5, 6], price: 390, days: '5-7', tone: 'pink', size: 1.25, note: 'Брать стоит в бутоне: за сутки в тёплой комнате он раскрывается в шар размером с ладонь.', care: 'Подрежьте стебель наискось, уберите нижние листья и меняйте воду раз в два дня.' },
  { id: 'chamomile', name: 'Садовая ромашка', latin: 'Leucanthemum vulgare', season: 'Лето', months: [6, 7, 8], price: 110, days: '7-10', tone: 'white', size: .85, note: 'Ботаники зовут её нивяником. Настоящая аптечная ромашка намного мельче.', care: 'Неприхотлива. Достаточно чистой вазы и свежей воды раз в три дня.' },
  { id: 'hydrangea', name: 'Гортензия', latin: 'Hydrangea macrophylla', season: 'Лето', months: [7, 8, 9], price: 490, days: '5-7', tone: 'blue', size: 1.45, note: 'Пьёт и через лепестки: поникшую шапку можно на час опустить в холодную воду.', care: 'Опрыскивайте соцветие каждый день и держите вазу вдали от солнца.' },
  { id: 'eustoma', name: 'Эустома', latin: 'Eustoma grandiflorum', season: 'Лето', months: [6, 7, 8, 9, 10, 11], price: 240, days: '10-14', tone: 'pink', size: 1, note: 'Похожа на розу без шипов и стоит дольше неё. На одной ветке раскрывается по очереди несколько бутонов.', care: 'Убирайте отцветшие цветки, тогда раскроются следующие.' },
  { id: 'rose', name: 'Садовая роза', latin: 'Rosa × hybrida', season: 'Лето', months: [5, 6, 7, 8, 9, 10, 11], price: 280, days: '6-9', tone: 'peach', size: 1.1, note: 'В отличие от прямых сортовых роз пахнет по-настоящему и раскрывается до самой сердцевины.', care: 'Срежьте шипы ниже уровня воды и подрезайте стебель раз в два дня.' },
  { id: 'dahlia', name: 'Георгин', latin: 'Dahlia pinnata', season: 'Осень', months: [8, 9, 10], price: 260, days: '4-6', tone: 'peach', size: 1.2, note: 'Цветёт до первых заморозков. Срезают только раскрытым: в вазе бутоны не раскрываются.', care: 'Полый стебель лучше подрезать под водой, а воду менять каждый день.' },
  { id: 'aster', name: 'Кустовая астра', latin: 'Symphyotrichum novi-belgii', season: 'Осень', months: [9, 10], price: 130, days: '7-10', tone: 'lilac', size: .95, note: 'Цветёт, когда на клумбах уже почти ничего не осталось, и даёт букету воздух.', care: 'Уберите все листья, которые окажутся в воде, иначе она быстро испортится.' },
  { id: 'chrysanthemum', name: 'Хризантема', latin: 'Chrysanthemum morifolium', season: 'Осень', months: [9, 10, 11, 12], price: 170, days: '14-21', tone: 'yellow', size: 1.05, note: 'Рекордсмен среди срезанных цветов: спокойно стоит до трёх недель.', care: 'Стебель жёсткий, его лучше расщепить. Воду меняйте раз в три дня.' },
  { id: 'amaryllis', name: 'Амариллис', latin: 'Hippeastrum hybridum', season: 'Зима', months: [11, 12, 1, 2], price: 520, days: '7-10', tone: 'pink', size: 1.15, note: 'Зимний цветок с тяжёлой головой на полом стебле. Флористы наливают в стебель воду и затыкают ватой.', care: 'Поставьте в устойчивую вазу. Сок раздражает кожу, поэтому стебель режьте в перчатках.' },
  { id: 'anemone', name: 'Анемона', latin: 'Anemone coronaria', season: 'Зима', months: [11, 12, 1, 2, 3, 4], price: 230, days: '5-7', tone: 'lilac', size: 1, note: 'Закрывается на ночь и снова раскрывается утром прямо в вазе.', care: 'Любит прохладу и немного воды. На ночь уберите букет от батареи.' },
];

export const GREENS = [
  { id: 'eucalyptus', name: 'Эвкалипт', latin: 'Eucalyptus cinerea', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], price: 150, days: '14-21', tone: 'green', note: 'Серебристые листья с лёгким запахом. Со временем не вянет, а красиво подсыхает.', care: 'Воды совсем немного. Можно оставить сохнуть в пустой вазе.' },
  { id: 'fern', name: 'Папоротник', latin: 'Rumohra adiantiformis', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], price: 90, days: '10-14', tone: 'green', note: 'Лёгкая плотная зелень, которая собирает букет в одну форму и закрывает стебли.', care: 'Опрыскивайте раз в день: листья любят влажный воздух.' },
  { id: 'ruscus', name: 'Рускус', latin: 'Ruscus hypoglossum', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], price: 110, days: '14-21', tone: 'green', note: 'Глянцевая тёмная зелень. Рядом с ней пастельные цветы выглядят светлее.', care: 'Почти не требует ухода: достаточно менять воду раз в неделю.' },
];

export const WRAPS = [
  { id: 'powder', name: 'Пудровая бумага', color: '#f2cfd7', price: 190 },
  { id: 'sage', name: 'Шалфейная бумага', color: '#c5d6c6', price: 190 },
  { id: 'sky', name: 'Голубая калька', color: '#c9dcee', price: 240 },
  { id: 'none', name: 'Без упаковки', color: 'transparent', price: 0 },
];
export const ASSEMBLY = 350;
export const MAX_STEMS = 41;

export const BOUQUETS = [
  { id: 'pudra', name: 'Пудра', text: 'Пионы и эустома в одном нежно-розовом тоне. Для тех, кто не любит контрасты.', stems: { peony: 5, eustoma: 6, eucalyptus: 4 }, wrap: 'powder', tone: 'pink' },
  { id: 'podjezd', name: 'Сирень у подъезда', text: 'Пахнет маем и двором из детства. Гиацинты добавляют глубины и ещё больше запаха.', stems: { lilac: 7, hyacinth: 4, fern: 3 }, wrap: 'sage', tone: 'lilac' },
  { id: 'slivki', name: 'Сливки', text: 'Ранункулюсы и светлые тюльпаны. Почти белый букет с тёплым оттенком.', stems: { ranunculus: 9, tulip: 6, eucalyptus: 3 }, wrap: 'sage', tone: 'white' },
  { id: 'moloko', name: 'Холодное молоко', text: 'Голубая гортензия и лиловые анемоны. Спокойный прохладный букет без розового.', stems: { hydrangea: 3, anemone: 6, aster: 4, eucalyptus: 4 }, wrap: 'sky', tone: 'blue' },
  { id: 'abrikos', name: 'Абрикос', text: 'Георгины и садовые розы одного тёплого цвета. Самый щедрый букет конца лета.', stems: { dahlia: 5, rose: 6, ruscus: 3 }, wrap: 'powder', tone: 'peach' },
  { id: 'dacha', name: 'Дачный', text: 'Ромашки и кустовые астры, будто только что срезанные у забора.', stems: { chamomile: 9, aster: 6, fern: 4 }, wrap: 'none', tone: 'white' },
  { id: 'med', name: 'Мёд', text: 'Жёлтые хризантемы и тюльпаны. Солнечный букет, который стоит дольше двух недель.', stems: { chrysanthemum: 7, tulip: 6, ruscus: 3 }, wrap: 'sage', tone: 'yellow' },
  { id: 'yanvar', name: 'Январь', text: 'Амариллисы и анемоны для тех месяцев, когда за окном совсем нет цвета.', stems: { amaryllis: 3, anemone: 6, eucalyptus: 5 }, wrap: 'powder', tone: 'pink' },
];

export const TONES = { pink: 'Розовые', peach: 'Персиковые', yellow: 'Жёлтые', lilac: 'Сиреневые', blue: 'Голубые', white: 'Белые', green: 'Зелень' };
export const SIZES = [
  { id: 's', name: 'Маленький', k: .6 },
  { id: 'm', name: 'Средний', k: 1 },
  { id: 'l', name: 'Большой', k: 1.5 },
];
export const SEASONS = ['Весна', 'Лето', 'Осень', 'Зима'];
export const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
export const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
export const MONTHS_IN = ['январе', 'феврале', 'марте', 'апреле', 'мае', 'июне', 'июле', 'августе', 'сентябре', 'октябре', 'ноябре', 'декабре'];
export const inSeasonNow = (stem) => stem.months.includes(new Date().getMonth() + 1);

export const STEMS = [...FLOWERS, ...GREENS];
export const stemById = (id) => STEMS.find((s) => s.id === id);
export const isGreen = (id) => GREENS.some((g) => g.id === id);
export const wrapById = (id) => WRAPS.find((w) => w.id === id) || WRAPS[0];

export function bouquetPrice(stems, wrapId) {
  const flowers = Object.entries(stems).reduce((sum, [id, n]) => sum + stemById(id).price * n, 0);
  return flowers + wrapById(wrapId).price + ASSEMBLY;
}

/** Чётность считается только по цветам: зелень в число цветов не входит. */
export const flowerCount = (stems) => Object.entries(stems).reduce((sum, [id, n]) => (isGreen(id) ? sum : sum + n), 0);
export const greenCount = (stems) => Object.entries(stems).reduce((sum, [id, n]) => (isGreen(id) ? sum + n : sum), 0);

/** Если чётность не та, добавляет стебель самого частого цветка в букете: букет не становится меньше выбранного размера. */
export function fitParity(stems, parity) {
  const wantOdd = parity === 'odd';
  if ((flowerCount(stems) % 2 === 1) === wantOdd) return stems;
  const lead = Object.entries(stems).filter(([id]) => !isGreen(id)).reduce((best, cur) => (cur[1] > best[1] ? cur : best))[0];
  return { ...stems, [lead]: stems[lead] + 1 };
}

export function scaleStems(stems, k) {
  return Object.fromEntries(Object.entries(stems).map(([id, n]) => {
    const scaled = Math.max(1, Math.round(n * k));
    return [id, scaled];
  }));
}
