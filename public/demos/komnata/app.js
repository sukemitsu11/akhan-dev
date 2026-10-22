(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let opener;
  function openDialog(dialog, trigger) {
    opener = trigger;
    dialog.showModal();
  }
  $$('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('click', e => {
      const rect = dialog.getBoundingClientRect();
      if (e.target === dialog && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (opener?.isConnected) opener.focus();
      if (dialog.id === 'mobile-menu') $('.menu-toggle').setAttribute('aria-expanded', 'false');
    });
  });
  $('.menu-toggle').addEventListener('click', e => {
    e.currentTarget.setAttribute('aria-expanded', 'true');
    openDialog($('#mobile-menu'), e.currentTarget);
  });

  const picker = $('#picker');
  const form = $('#picker-form');
  const fields = $('#quiz-fields');
  const config = JSON.parse($('#quiz-config').textContent);
  const titles = ['Куда нужна мебель?','Что нужно подобрать?','Какие размеры учесть?','На какой бюджет ориентироваться?','Добавим фото или планировку?','Как с вами связаться?'];
  const labels = ['Комната','Предметы','Размеры','Бюджет','Фотографии','Контакт'];
  let step = 0, busy = false, checkingFiles = false, files = [], previewUrls = [], uploadVersion = 0;
  let submissionVersion = 0, activeController = null;
  let answers = {room:'',items:[],dimensions:'',budget:'',name:'',method:'phone',contact:'',consent:false,context:''};
  let requestId = crypto.randomUUID();
  function clearPreviews() { previewUrls.forEach(URL.revokeObjectURL); previewUrls = []; }
  function reset() {
    submissionVersion++; activeController?.abort(); activeController = null;
    step = 0; busy = false; checkingFiles = false; uploadVersion++; files = []; clearPreviews();
    answers = {room:'',items:[],dimensions:'',budget:'',name:'',method:'phone',contact:'',consent:false,context:''};
    requestId = crypto.randomUUID();
    form.hidden = false; $('#quiz-success').hidden = true;
    $('#quiz-next').disabled = false; $('#quiz-back').disabled = false;
  }
  function option(name,value,type,checked) {
    return `<label class="quiz-choice"><input type="${type}" name="${name}" value="${escape(value)}" ${checked?'checked':''}><span>${escape(value)}</span></label>`;
  }
  function save() {
    if(step === 0) {
      const room = $('input[name="room"]:checked', fields)?.value || '';
      if (room !== answers.room) answers.items = [];
      answers.room = room;
    }
    if(step === 1) answers.items = $$('input[name="item"]:checked', fields).map(el => el.value);
    if(step === 2) answers.dimensions = $('#dimensions').value.trim();
    if(step === 3) answers.budget = $('input[name="budget"]:checked',fields)?.value || '';
    if(step === 5) {
      answers.name = $('#customer-name').value.trim();
      answers.contact = $('#customer-contact').value.trim();
      answers.method = $('#contact-method').value;
      answers.consent = $('#consent').checked;
    }
  }
  function setError(text) { $('#quiz-error').textContent = text; }
  function contactValid(value,method) {
    if (method === 'telegram') return /^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(value) || validPhone(value);
    return validPhone(value);
  }
  function validPhone(value) {
    return /^[+\d\s()-]+$/.test(value) && value.replace(/\D/g,'').length >= 10 && value.replace(/\D/g,'').length <= 15;
  }
  function validate() {
    if(step === 0 && !answers.room) return 'Выберите комнату, для которой нужна мебель.';
    if(step === 1 && !answers.items.length) return 'Выберите хотя бы один предмет.';
    if(step === 3 && !answers.budget) return 'Выберите бюджет или «Пока не определился».';
    if(step === 5 && !contactValid(answers.contact,answers.method)) return answers.method === 'telegram'?'Введите Telegram, например @username, или номер телефона.':'Введите номер телефона с кодом города или оператора.';
    if(step === 5 && !answers.consent) return 'Подтвердите согласие на временную обработку данных.';
    return '';
  }
  function render() {
    setError(''); $('#step-count').textContent = `Шаг ${step + 1} из 6`; $('#step-label').textContent = labels[step];
    $('#picker-title').textContent = titles[step];
    $('#picker-context').hidden = !answers.context; $('#picker-context').textContent = answers.context;
    $('#quiz-back').hidden = step === 0;
    $('#quiz-next').textContent = step === 5 ? 'Получить подбор' : 'Далее';
    if(step === 0) fields.innerHTML = `<div class="quiz-options">${Object.keys(config.roomItems).map(r => option('room',r,'radio',answers.room === r)).join('')}</div>`;
    if(step === 1) fields.innerHTML = `<p class="quiz-hint">Можно выбрать несколько предметов.</p><div class="quiz-options">${config.roomItems[answers.room].map(item => option('item',item,'checkbox',answers.items.includes(item))).join('')}</div>`;
    if(step === 2) fields.innerHTML = `<p class="quiz-hint">Необязательно. Можно указать ширину комнаты, высоту потолка или размеры нужной мебели.</p><label class="field" for="dimensions">Размеры и пожелания<textarea id="dimensions" maxlength="500" placeholder="Например: комната 3 × 4 м, шкаф шириной до 180 см">${escape(answers.dimensions)}</textarea></label>`;
    if(step === 3) fields.innerHTML = `<div class="quiz-options">${config.budgets.map(b => option('budget',b,'radio',answers.budget === b)).join('')}</div>`;
    if(step === 4) {
      fields.innerHTML = '<p class="quiz-hint">До 3 изображений JPG, PNG или WebP, до 5 МБ каждое. Шаг можно пропустить. Файлы останутся в браузере.</p><label class="upload-box">Фото комнаты, планировка или пример мебели<input id="room-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple></label><div class="file-previews" id="file-previews"></div>';
      drawFiles(); $('#room-photos').addEventListener('change', onFiles);
    }
    if(step === 5) {
      fields.innerHTML = `<label class="field">Имя <span class="muted">(необязательно)</span><input id="customer-name" autocomplete="given-name" maxlength="100" value="${escape(answers.name)}"></label><label class="field">Способ связи<select id="contact-method"><option value="phone">Телефон</option><option value="telegram">Telegram</option><option value="whatsapp">WhatsApp</option></select></label><label class="field" for="customer-contact" id="contact-label">Номер телефона</label><input class="contact-input" id="customer-contact" autocomplete="tel" maxlength="50" value="${escape(answers.contact)}" required><label class="consent"><input type="checkbox" id="consent" ${answers.consent?'checked':''}><span>Согласен на временную обработку введённых данных для проверки демоформы. <a href="/demos/komnata/privacy" target="_blank" rel="noopener">О персональных данных</a></span></label>`;
      $('#contact-method').value = answers.method;
      function updateContact() {
        const telegram = $('#contact-method').value === 'telegram';
        $('#contact-label').textContent = telegram?'Telegram или номер телефона':'Номер телефона';
        $('#customer-contact').placeholder = telegram?'@username или +7 (000) 000-00-00':'+7 (000) 000-00-00';
        $('#customer-contact').inputMode = telegram?'text':'tel';
        $('#customer-contact').type = telegram?'text':'tel';
        $('#customer-contact').autocomplete = telegram?'off':'tel';
      }
      updateContact(); $('#contact-method').addEventListener('change', updateContact);
    }
    $('#picker-title').focus({preventScroll:true});
  }
  function drawFiles() {
    clearPreviews(); const container = $('#file-previews'); container.replaceChildren();
    files.forEach((file,index) => {
      const url = URL.createObjectURL(file); previewUrls.push(url);
      const wrap = document.createElement('div'); const img = document.createElement('img');
      img.src = url; img.alt = `Выбранное изображение ${index+1}`;
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Удалить';
      remove.setAttribute('aria-label',`Удалить изображение ${index+1}`);
      remove.addEventListener('click', () => { files.splice(index,1); drawFiles(); requestId = crypto.randomUUID(); });
      wrap.append(img,remove); container.append(wrap);
    });
  }
  async function onFiles(e) {
    const input = e.currentTarget; const candidates = [...input.files];
    if (candidates.length + files.length > 3) { setError('Можно добавить не больше 3 изображений.'); input.value=''; return; }
    const version = ++uploadVersion;
    checkingFiles = true; $('#quiz-next').disabled = true;
    try {
      for (const file of candidates) {
        if(file.size > 5*1024*1024 || file.size < 12) throw new Error('Каждое изображение должно быть не больше 5 МБ.');
        const bytes = new Uint8Array(await file.slice(0,12).arrayBuffer());
        const jpeg = file.type === 'image/jpeg' && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
        const png = file.type === 'image/png' && [137,80,78,71,13,10,26,10].every((b,i) => bytes[i] === b);
        const webp = file.type === 'image/webp' && String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP';
        if(!jpeg && !png && !webp) throw new Error('Выберите изображения в формате JPG, PNG или WebP.');
      }
      if (version !== uploadVersion) return;
      files.push(...candidates); drawFiles(); setError(''); requestId = crypto.randomUUID();
    } catch(error) { if (version === uploadVersion) setError(error.message); }
    finally { if(version === uploadVersion) { checkingFiles = false; $('#quiz-next').disabled = false; input.value=''; } }
  }
  $$('[data-pick]').forEach(button => button.addEventListener('click', e => {
    const menu = $('#mobile-menu'); if (menu.open) menu.close();
    reset(); answers.context = button.dataset.context || ''; answers.room = button.dataset.room || '';
    openDialog(picker,e.currentTarget); render();
  }));
  picker.addEventListener('cancel', e => { if(busy) e.preventDefault(); });
  picker.addEventListener('close',reset);
  $('#quiz-back').addEventListener('click', () => { if(busy || checkingFiles) return; save(); step--; render(); });
  $('#quiz-next').addEventListener('click', async () => {
    if(busy || checkingFiles) return; save(); const error=validate();
    if(error) { setError(error); return; }
    if(step < 5) { step++; requestId = crypto.randomUUID(); render(); return; }
    busy=true; $('#quiz-next').disabled=true; $('#quiz-back').disabled=true; $('#quiz-next').textContent='Проверяем подбор…';
    const version = submissionVersion;
    const controller = new AbortController(); activeController = controller;
    const timeout = setTimeout(() => controller.abort(),15000);
    try {
      const response = new Response(JSON.stringify({mode:'demo'}), {headers:{'Content-Type':'application/json'}});
      if(!response.ok) throw new Error('api');
      const result=await response.json(); if(result.mode !== 'demo') throw new Error('unexpected');
      if (version !== submissionVersion) return;
      const summary = `Здравствуйте! Хочу подобрать мебель.\nКомната: ${answers.room}\nПредметы: ${answers.items.join(', ')}\nРазмеры: ${answers.dimensions || 'пока не знаю'}\nБюджет: ${answers.budget}${answers.context?'\nИнтересует: '+answers.context:''}${answers.name?'\nИмя: '+answers.name:''}\nКонтакт (${answers.method}): ${answers.contact}`;
      $('#quiz-summary').textContent=summary;
      $('#quiz-whatsapp').href = `${config.phone}?text=${encodeURIComponent(summary)}`;
      $('#attachment-reminder').textContent=files.length?'Фотографии прикрепите в WhatsApp после открытия чата.':'Параметры можно дополнить в сообщении.';
      form.hidden=true; $('#quiz-success').hidden=false; $('#picker-title').textContent='Ваши пожелания собраны'; $('#picker-title').focus();
    } catch { if (version === submissionVersion) setError('Не получилось проверить заявку. Попробуйте ещё раз или свяжитесь с нами по телефону.'); }
    finally {
      clearTimeout(timeout);
      if (version === submissionVersion) { activeController = null; busy=false; $('#quiz-next').disabled=false; $('#quiz-back').disabled=false; $('#quiz-next').textContent='Получить подбор'; }
    }
  });
  form.addEventListener('submit', e => { e.preventDefault(); $('#quiz-next').click(); });
  $('#quiz-restart').addEventListener('click', () => { reset(); render(); });

  const search = $('#catalog-search');
  if(search) {
    const filterForm = $('#filter-form');
    const productNodes = $$('[data-product]');
    function filter() {
      const query=search.value.trim().toLowerCase(); const data=new FormData(filterForm);
      let count=0;
      productNodes.forEach(node => {
        node.hidden = Boolean((query && !node.dataset.name.includes(query)) || (data.get('style') && node.dataset.style !== data.get('style')) || (data.get('tone') && node.dataset.tone !== data.get('tone')));
        if(!node.hidden) count++;
      });
      $('#product-count').textContent=`Найдено: ${count}`; $('#catalog-empty').hidden=count>0;
    }
    search.addEventListener('input',filter);
    $('#filter-open').addEventListener('click', e => openDialog($('#filters'), e.currentTarget));
    filterForm.addEventListener('submit', e => {e.preventDefault();filter();$('#filters').close();});
    $$('[data-reset-filters]').forEach(button => button.addEventListener('click', () => {filterForm.reset();search.value='';filter();if($('#filters').open) $('#filters').close();}));
  }
  const lightbox = $('#lightbox');
  if(lightbox) {
    const thumbs = $$('[data-gallery-image]'); let selected=0;
    function show(index) {
      selected=(index+thumbs.length)%thumbs.length;
      const src=`/demos/komnata/assets/${thumbs[selected].dataset.galleryImage}.webp`;
      $('.gallery-main img').src=src; $('.gallery-main img').removeAttribute('srcset'); $('img',lightbox).src=src;
      thumbs.forEach((b,i) => b.setAttribute('aria-pressed',String(i === selected)));
      $('#gallery-count').textContent=`${selected+1} / ${thumbs.length}`;
    }
    thumbs.forEach((button,i) => button.addEventListener('click', () => show(i)));
    $('[data-gallery-open]').addEventListener('click', e => openDialog(lightbox,e.currentTarget));
    $('#gallery-prev').addEventListener('click', () => show(selected-1));
    $('#gallery-next').addEventListener('click', () => show(selected+1));
    lightbox.addEventListener('keydown',e => {if(e.key === 'ArrowLeft') show(selected-1);if(e.key === 'ArrowRight') show(selected+1);});
  }
})();
