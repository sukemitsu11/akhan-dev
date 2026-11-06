// Школа, преподаватели, цены и отзывы вымышлены.

export const LANGS = {
  en: { name: 'Английский', gen: 'английского', glyph: 'th', word: 'think, this', hint: 'Кончик языка между зубами', exam: 'IELTS' },
  es: { name: 'Испанский', gen: 'испанского', glyph: 'ñ', word: 'España', hint: 'Мягкое нь, как в слове «коньяк»', exam: 'DELE' },
  fr: { name: 'Французский', gen: 'французского', glyph: 'ç', word: 'français', hint: 'Всегда читается как с', exam: 'DELF' },
  de: { name: 'Немецкий', gen: 'немецкого', glyph: 'ü', word: 'für', hint: 'Губы как для у, а звук как и', exam: 'Goethe-Zertifikat' },
};

export const HELLO = {
  en: { word: 'Hello', size: 30 },
  es: { word: '¡Hola!', size: 28 },
  fr: { word: 'Bonjour', size: 21 },
  de: { word: 'Hallo', size: 30 },
};

export const STEPS = [
  { title: 'Узнаёте уровень', text: 'Тест из 8 вопросов покажет уровень и разберёт каждый ответ.' },
  { title: 'Приходите на пробное занятие', text: 'Оно бесплатное. Преподаватель проверит речь и понимание на слух, а вы решите, удобно ли вам с ним заниматься.' },
  { title: 'Выбираете формат и расписание', text: 'Группа, пара или один на один, от 1 до 3 занятий в неделю.' },
  { title: 'Занимаетесь и сверяете прогресс', text: 'Раз в три месяца контрольная работа показывает, что уже получается, а что стоит повторить.' },
];

export const LEVELS = {
  A1: { from: '0-1', text: 'Знаете базовые фразы и можете представиться.' },
  A2: { from: '2-3', text: 'Справитесь в магазине и кафе, расскажете о себе простыми фразами.' },
  B1: { from: '4-5', text: 'Объясняетесь в поездке и поддерживаете разговор на знакомые темы.' },
  B2: { from: '6-7', text: 'Свободно обсуждаете работу и новости, понимаете большинство фильмов.' },
  C1: { from: '8', text: 'Говорите гибко и точно, в том числе на сложные темы.' },
};

export const levelByScore = (score) => (score >= 8 ? 'C1' : score >= 6 ? 'B2' : score >= 4 ? 'B1' : score >= 2 ? 'A2' : 'A1');

// В каждом вопросе правильный вариант стоит первым, на экране варианты перемешиваются.
export const QUESTIONS = {
  en: [
    { level: 'A1', stem: 'My sister ___ a doctor.', options: ['is', 'are', 'am', 'be'], why: 'My sister можно заменить на she, а с he, she, it глагол to be в настоящем времени принимает форму is.' },
    { level: 'A2', stem: 'We ___ to Rome last summer.', options: ['went', 'go', 'have gone', 'were go'], why: 'Last summer - законченный период в прошлом, поэтому нужен Past Simple. Глагол go неправильный: go, went, gone.' },
    { level: 'A2', stem: 'There isn\'t ___ milk in the fridge.', options: ['any', 'some', 'many', 'a'], why: 'В отрицаниях с неисчисляемыми существительными ставим any. Many идёт только с исчисляемыми, а a не сочетается со словом milk.' },
    { level: 'B1', stem: 'I ___ here since 2019.', options: ['have lived', 'live', 'am living', 'lived'], why: 'Since показывает действие, которое началось в прошлом и продолжается сейчас. Это Present Perfect, хотя по-русски мы скажем «живу».' },
    { level: 'B1', stem: 'If it rains tomorrow, we ___ at home.', options: ['will stay', 'would stay', 'stayed', 'stay'], why: 'Реальное условие в будущем: после if настоящее время, в главной части will. Would нужен для нереальных условий.' },
    { level: 'B2', stem: 'By the time we arrived, the film ___.', options: ['had already started', 'has already started', 'already started', 'was already starting'], why: 'Фильм начался раньше другого момента в прошлом. Предшествование передаёт Past Perfect, а by the time его подсказывает.' },
    { level: 'B2', stem: 'She suggested ___ a taxi.', options: ['taking', 'to take', 'take', 'took'], why: 'После suggest идёт форма на -ing или придаточное с that. Инфинитив с to здесь невозможен, хотя по-русски так и просится.' },
    { level: 'C1', stem: 'Hardly ___ the door when the phone rang.', options: ['had I closed', 'I had closed', 'did I close', 'I closed'], why: 'Если предложение начинается с hardly, порядок слов обратный. Пара hardly ... when требует Past Perfect: had I closed.' },
  ],
  es: [
    { level: 'A1', stem: 'Yo ___ de Moscú.', options: ['soy', 'estoy', 'es', 'tengo'], why: 'Происхождение выражает глагол ser. Для первого лица его форма soy. Estar говорит о местоположении и состоянии.' },
    { level: 'A2', stem: 'Ayer ___ al cine con mis amigos.', options: ['fui', 'voy', 'iré', 'he ido'], why: 'Ayer указывает на завершённый день в прошлом, нужен pretérito indefinido. Глагол ir в этом времени: fui, fuiste, fue.' },
    { level: 'A2', stem: 'A mí me ___ mucho los gatos.', options: ['gustan', 'gusta', 'gusto', 'gustas'], why: 'Подлежащее здесь los gatos: коты нравятся мне. Оно во множественном числе, поэтому gustan.' },
    { level: 'B1', stem: 'Cuando era niño, ___ al fútbol todos los días.', options: ['jugaba', 'jugué', 'juego', 'jugaría'], why: 'Привычка в прошлом передаётся через pretérito imperfecto. Сигналы здесь: cuando era niño и todos los días.' },
    { level: 'B1', stem: 'Busco un piso que ___ cerca del metro.', options: ['esté', 'está', 'es', 'estará'], why: 'Такой квартиры пока нет, мы её только ищем. Когда предмет неопределён, в придаточном ставим subjuntivo: esté.' },
    { level: 'B2', stem: 'Si tuviera más tiempo, ___ español todos los días.', options: ['estudiaría', 'estudiaré', 'estudio', 'estudié'], why: 'Нереальное условие: si + imperfecto de subjuntivo, в главной части condicional. Получается estudiaría.' },
    { level: 'B2', stem: 'Me pidió que le ___ la verdad.', options: ['dijera', 'digo', 'diré', 'decía'], why: 'После pedir que нужен subjuntivo. Главный глагол в прошедшем времени, значит и subjuntivo прошедшего времени: dijera.' },
    { level: 'C1', stem: 'De haberlo sabido antes, no ___ ese piso.', options: ['habría alquilado', 'alquilaría', 'había alquilado', 'alquilé'], why: 'De haberlo sabido значит «если бы я знал». Это нереальное условие в прошлом, поэтому нужен condicional compuesto.' },
  ],
  fr: [
    { level: 'A1', stem: 'Nous ___ français.', options: ['parlons', 'parlez', 'parlent', 'parle'], why: 'С местоимением nous глаголы первой группы получают окончание -ons.' },
    { level: 'A2', stem: 'Hier, ___ au marché.', options: ['je suis allé(e)', 'j\'ai allé', 'je vais', 'j\'irai'], why: 'Hier требует прошедшего времени passé composé. Глагол aller образует его с помощью être, а не avoir.' },
    { level: 'A2', stem: 'Il n\'y a pas ___ pain à la maison.', options: ['de', 'du', 'le', 'un'], why: 'После отрицания частичный артикль du превращается в de: du pain, но pas de pain.' },
    { level: 'B1', stem: 'Les fleurs ___ j\'ai achetées sont rouges.', options: ['que', 'qui', 'dont', 'où'], why: 'Цветы здесь прямое дополнение: я купил что? Для прямого дополнения используем que. Подлежащее в этой части уже есть: j\'.' },
    { level: 'B1', stem: 'Si j\'avais de l\'argent, je ___ une voiture.', options: ['achèterais', 'achèterai', 'achetais', 'achète'], why: 'После si с imparfait в главной части ставим conditionnel présent. Окончание -ais отличает его от будущего времени.' },
    { level: 'B2', stem: 'Il faut que tu ___ ce soir.', options: ['viennes', 'viens', 'viendras', 'venais'], why: 'После il faut que всегда идёт subjonctif. Для venir во втором лице это viennes.' },
    { level: 'B2', stem: 'Bien qu\'il ___ malade, il est venu travailler.', options: ['soit', 'est', 'sera', 'était'], why: 'Союз bien que («хотя») требует subjonctif, даже если речь идёт о реальном факте. Форма être для il: soit.' },
    { level: 'C1', stem: 'C\'est une qualité ___ il a toujours fait preuve.', options: ['dont', 'que', 'laquelle', 'à laquelle'], why: 'Выражение faire preuve de управляется предлогом de, поэтому нужно dont. Que здесь не подходит, так как дополнение косвенное.' },
  ],
  de: [
    { level: 'A1', stem: 'Ich ___ aus Russland.', options: ['komme', 'kommst', 'kommt', 'kommen'], why: 'С местоимением ich глагол в настоящем времени получает окончание -e.' },
    { level: 'A2', stem: 'Ich habe ___ Bruder.', options: ['einen', 'ein', 'einem', 'eine'], why: 'Глагол haben требует винительного падежа. Bruder мужского рода, поэтому артикль ein меняется на einen.' },
    { level: 'A2', stem: 'Gestern ___ ich ins Kino gegangen.', options: ['bin', 'habe', 'hatte', 'werde'], why: 'Глаголы движения образуют Perfekt с sein. Поэтому ich bin gegangen, а не ich habe gegangen.' },
    { level: 'B1', stem: 'Ich weiß, dass ___.', options: ['er morgen kommt', 'er kommt morgen', 'kommt er morgen', 'morgen er kommt'], why: 'В придаточном с dass спрягаемый глагол уходит в самый конец предложения.' },
    { level: 'B1', stem: 'Das ist der Mann, ___ ich gestern geholfen habe.', options: ['dem', 'den', 'der', 'dessen'], why: 'Глагол helfen управляет дательным падежом, как и русское «помогать кому». Для мужского рода это dem.' },
    { level: 'B2', stem: 'Wenn ich mehr Zeit ___, würde ich öfter reisen.', options: ['hätte', 'habe', 'hatte', 'haben'], why: 'Это нереальное условие, нужен Konjunktiv II. Умлаут здесь решает всё: hätte значит «было бы», а hatte просто «было».' },
    { level: 'B2', stem: 'Das Haus ___ im Jahr 1900 gebaut.', options: ['wurde', 'hat', 'hatte', 'machte'], why: 'Дом построили, это пассив. Он образуется с werden, в прошедшем времени wurde.' },
    { level: 'C1', stem: 'Er tat so, als ___ er nichts davon gewusst.', options: ['hätte', 'hat', 'hatte', 'wäre'], why: 'После als ob или просто als ставим сослагательное наклонение. Глагол wissen образует прошедшее время с haben, отсюда hätte gewusst.' },
  ],
};

export const COURSES = [
  { id: 'talk', name: () => 'Разговорный', text: 'Большую часть занятия говорите вы: диалоги, споры, рабочие и бытовые сценки.', k: 1 },
  { id: 'work', name: () => 'Для работы', text: 'Письма, созвоны, презентации и лексика вашей сферы.', k: 1.15 },
  { id: 'exam', name: (exam) => `Подготовка к ${exam}`, text: 'Формат экзамена, пробные варианты и проверка письменных работ.', k: 1.25, minLevel: 'B1' },
];

export const FORMATS = [
  { id: 'group', name: 'Группа', note: 'до 6 человек', price: 690 },
  { id: 'pair', name: 'В паре', note: 'с партнёром вашего уровня', price: 1090 },
  { id: 'solo', name: 'Один на один', note: 'с преподавателем', price: 1790 },
];

export const LEVEL_ADD = { A1: 0, A2: 0, B1: 0, B2: 100, C1: 200 };
export const TERM_DISCOUNT = { 1: 0, 3: 8, 6: 15 };
export const INTENSIVE_DISCOUNT = 5; // при трёх занятиях в неделю

export const TEACHERS = [
  { id: 'daniel', lang: 'en', name: 'Дэниел Уитлок', from: 'Родной английский, Лидс', years: 12, levels: 'B1-C1', cert: 'CELTA, подготовка к IELTS', wrong: 'I am agree', right: 'I agree', slot: 'вт 19:00' },
  { id: 'anna', lang: 'en', name: 'Анна Терехова', from: 'Жила в Эдинбурге 6 лет', years: 9, levels: 'A1-B2', cert: 'CELTA', wrong: 'Explain me', right: 'Explain to me', slot: 'ср 08:30' },
  { id: 'lucia', lang: 'es', name: 'Лусия Морено', from: 'Родной испанский, Валенсия', years: 10, levels: 'B1-C1', cert: 'Подготовка к DELE', wrong: 'Estoy de Moscú', right: 'Soy de Moscú', slot: 'чт 18:00' },
  { id: 'gleb', lang: 'es', name: 'Глеб Савин', from: 'Переводчик, жил в Севилье', years: 7, levels: 'A1-B1', cert: 'Диплом филолога-испаниста', wrong: 'La problema', right: 'El problema', slot: 'пн 20:00' },
  { id: 'camille', lang: 'fr', name: 'Камий Лефевр', from: 'Родной французский, Лион', years: 11, levels: 'A2-C1', cert: 'Подготовка к DELF и DALF', wrong: 'Je vais à la France', right: 'Je vais en France', slot: 'вт 17:30' },
  { id: 'olga', lang: 'fr', name: 'Ольга Мельник', from: 'Училась в Гренобле', years: 14, levels: 'A1-B2', cert: 'Магистр французской филологии', wrong: 'Je suis 30 ans', right: 'J\'ai 30 ans', slot: 'сб 11:00' },
  { id: 'jonas', lang: 'de', name: 'Йонас Хартманн', from: 'Родной немецкий, Гамбург', years: 16, levels: 'B1-C1', cert: 'Подготовка к Goethe-Zertifikat', wrong: 'Ich bin kalt', right: 'Mir ist kalt', slot: 'ср 19:30' },
  { id: 'vera', lang: 'de', name: 'Вера Лукина', from: 'Работала в Вене', years: 8, levels: 'A1-B2', cert: 'Диплом германиста', wrong: 'Ich gehe zu Hause', right: 'Ich gehe nach Hause', slot: 'пт 18:30' },
];

export const GOALS = { work: 'Работа', move: 'Переезд', exam: 'Экзамен', self: 'Для себя' };

export const REVIEWS = [
  { lang: 'en', goal: 'work', name: 'Кирилл Назаров', role: 'бэкенд-разработчик', from: 'B1', to: 'B2', months: 7, big: true, text: 'Перестал писать ответы для созвонов заранее. На ретро теперь спорю с лидом по-английски, и это обычный рабочий разговор.' },
  { lang: 'es', goal: 'move', name: 'Алина Рахимова', role: 'маркетолог', from: 'A2', to: 'B1', months: 6, text: 'Сняла квартиру в Валенсии без посредника и сама разобралась с договором. Лусия заранее прогнала со мной все разговоры с агентом.' },
  { lang: 'de', goal: 'exam', name: 'Мадина Тлеубаева', role: 'врач', from: 'A2', to: 'B1', months: 8, text: 'Сдала Goethe B1 с первого раза. Больше всего помогли пробные устные части: на экзамене уже ничего не удивило.' },
  { lang: 'fr', goal: 'self', name: 'Илья Веденеев', role: 'звукорежиссёр', from: 'A1', to: 'A2', months: 5, big: true, text: 'Начал ради песен, которые слушал со школы. Теперь понимаю половину текстов и больше не боюсь заказывать кофе в Париже.' },
  { lang: 'en', goal: 'exam', name: 'Дарья Панина', role: 'студентка магистратуры', from: 'B2', to: 'C1', months: 4, text: 'IELTS сдала на 7.0 со второго раза. Дэниел разбирал каждое эссе по абзацам, пока я не перестала лить воду.' },
  { lang: 'de', goal: 'work', name: 'Андрей Копылов', role: 'инженер-конструктор', from: 'B1', to: 'B2', months: 9, big: true, text: 'Йонас заставил меня говорить про допуски и чертежи по-немецки. Через девять месяцев я веду совещания с заводом без переводчика.' },
  { lang: 'es', goal: 'self', name: 'Роман Шевчук', role: 'архитектор', from: 'A2', to: 'B2', months: 14, text: 'Хотел читать Маркеса в оригинале. Со словарём осилил «Полковнику никто не пишет», сейчас читаю длинный роман почти без него.' },
  { lang: 'fr', goal: 'move', name: 'Ксения Дробот', role: 'абитуриентка', from: 'A2', to: 'B2', months: 12, text: 'Поступила в университет в Гренобле. Ольга помогла и с DELF B2, и с мотивационным письмом, которое я переписала четыре раза.' },
  { lang: 'en', goal: 'self', name: 'Тимофей Глушков', role: 'пенсионер', from: 'A1', to: 'A2', months: 6, text: 'Начинал с нуля в 61 год. Анна ни разу не дала почувствовать себя старым и медленным. В Лондоне сам нашёл дорогу до музея.' },
  { lang: 'fr', goal: 'work', name: 'Екатерина Лаптева', role: 'закупщица вин', from: 'B1', to: 'B2', months: 8, big: true, text: 'Раньше переговоры с поставщиками шли через коллегу. Теперь езжу в Бургундию сама и торгуюсь сама.' },
  { lang: 'es', goal: 'exam', name: 'Полина Сорокина', role: 'переводчица', from: 'B1', to: 'B2', months: 7, text: 'DELE B2 был нужен для работы. Глеб и Лусия вели меня по очереди: один отвечал за грамматику, другая за живую речь.' },
  { lang: 'de', goal: 'move', name: 'Лев Абрамов', role: 'айтишник', from: 'A1', to: 'B1', months: 11, text: 'Переехал в Берлин по рабочей визе. Благодаря Вере смог сам записаться в бюргерамт и объяснить врачу, что болит.' },
];
