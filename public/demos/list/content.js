/** @typedef {{id:string,title:string,short:string,description:string,price:number,unit:string,items:Record<string,string[]>}} Service */
/** @typedef {{serviceId:string,from:number,currency:string,source:string,verifiedAt:string}} Price */
/** @typedef {{name:string,quote:string,service:string,rating:number|null,date:string|null,source:string}} Review */
/** @typedef {{address:string,hours:string,phone:string,map:string,route:string}} Location */
/** @typedef {{question:string,answer:string}} FAQ */
/** @typedef {{src:string,alt:string,category:string,source:string}} GalleryItem */
/** @typedef {{before:string,after:string,alt:string,category:string,source:string}} BeforeAfterItem */
export const source = "https://example.com/demo-location";
export const company = {
  name: "Чистый лист",
  city: "Новоград",
  phone: "+7 (000) 000-00-00",
  phoneHref: "tel:+7 (000) 000-00-00",
  whatsapp: "https://example.com/demo-contact",
  vk: "https://example.com/demo-social",
  email: "hello@example.com",
  verifiedAt: "15 октября 2026",
  source,
};
/** @type {Service[]} */
export const services = [
  {
    id: "general",
    title: "Генеральная уборка",
    short: "Генеральная",
    price: 3500,
    unit: "за уборку",
    description:
      "Когда хочется основательно привести дом в порядок. От кухни и санузла до труднодоступных мест.",
    items: {
      Комнаты: [
        "Поверхности и зеркала",
        "Мебель внутри и снаружи",
        "Радиаторы, плинтусы и пол",
      ],
      Кухня: ["Кухонный гарнитур и фартук", "Бытовая техника", "Вытяжка"],
      Санузел: ["Сантехника", "Плитка", "Известковый налёт"],
    },
  },
  {
    id: "renovation",
    title: "После ремонта",
    short: "После ремонта",
    price: 5000,
    unit: "за уборку",
    description:
      "Строительная пыль и следы ремонта остаются позади. Можно обживаться и расставлять любимые вещи.",
    items: {
      Поверхности: ["Обеспыливание стен и потолков", "Мебель внутри и снаружи"],
      "Окна и пол": ["Стекло, рамы и подоконники", "Следы клея и затирки"],
      Санузел: ["Строительный налёт", "Сантехника и плитка"],
    },
  },
  {
    id: "express",
    title: "Экспресс-уборка",
    short: "Экспресс",
    price: 2000,
    unit: "за уборку",
    description:
      "Освежить квартиру между большими уборками: убрать пыль, вымыть полы, привести в порядок кухню и санузел.",
    items: {
      Комнаты: ["Открытые поверхности", "Сухая и влажная уборка пола"],
      Кухня: ["Столешницы", "Фасады техники"],
      Санузел: ["Унитаз и раковина", "Смесители"],
    },
  },
  {
    id: "windows",
    title: "Мойка окон",
    short: "Мойка окон",
    price: 400,
    unit: "точную стоимость уточним",
    description:
      "Больше дневного света. Вымоем стёкла, рамы, подоконники и откосы.",
    items: {
      Остекление: [
        "Стёкла с двух сторон",
        "Рамы и подоконники",
        "Откосы и фурнитура",
      ],
    },
  },
  {
    id: "furniture",
    title: "Химчистка мебели",
    short: "Химчистка",
    price: 500,
    unit: "точную стоимость уточним",
    description:
      "Диваны, кресла, стулья, матрасы и ковры. Оценим состояние по фотографии и подберём подходящую чистку.",
    items: { Текстиль: ["Мягкая мебель", "Матрасы", "Ковры"] },
  },
];
/** @type {Price[]} */
export const prices = services.map((s) => ({
  serviceId: s.id,
  from: s.price,
  currency: "RUB",
  source: source + "/demos/list/tab/prices",
  verifiedAt: "2026-10-15",
}));
export const objectTypes = ["Квартира", "Дом", "Офис", "Другое"];
export const cleaningOptions = [
  ...services.map((s) => ({ id: s.id, label: s.short })),
  { id: "unknown", label: "Пока не знаю" },
];
export const extras = [
  "Мойка окон",
  "Химчистка дивана",
  "Химчистка кресла",
  "Химчистка матраса",
  "Балкон",
];
/** @type {Review[]} Excerpts, 22 quoted words in total. Original dates/individual scores were not exposed. */
export const reviews = [
  {
    name: "Алексей Н.",
    quote: "В демонстрационном примере команда подготовила квартиру к переезду.",
    service: "После ремонта",
    rating: null,
    date: null,
    source: source + "/demos/list/tab/reviews",
  },
  {
    name: "Мария К.",
    quote:
      "Пример отзыва о чистке дивана: ткань стала заметно свежее.",
    service: "Химчистка мебели",
    rating: null,
    date: null,
    source: source + "/demos/list/tab/reviews",
  },
  {
    name: "Елена С.",
    quote: "Пример отзыва: уборку закончили в оговорённое время.",
    service: "Уборка кухни и окон",
    rating: null,
    date: null,
    source: source + "/demos/list/tab/reviews",
  },
];
/** @type {Location[]} */
export const locations = [
  {
    address: "Улица Солнечная, 16",
    hours: "Ежедневно, 08:00–20:00",
    phone: company.phone,
    map: source,
    route:
      "https://example.com/demo-location",
  },
  {
    address: "Улица Тихая, 8",
    hours: "Режим работы — в карточке филиала",
    phone: company.phone,
    map: "https://example.com/demo-location",
    route:
      "https://example.com/demo-location",
  },
];
/** @type {GalleryItem[]} */
export const gallery = [
  {
    src: "/demos/list/assets/company-windows.webp",
    alt: "Окна в процессе мойки: левая створка очищена, на правой видны загрязнения. Фото из карточки компании.",
    category: "Окна",
    source: source + "/demos/list/gallery",
  },
];
/** @type {BeforeAfterItem[]} Add only verified, matching photographs of the same object. */
export const beforeAfter = [];
/** @type {FAQ[]} */
export const faqs = [
  {
    question: "Что входит в генеральную уборку?",
    answer:
      "В карточке компании указаны уборка комнат, кухни и санузла, очистка поверхностей, мебели, радиаторов, плинтусов и полов. Подробности смотрите в разделе «Что входит». Окончательный состав согласуем для вашего объекта.",
  },
  {
    question: "Сколько времени занимает уборка?",
    answer:
      "Продолжительность зависит от площади, состояния помещения и выбранных задач. Укажите параметры и, если удобно, добавьте фотографии: время уточним при согласовании.",
  },
  {
    question: "Нужно ли предоставлять средства и инвентарь?",
    answer:
      "По информации компании в 2ГИС, клинеры приезжают со средствами и оборудованием. Если есть деликатные покрытия или особые требования, сообщите об этом заранее.",
  },
  {
    question: "Как рассчитывается стоимость?",
    answer:
      "На сайте указаны стартовые цены из прайса 2ГИС. Итог зависит от объёма работ. Заполните форму: менеджер уточнит детали и стоимость до согласования уборки.",
  },
  {
    question: "Можно ли заказать уборку после ремонта?",
    answer:
      "Да, такая услуга есть в прайсе компании. В форме выберите «После ремонта» и укажите площадь.",
  },
  {
    question: "Делаете ли вы химчистку мебели?",
    answer:
      "Да. В прайсе указана выездная химчистка мягкой мебели, ковров и матрасов. Можно выбрать её отдельно или добавить к уборке.",
  },
  {
    question: "Можно ли заказать мойку окон отдельно?",
    answer:
      "Да, сезонная мойка окон и мойка после ремонта представлены отдельными услугами. Выберите «Мойка окон» в форме.",
  },
  {
    question: "Как подготовиться к приезду клинера?",
    answer:
      "Подготовку и доступ к помещениям лучше согласовать с менеджером. Особые пожелания и информацию о поверхностях можно указать в комментарии к заявке.",
  },
];
export const money = (value) =>
  new Intl.NumberFormat("ru-RU").format(value) + " ₽";
export const getEstimate = () => null; // Connect only an owner-approved pricing formula here.
export const futureRoutes = {
  general: "/demos/list/general-cleaning",
  renovation: "/demos/list/after-renovation",
  express: "/demos/list/express-cleaning",
  windows: "/demos/list/window-cleaning",
  furniture: "/demos/list/furniture-cleaning",
};
