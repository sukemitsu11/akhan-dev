import {
  company,
  services,
  prices,
  objectTypes,
  cleaningOptions,
  extras,
  reviews,
  locations,
  faqs,
  beforeAfter,
  money,
} from "./content.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [
  ...scope.querySelectorAll(selector),
];
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

$$("[data-phone]").forEach((a) => {
  a.href = company.phoneHref;
  if (!a.textContent.trim()) a.textContent = company.phone;
});
$$("[data-whatsapp]").forEach((a) => (a.href = company.whatsapp));
$("#year").textContent = new Date().getFullYear();
$("#furniture-price").textContent = money(
  services.find((s) => s.id === "furniture").price,
);
$("#quick-prices").innerHTML = ["express", "general", "renovation"]
  .map((id) => {
    const s = services.find((s) => s.id === id);
    return `<article class="price-item"><h3 class="price-name">${s.short}</h3><p class="price"><span class="from">от</span>${money(s.price)}</p><button data-service="${s.id}" data-start>Выбрать уборку</button></article>`;
  })
  .join("");
$("#service-list").innerHTML = services
  .map(
    (s) =>
      `<article class="service-row"><div class="service-row-head"><h3>${s.title}</h3><span class="service-price">от ${money(s.price)}</span></div><p>${s.description}</p><button data-service="${s.id}" data-start>Выбрать услугу</button></article>`,
  )
  .join("");
$("#locations").innerHTML =
  locations
    .map(
      (l) =>
        `<article class="location"><h3>${l.address}</h3><p>Новоград<br>${l.hours}</p><a href="${l.route}" class="text-link" target="_blank" rel="noopener noreferrer">Построить маршрут</a></article>`,
    )
    .join("") +
  `<a href="https://example.com/demo-location" class="location-branches" target="_blank" rel="noopener noreferrer">Посмотреть филиалы в 2ГИС</a>`;
$("#faq-list").innerHTML = faqs
  .map(
    (f) =>
      `<details class="faq-item"><summary>${f.question}</summary><p>${f.answer}</p></details>`,
  )
  .join("");

const menu = $(".menu-toggle");
function closeMenu() {
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-label", "Открыть меню");
  $("#mobile-menu").hidden = true;
}
menu.addEventListener("click", () => {
  const expanded = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!expanded));
  menu.setAttribute("aria-label", expanded ? "Открыть меню" : "Закрыть меню");
  $("#mobile-menu").hidden = expanded;
});
$$("#mobile-menu a").forEach((a) => a.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$("#mobile-menu").hidden) {
    closeMenu();
    menu.focus();
  }
});
addEventListener(
  "scroll",
  () => $(".header").classList.toggle("scrolled", scrollY > 15),
  { passive: true },
);

let includedId = "general";
function renderIncluded(focus = false) {
  $("#included-tabs").innerHTML = services
    .map(
      (s) =>
        `<button id="tab-${s.id}" class="tab" role="tab" aria-selected="${s.id === includedId}" aria-controls="included-content" tabindex="${s.id === includedId ? 0 : -1}" data-included="${s.id}">${s.short}</button>`,
    )
    .join("");
  const s = services.find((s) => s.id === includedId);
  $("#included-content").setAttribute("aria-labelledby", `tab-${s.id}`);
  $("#included-content").innerHTML =
    `<div class="included-grid">${Object.entries(s.items)
      .map(
        ([title, items]) =>
          `<div><h3>${title}</h3><ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`,
      )
      .join("")}</div>`;
  $$("[data-included]").forEach((b) =>
    b.addEventListener("click", () => {
      includedId = b.dataset.included;
      renderIncluded(true);
    }),
  );
  if (focus) $(`#tab-${includedId}`).focus();
}
renderIncluded();
$("#included-tabs").addEventListener("keydown", (e) => {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
  e.preventDefault();
  let i = services.findIndex((s) => s.id === includedId);
  i =
    e.key === "Home"
      ? 0
      : e.key === "End"
        ? services.length - 1
        : (i + (e.key === "ArrowRight" ? 1 : -1) + services.length) %
          services.length;
  includedId = services[i].id;
  renderIncluded(true);
});

let reviewIndex = 0;
function renderReview() {
  const r = reviews[reviewIndex];
  $("#review-content").innerHTML =
    `<p class="review-service">${r.service} · пример отзыва</p><blockquote>«${escapeHtml(r.quote)}»</blockquote><div class="review-byline"><span>${r.name}</span><a href="${r.source}" target="_blank" rel="noopener noreferrer">Демонстрационный отзыв</a><span class="muted">Вымышленный отзыв</span></div>`;
  $("#review-count").textContent =
    `${String(reviewIndex + 1).padStart(2, "0")} / ${String(reviews.length).padStart(2, "0")}`;
}
$("#review-prev").addEventListener("click", () => {
  reviewIndex = (reviewIndex - 1 + reviews.length) % reviews.length;
  renderReview();
});
$("#review-next").addEventListener("click", () => {
  reviewIndex = (reviewIndex + 1) % reviews.length;
  renderReview();
});
renderReview();

// Only mount a comparison when a verified pair has been supplied.
beforeAfter.forEach((item, i) => {
  const el = document.createElement("div");
  el.className = "compare";
  el.innerHTML = `<img src="${escapeHtml(item.after)}" alt="После: ${escapeHtml(item.alt)}"><img class="compare-before" src="${escapeHtml(item.before)}" alt="До: ${escapeHtml(item.alt)}" style="clip-path:inset(0 50% 0 0)"><input type="range" min="0" max="100" value="50" aria-label="Сравнить до и после: ${escapeHtml(item.alt)}">`;
  el.querySelector("input").addEventListener("input", (e) => {
    el.querySelector(".compare-before").style.clipPath =
      `inset(0 ${100 - Number(e.target.value)}% 0 0)`;
  });
  $("#before-after-gallery").append(el);
});

let mode = "demo";
let legalReady = false;
let transport = "server";
const apiReady = fetch("/demos/list/demo-config.json")
  .then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  })
  .then((c) => {
    mode = c.mode;
    legalReady = c.legalReady;
    transport = c.mode === "demo" && c.transport === "browser" ? "browser" : "server";
    if (!busy) renderCalc();
  })
  .catch(() => {
    mode = "unavailable";
    if (!busy) renderCalc();
  });
const state = {
  object: "Квартира",
  cleaning: "general",
  area: 64,
  extras: [],
  comment: "",
  files: [],
  timing: "Как можно скорее",
  date: "",
  channel: "WhatsApp",
  contact: "",
  consent: false,
  website: "",
};
let step = 0,
  busy = false,
  receipt = null,
  requestId = crypto.randomUUID(),
  startedAt = Date.now();
const stepTitles = [
  "Что нужно убрать?",
  "Какая уборка нужна?",
  "Какая площадь?",
  "Что добавить?",
  "Хотите показать объект?",
  "Когда нужна уборка?",
  "Как с вами связаться?",
];
const stepDescriptions = [
  "Выберите тип объекта.",
  "Если сомневаетесь, выберите «Пока не знаю».",
  "Укажите примерную площадь помещения.",
  "Можно выбрать несколько услуг или продолжить без них.",
  "Фото необязательно, но поможет оценить объём работы.",
  "Это пожелание. Время подтвердим при согласовании.",
  "Оставьте удобный контакт для предварительного расчёта.",
];
const calc = $("#calculator-app");
function choices(items, selected, key, multiple = false) {
  return `<div class="options ${multiple ? "multi" : ""}" role="group" aria-label="${stepTitles[step]}">${items
    .map((x) => {
      const value = typeof x === "string" ? x : x.id,
        label = typeof x === "string" ? x : x.label;
      return `<button type="button" class="option" data-key="${key}" data-value="${escapeHtml(value)}" aria-pressed="${multiple ? selected.includes(value) : selected === value}"><span>${escapeHtml(label)}</span><span class="option-indicator" aria-hidden="true"></span></button>`;
    })
    .join("")}</div>`;
}
function snapshotFields() {
  $$("[data-field]", calc).forEach((el) => {
    state[el.dataset.field] =
      el.type === "checkbox"
        ? el.checked
        : el.type === "number"
          ? Number(el.value)
          : el.value;
  });
}
function contentForStep() {
  switch (step) {
    case 0:
      return choices(objectTypes, state.object, "object");
    case 1:
      return choices(cleaningOptions, state.cleaning, "cleaning");
    case 2:
      return `<label for="area" class="field-label">Площадь объекта</label><div class="area-field"><input class="input" id="area" data-field="area" type="number" min="10" max="2000" step="1" inputmode="numeric" value="${state.area}" aria-describedby="area-help"><span>м²</span></div><input class="area-range" id="area-range" type="range" min="10" max="300" value="${Math.min(state.area, 300)}" aria-label="Изменить площадь"><div class="range-labels"><span>10 м²</span><span>300 м²</span></div><p id="area-help" class="small muted">Для площади больше 300 м² введите число вручную.</p>`;
    case 3:
      return (
        choices(extras, state.extras, "extras", true) +
        `<label class="form-field"><span>Другие задачи или пожелания</span><textarea class="input" data-field="comment" maxlength="1000" placeholder="Например, уделить внимание кухне">${escapeHtml(state.comment)}</textarea></label>`
      );
    case 4:
      return `<label class="upload-area"><span class="upload-plus" aria-hidden="true">+</span><strong>Добавить фотографии</strong><span>До 5 фото · до 5 МБ каждое · до 10 МБ всего<br>JPG, PNG, WebP, AVIF</span><input id="photo-upload" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif,.heic,.heif" multiple aria-label="Добавить до пяти фотографий"></label><div class="previews">${state.files.map((f, i) => `<div class="preview">${f.preview ? `<img src="${f.preview}" alt="Фото объекта ${i + 1}" data-preview="${i}">` : `<div class="file-fallback">${escapeHtml(f.file.name)}<br>Файл добавлен</div>`}<button type="button" data-remove="${i}" aria-label="Удалить фотографию ${i + 1}">×</button></div>`).join("")}</div><p class="small muted" style="margin-top:15px">Не добавляйте документы и фотографии людей. Если фото HEIC не откроется, выберите JPG.</p>`;
    case 5:
      return (
        choices(
          ["Как можно скорее", "Сегодня", "Завтра", "Выбрать дату"],
          state.timing,
          "timing",
        ) +
        (state.timing === "Выбрать дату"
          ? `<label class="form-field"><span>Желаемая дата</span><input class="input" type="date" data-field="date" min="${today()}" value="${escapeHtml(state.date)}"></label>`
          : "")
      );
    case 6:
      return (
        choices(["Telegram", "WhatsApp", "Телефон"], state.channel, "channel") +
        `<label class="form-field"><span>${state.channel === "Telegram" ? "Ваш Telegram или номер телефона" : "Номер телефона"}</span><input class="input" id="contact" data-field="contact" type="${state.channel === "Telegram" ? "text" : "tel"}" autocomplete="${state.channel === "Telegram" ? "off" : "tel"}" maxlength="60" placeholder="${state.channel === "Telegram" ? "@username или +7 (000) 000-00-00" : "+7 (000) 000-00-00"}" value="${escapeHtml(state.contact)}" aria-describedby="contact-help"><span id="contact-help" class="small muted">${state.channel === "Telegram" ? "Укажите имя пользователя от 5 символов или номер телефона." : "Используйте номер с кодом страны."}</span></label><label class="consent"><input type="checkbox" data-field="consent" ${state.consent ? "checked" : ""}><span>Согласен на <button type="button" data-legal="consent">обработку данных</button> для расчёта стоимости. <button type="button" data-legal="privacy">Конфиденциальность</button></span></label><label class="hp" aria-hidden="true">Ваш сайт<input data-field="website" tabindex="-1" autocomplete="off" value=""></label>`
      );
  }
}
function modeNote() {
  return mode === "demo"
    ? "Демо-режим: можно пройти форму. Данные не отправляются менеджеру и не сохраняются."
    : mode === "unavailable"
      ? "Приём заявок временно недоступен. Вы можете позвонить или написать в WhatsApp."
      : "Предварительный расчёт уточнит менеджер. Выбранная дата не является подтверждённой записью.";
}
function renderCalc(focus = false) {
  if (receipt) {
    renderSuccess();
    return;
  }
  calc.innerHTML = `<form id="lead-form" novalidate><div class="calc-topline"><span>Ваша заявка</span><span>Шаг ${step + 1} / ${stepTitles.length}</span></div><div class="progress" role="progressbar" aria-label="Заполнение заявки" aria-valuemin="0" aria-valuemax="7" aria-valuenow="${step + 1}"><span style="width:${((step + 1) / 7) * 100}%"></span></div><div class="reveal"><h3 class="calc-title" tabindex="-1">${stepTitles[step]}</h3><p class="calc-description">${stepDescriptions[step]}</p>${contentForStep()}</div><p class="form-error" id="calc-error" role="alert"></p><div class="calc-footer">${step ? '<button type="button" class="back-button" id="calc-back">Назад</button>' : '<span class="small muted">Без регистрации</span>'}<button type="submit" class="button" id="calc-next">${step === 6 ? "Получить расчёт" : "Продолжить"}</button></div><p class="calc-note">${modeNote()}</p></form>`;
  $$("[data-key]", calc).forEach((b) =>
    b.addEventListener("click", () => {
      snapshotFields();
      const { key, value } = b.dataset;
      if (key === "extras")
        state.extras = state.extras.includes(value)
          ? state.extras.filter((x) => x !== value)
          : [...state.extras, value];
      else state[key] = value;
      renderCalc();
      const selected = $$("[data-key]", calc).find(
        (x) => x.dataset.key === key && x.dataset.value === value,
      );
      selected?.focus({ preventScroll: true });
    }),
  );
  $("#calc-back", calc)?.addEventListener("click", () => {
    snapshotFields();
    step--;
    renderCalc(true);
  });
  $("#lead-form", calc).addEventListener("submit", onNext);
  $("#area", calc)?.addEventListener("input", (e) => {
    state.area = Number(e.target.value);
    $("#area-range").value = Math.min(state.area, 300);
  });
  $("#area-range", calc)?.addEventListener("input", (e) => {
    state.area = Number(e.target.value);
    $("#area").value = state.area;
  });
  $("#photo-upload", calc)?.addEventListener("change", onPhotos);
  $$("[data-preview]", calc).forEach((img) =>
    img.addEventListener("error", () => {
      const f = state.files[Number(img.dataset.preview)];
      if (!f || !img.isConnected) return;
      img.replaceWith(
        Object.assign(document.createElement("span"), {
          className: "file-fallback",
          textContent: `${f.file.name} · файл добавлен`,
        }),
      );
    }),
  );
  $$("[data-remove]", calc).forEach((b) =>
    b.addEventListener("click", () => {
      const preview = b.closest(".preview")?.querySelector("img");
      preview?.removeAttribute("src");
      const [f] = state.files.splice(Number(b.dataset.remove), 1);
      URL.revokeObjectURL(f.preview);
      renderCalc();
    }),
  );
  if (focus) {
    $(".calc-title", calc).focus({ preventScroll: true });
    if (matchMedia("(max-width:767px)").matches)
      calc
        .closest(".calc-panel")
        .scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
            ? "auto"
            : "smooth",
          block: "start",
        });
  }
}
function showError(message, field) {
  $("#calc-error", calc).textContent = message;
  if (field) {
    const el = $(field, calc);
    el?.setAttribute("aria-invalid", "true");
    el?.focus();
  }
}
async function onPhotos(e) {
  const incoming = [...e.target.files];
  if (state.files.length + incoming.length > 5) {
    showError(
      "Можно добавить не больше 5 фотографий. Удалите лишние и попробуйте ещё раз.",
    );
    e.target.value = "";
    return;
  }
  const allowed = /\.(jpe?g|png|webp|heic|heif|avif)$/i;
  for (const file of incoming) {
    if (
      !allowed.test(file.name) ||
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
        "image/avif",
        "",
      ].includes(file.type)
    ) {
      showError("Добавьте фотографии JPG, PNG, WebP, HEIC, HEIF или AVIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024 || !file.size) {
      showError("Каждое фото должно быть не пустым и не больше 5 МБ.");
      return;
    }
  }
  if (
    [...state.files.map((f) => f.file), ...incoming].reduce(
      (sum, f) => sum + f.size,
      0,
    ) >
    10 * 1024 * 1024
  ) {
    showError("Общий размер фото не должен превышать 10 МБ.");
    return;
  }
  incoming.forEach((file) =>
    state.files.push({ file, preview: URL.createObjectURL(file) }),
  );
  renderCalc();
}
function validContact() {
  const digits = state.contact.replace(/\D/g, "");
  return (
    (state.channel === "Telegram" &&
      /^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(state.contact)) ||
    (/^\+?[\d\s()\-]+$/.test(state.contact) &&
      digits.length >= 10 &&
      digits.length <= 15)
  );
}
async function onNext(event) {
  event.preventDefault();
  if (busy) return;
  snapshotFields();
  if (
    step === 2 &&
    (!Number.isInteger(state.area) || state.area < 10 || state.area > 2000)
  ) {
    showError("Укажите площадь от 10 до 2 000 м².", "#area");
    return;
  }
  if (
    step === 5 &&
    state.timing === "Выбрать дату" &&
    (!state.date || state.date < today())
  ) {
    showError("Выберите сегодняшнюю или будущую дату.", "input[type=date]");
    return;
  }
  if (step < 6) {
    step++;
    renderCalc(true);
    return;
  }
  state.contact = state.contact.trim();
  if (!validContact()) {
    showError(
      state.channel === "Telegram"
        ? "Укажите @username от 5 символов или корректный номер телефона."
        : "Проверьте номер: нужно от 10 до 15 цифр.",
      "#contact",
    );
    return;
  }
  if (!state.consent) {
    showError(
      "Нужно согласие на обработку данных для расчёта стоимости.",
      "input[type=checkbox]",
    );
    return;
  }
  busy = true;
  const button = $("#calc-next", calc);
  $$("button,input,textarea", calc).forEach((el) => (el.disabled = true));
  button.textContent = "Готовим заявку…";
  $("#calc-error", calc).textContent = "";
  try {
    await apiReady;
    if (mode === "unavailable")
      throw new Error(
        "Сервис расчёта недоступен. Позвоните или напишите в WhatsApp.",
      );
    if (mode === "demo" && transport === "browser") {
      receipt = { id: requestId, mode: "demo", createdAt: new Date().toISOString() };
      renderCalc(true);
      return;
    }
    const photos = await Promise.all(
      state.files.map(async ({ file }) => ({
        name: file.name,
        type:
          file.type ||
          `image/${file.name.toLowerCase().endsWith(".jpg") ? "jpeg" : file.name.split(".").pop().toLowerCase()}`,
        data: await readBase64(file),
      })),
    );
    const response = await fetch("/demos/list/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": requestId,
      },
      body: JSON.stringify({
        object: state.object,
        cleaning: state.cleaning,
        area: state.area,
        extras: state.extras,
        comment: state.comment,
        photos,
        timing: state.timing,
        date: state.date,
        channel: state.channel,
        contact: state.contact,
        consent: state.consent,
        website: state.website,
        startedAt,
        pageUrl: location.origin + location.pathname,
      }),
      signal: AbortSignal.timeout(22000),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(
        data.error || "Не удалось получить расчёт. Попробуйте ещё раз.",
      );
    receipt = data;
    renderCalc(true);
  } catch (error) {
    showError(
      error.name === "TimeoutError"
        ? "Ответ задерживается. Повторите попытку или свяжитесь с нами напрямую."
        : error.message,
    );
  } finally {
    busy = false;
    if (!receipt) {
      $$("button,input,textarea", calc).forEach((el) => (el.disabled = false));
      button.textContent = "Получить расчёт";
    }
  }
}
function readBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () =>
      reject(
        new Error(
          "Не удалось прочитать фото. Удалите его и попробуйте ещё раз.",
        ),
      );
    reader.readAsDataURL(file);
  });
}
function renderSuccess() {
  const s = services.find((s) => s.id === state.cleaning);
  const demo = receipt.mode === "demo";
  calc.innerHTML = `<div class="reveal"><span class="success-mark" aria-hidden="true">✓</span><h3 class="calc-title" tabindex="-1">${demo ? "Всё готово.<br>Так выглядит ваша заявка." : "Спасибо. Получили информацию об объекте."}</h3><p class="calc-description">${demo ? "Это демонстрация. Заявка не отправлена менеджеру. Для настоящего расчёта позвоните или напишите в WhatsApp." : "Посмотрим параметры и свяжемся с вами для уточнения стоимости и времени."}</p><dl class="summary">${[
    ["Тип", state.object],
    ["Уборка", s?.title || "Нужен совет"],
    ["Площадь", state.area + " м²"],
    ["Дополнительно", state.extras.join(", ") || "Без дополнений"],
    ["Фото", String(state.files.length)],
    ["Когда", state.timing === "Выбрать дату" ? state.date : state.timing],
    ["Связь", state.channel],
    ["Контакт", state.contact],
  ]
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${escapeHtml(v)}</dd></div>`)
    .join(
      "",
    )}</dl><div class="success-actions"><a href="${company.whatsapp}" target="_blank" rel="noopener noreferrer" class="button">Написать в WhatsApp</a><button class="button button-outline" id="edit-request">Изменить заявку</button></div><p class="calc-note">${demo ? "Параметры можно скопировать и передать менеджеру." : "Дата уборки будет подтверждена отдельно."}</p><button class="back-button" id="copy-summary">Скопировать параметры</button></div>`;
  $(".calc-title", calc).focus({ preventScroll: true });
  $("#edit-request").addEventListener("click", () => {
    receipt = null;
    step = 0;
    requestId = crypto.randomUUID();
    startedAt = Date.now();
    renderCalc(true);
  });
  $("#copy-summary").addEventListener("click", async () => {
    const text = `Объект: ${state.object}\nУборка: ${s?.title || "Нужен совет"}\nПлощадь: ${state.area} м²\nДополнительно: ${state.extras.join(", ") || "нет"}\nПожелания: ${state.comment}\nДата: ${state.timing === "Выбрать дату" ? state.date : state.timing}\nСвязь: ${state.channel}, ${state.contact}`;
    try {
      await navigator.clipboard.writeText(text);
      $("#copy-summary").textContent = "Параметры скопированы";
    } catch {
      $("#copy-summary").textContent =
        "Копирование недоступно. Выделите текст заявки.";
    }
  });
}
renderCalc();
document.addEventListener("click", (e) => {
  const start = e.target.closest("[data-service]");
  if (start) {
    if (busy) {
      e.preventDefault();
      return;
    }
    snapshotFields();
    state.cleaning = start.dataset.service;
    receipt = null;
    requestId = crypto.randomUUID();
    step = 0;
    renderCalc();
    if (start.hasAttribute("data-start"))
      $("#calculator").scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
          ? "auto"
          : "smooth",
      });
  }
  const legal = e.target.closest("[data-legal]");
  if (legal) openLegal(legal.dataset.legal);
});

const dialog = $("#legal-dialog");
function openLegal(kind) {
  $("#legal-title").textContent =
    kind === "privacy" ? "Конфиденциальность" : "Обработка данных";
  $("#legal-copy").innerHTML =
    mode === "demo" || !legalReady
      ? "<p>Сейчас сайт работает как дизайн-концепт. Поля и фотографии используются для демонстрации формы. Сервер не сохраняет и не передаёт их компании.</p><p>Данные остаются в памяти открытой страницы до её закрытия или обновления. Обращение по телефону или через мессенджер происходит отдельно, по вашему действию.</p><p>Перед подключением настоящего приёма заявок владелец должен указать реквизиты оператора, адрес политики, цели, сроки и порядок обработки данных. Эта заметка описывает демо и не заменяет документы для публикации.</p>"
      : '<p>Документы об обработке данных доступны по ссылкам, указанным владельцем сервиса.</p><p><a href="/demos/list/api/legal/privacy">Политика конфиденциальности</a></p><p><a href="/demos/list/api/legal/consent">Согласие на обработку данных</a></p>';
  dialog.showModal();
}
$(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }
});

// Structured data reflects only public, verified content. Set SITE_URL at deployment before adding canonical URLs.
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "#business",
      name: company.name,
      telephone: company.phone,
      email: company.email,
      areaServed: "Новоград",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Улица Солнечная, 16",
        addressLocality: "Новоград",
        postalCode: "344103",
        addressCountry: "RU",
      },
      openingHours: "Mo-Su 08:00-20:00",
      sameAs: [company.source, company.vk],
    },
    ...services.map((s) => ({
      "@type": "Service",
      name: s.title,
      provider: { "@id": "#business" },
      areaServed: "Новоград",
      offers: {
        "@type": "Offer",
        priceCurrency: "RUB",
        priceSpecification: {
          "@type": "PriceSpecification",
          minPrice: s.price,
          priceCurrency: "RUB",
        },
      },
    })),
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Главная",
          item: location.origin + "/demos/list/",
        },
      ],
    },
  ],
};
const script = document.createElement("script");
script.type = "application/ld+json";
script.textContent = JSON.stringify(schema);
document.head.append(script);

if (
  "IntersectionObserver" in window &&
  !matchMedia("(prefers-reduced-motion:reduce)").matches
) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  $$(
    "section:not(.hero) h2, .service-photo, .result-photo, .furniture-photo",
  ).forEach((el) => observer.observe(el));
}
