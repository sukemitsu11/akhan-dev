import {createEstimateTransport} from './estimate-api.js';

const SERVICES = [
  ['film','Оклейка защитной плёнкой','Защита кузова'],['tint','Тонировка','Комфорт в салоне'],['sound','Шумоизоляция','Тишина в поездках'],
  ['polish','Полировка','Восстановление блеска'],['detail','Детейлинг','Уход за автомобилем'],['other','Другое','Ваша задача']
];
const CHANNELS = {telegram:'Telegram',whatsapp:'WhatsApp',phone:'Телефон'};
const MAX_SIZE = 5 * 1024 * 1024;
const TYPES = ['image/jpeg','image/png','image/webp','image/gif'];
const escapeId = () => 'estimate-'+crypto.randomUUID();
function phoneDigits(value) {
  let digits=value.replace(/\D/g,'');
  if(digits[0]==='8')digits='7'+digits.slice(1);
  if(digits && digits[0]!=='7')digits='7'+digits;
  return digits.slice(0,11);
}
export function formatPhone(value) {
  const digits=phoneDigits(value);
  if(!digits)return '';
  const national=digits.slice(1);
  let result='+7';
  if(national.length)result+=' ('+national.slice(0,3);
  if(national.length>=3)result+=')';
  if(national.length>3)result+=' '+national.slice(3,6);
  if(national.length>6)result+='-'+national.slice(6,8);
  if(national.length>8)result+='-'+national.slice(8,10);
  return result;
}
function readBase64(file) {
  return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(new Error('Не удалось прочитать фото'));reader.readAsDataURL(file);});
}
async function verifyImage(file) {
  if(!TYPES.includes(file.type))throw new Error('Подойдут JPG, PNG, WebP или GIF. Выберите другой файл.');
  if(!file.size || file.size>MAX_SIZE)throw new Error('Каждое фото должно быть не больше 5 МБ.');
  let bitmap;
  try { bitmap=await createImageBitmap(file); }
  catch { throw new Error('Не удалось открыть изображение. Выберите другое фото.'); }
  const valid=bitmap.width>0 && bitmap.height>0 && bitmap.width*bitmap.height<=40000000;
  bitmap.close();
  if(!valid)throw new Error('Фото слишком большое по разрешению. Подойдёт изображение до 40 мегапикселей.');
}

export class EstimateForm {
  constructor(root, {transport=createEstimateTransport(root.dataset.endpoint || '/demos/kontur/api/estimate')} = {}) {
    this.root=root;this.transport=transport;this.id=escapeId();this.step=0;this.photos=[];this.selected=new Set();
    this.contacts={telegram:'',whatsapp:'',phone:''};this.channel='telegram';this.busy=false;this.photoBusy=false;this.lastAttempt=null;this.destroyed=false;
    this.events=new AbortController();
    this.render();this.bind();this.updateStep();
  }
  $(selector) {return this.root.querySelector(selector);}
  render() {
    const id=this.id;
    this.root.innerHTML=`
      <form class="request-form" novalidate>
        <div class="request-header"><div><small class="form-kicker">ПРЕДВАРИТЕЛЬНЫЙ РАСЧЁТ</small><h3>Ваш автомобиль.<br>Ваши пожелания.</h3></div><span class="request-step-caption">Шаг 1 из 3</span></div>
        <progress class="request-progress" value="1" max="3" aria-label="Прогресс заявки"></progress>
        <ol class="request-step-names" aria-label="Этапы заявки"><li>Автомобиль</li><li>Детали и фото</li><li>Связь</li></ol>
        <div class="request-trap" aria-hidden="true"><label for="${id}-website">Website</label><input id="${id}-website" name="website" tabindex="-1" autocomplete="off"></div>
        <section class="request-step" data-step="0" aria-labelledby="${id}-step-1">
          <h4 id="${id}-step-1" class="request-stage-title" tabindex="-1">Что будем делать?</h4>
          <label class="request-label" for="${id}-car">Марка и модель автомобиля <span aria-hidden="true">*</span></label>
          <input class="field request-car" id="${id}-car" name="car" maxlength="100" placeholder="Например, BMW X5" autocomplete="off" aria-describedby="${id}-car-error" required>
          <p class="request-error" id="${id}-car-error" data-error="car" aria-live="polite"></p>
          <fieldset class="request-services"><legend>Выберите услуги <span aria-hidden="true">*</span><small>Можно выбрать несколько</small></legend>
            <div class="request-service-grid">${SERVICES.map(([key,name,hint])=>`<label><input type="checkbox" name="services" value="${key}" aria-describedby="${id}-services-error"><span class="request-service-card"><strong>${name}</strong><small>${hint}</small><i aria-hidden="true"></i></span></label>`).join('')}</div>
            <p class="request-error" id="${id}-services-error" data-error="services" aria-live="polite"></p>
          </fieldset>
          <div class="request-other" hidden><label class="request-label" for="${id}-other">Что хотите сделать?</label><input class="field" id="${id}-other" name="otherService" maxlength="300" placeholder="Коротко опишите вашу задачу" aria-describedby="${id}-other-error"><p class="request-error" id="${id}-other-error" data-error="otherService" aria-live="polite"></p></div>
        </section>
        <section class="request-step" data-step="1" aria-labelledby="${id}-step-2" hidden>
          <h4 id="${id}-step-2" class="request-stage-title" tabindex="-1">Добавим детали</h4>
          <label class="request-label" for="${id}-comment">Расскажите подробнее <small>Необязательно</small></label>
          <textarea class="field" id="${id}-comment" name="comment" maxlength="1500" rows="3" placeholder="Например: хочу оклеить переднюю часть автомобиля защитной плёнкой" aria-describedby="${id}-comment-error"></textarea>
          <p class="request-error" id="${id}-comment-error" data-error="comment" aria-live="polite"></p>
          <div class="request-upload"><div class="request-upload-heading"><strong>Фотографии автомобиля</strong><small class="request-photo-count">0 из 3</small></div><p>Фото поможет точнее оценить объём работ</p>
            <input id="${id}-photos" class="request-file-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple aria-describedby="${id}-photos-error ${id}-photo-hint">
            <label class="request-upload-button" for="${id}-photos"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h4l2-3h4l2 3h4v13H4V7Z"/><circle cx="12" cy="13" r="4"/></svg><span>Добавить фотографии</span></label>
            <p class="request-upload-hint" id="${id}-photo-hint">До 3 фото · JPG, PNG, WebP или GIF · до 5 МБ каждое. Необязательно.</p><div class="request-photo-list"></div><p class="request-error" id="${id}-photos-error" data-error="photos" aria-live="polite"></p><p class="request-photo-status" role="status"></p>
          </div>
        </section>
        <section class="request-step" data-step="2" aria-labelledby="${id}-step-3" hidden>
          <h4 id="${id}-step-3" class="request-stage-title" tabindex="-1">Как с вами связаться?</h4>
          <div class="request-channel-group" role="group" aria-label="Предпочтительный способ связи">${Object.entries(CHANNELS).map(([key,name])=>`<button type="button" data-channel="${key}" aria-pressed="${key==='telegram'}">${name}</button>`).join('')}</div>
          <label class="request-label request-contact-label" for="${id}-contact">Имя пользователя в Telegram <span aria-hidden="true">*</span></label>
          <input class="field request-contact" id="${id}-contact" name="contact" maxlength="80" placeholder="@nickname" aria-describedby="${id}-contact-error ${id}-contact-hint" required>
          <p class="request-contact-hint" id="${id}-contact-hint">Укажите ваш @username, чтобы мы могли написать вам.</p><p class="request-error" id="${id}-contact-error" data-error="contact" aria-live="polite"></p>
          <div class="request-review"><small>ВАША ЗАЯВКА</small><strong class="request-review-car"></strong><p class="request-review-services"></p><span class="request-review-photos"></span></div>
        </section>
        <p class="request-submit-error" role="alert" hidden></p>
        <div class="request-actions"><button class="request-back" type="button" data-action="back" hidden>Назад</button><button class="button button-dark request-next" type="submit">Продолжить</button></div>
        <p class="request-note">Стоимость зависит от автомобиля, выбранных материалов и объёма работ. После заявки специалист уточнит детали и назовёт стоимость.</p>
      </form>
      <section class="request-success" hidden aria-labelledby="${id}-success"><div class="request-success-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4 4 10-10"/></svg></div><small class="form-kicker">ЗАЯВКА НА РАСЧЁТ</small><h3 id="${id}-success" tabindex="-1">Спасибо!<br>Демонстрационная заявка готова.</h3><p>Мы посмотрим информацию по автомобилю и свяжемся с вами для уточнения деталей и расчёта стоимости.</p><dl class="request-success-summary"></dl><button type="button" class="button button-dark" data-action="return">Вернуться на сайт</button></section>`;
    this.form=this.$('form');
  }
  bind() {
    const options={signal:this.events.signal};
    this.form.addEventListener('submit',event=>{event.preventDefault();if(this.busy||this.photoBusy)return;if(this.step<2)this.next();else this.submit();},options);
    this.root.addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button||this.busy||this.photoBusy)return;
      if(button.dataset.action==='back'){this.step--;this.updateStep(true);}
      if(button.dataset.channel)this.setChannel(button.dataset.channel);
      if(button.dataset.removePhoto)this.removePhoto(button.dataset.removePhoto);
      if(button.dataset.action==='return'){this.reset();document.querySelector('#main')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
    },options);
    this.form.addEventListener('change',event=>{
      if(event.target.name==='services'){
        event.target.checked?this.selected.add(event.target.value):this.selected.delete(event.target.value);
        this.$('.request-other').hidden=!this.selected.has('other');this.$('[name="otherService"]').required=this.selected.has('other');this.setError('services','');this.setError('otherService','');
      }
      if(event.target.type==='file')this.addPhotos([...event.target.files]);
    },options);
    this.form.addEventListener('input',event=>{
      if(event.target.name==='contact'){
        if(this.channel!=='telegram')this.maskContact(event.target);
        this.contacts[this.channel]=event.target.value;
      }
      if(event.target.name)this.setError(event.target.name,'');
    },options);
    this.$('[name="contact"]').addEventListener('beforeinput',event=>{
      const input=event.target;
      if(this.channel==='telegram'||event.inputType!=='deleteContentBackward'||input.selectionStart!==input.selectionEnd)return;
      const pos=input.selectionStart;
      if(pos>0&&!/\d/.test(input.value[pos-1])){
        const previous=input.value.slice(0,pos).search(/\d\D*$/);
        if(previous>=0){event.preventDefault();input.value=input.value.slice(0,previous)+input.value.slice(previous+1);input.setSelectionRange(previous,previous);input.dispatchEvent(new Event('input',{bubbles:true}));}
      }
    },options);
    document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',()=>{
      if(this.busy)return;
      const checkbox=this.$(`input[name="services"][value="${link.dataset.service}"]`);
      if(checkbox){checkbox.checked=true;this.selected.add(checkbox.value);this.step=0;this.updateStep();}
    },options));
  }
  maskContact(input) {
    const previous=input.value,caret=input.selectionStart ?? previous.length;
    const before=previous.slice(0,caret).replace(/\D/g,'').length;
    const addedPrefix=previous.replace(/\D/g,'')&&!/^[78]/.test(previous.replace(/\D/g,''))?1:0;
    input.value=formatPhone(previous);
    let digits=0,newCaret=input.value.length;
    for(let i=0;i<input.value.length;i++)if(/\d/.test(input.value[i])&&++digits>=before+addedPrefix){newCaret=i+1;break;}
    if(caret===previous.length)newCaret=input.value.length;
    input.setSelectionRange(newCaret,newCaret);
  }
  setChannel(channel) {
    if(!CHANNELS[channel])return;
    this.contacts[this.channel]=this.$('[name="contact"]').value;this.channel=channel;
    this.root.querySelectorAll('[data-channel]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.channel===channel)));
    const input=this.$('[name="contact"]');input.value=this.contacts[channel];input.type=channel==='telegram'?'text':'tel';input.inputMode=channel==='telegram'?'text':'tel';input.autocomplete=channel==='telegram'?'off':'tel';input.maxLength=channel==='telegram'?80:18;input.placeholder=channel==='telegram'?'@nickname':'+7 (000) 000-00-00';
    this.$('.request-contact-label').firstChild.textContent=channel==='telegram'?'Имя пользователя в Telegram ':'Номер телефона ';
    this.$('.request-contact-hint').textContent=channel==='telegram'?'Укажите ваш @username, чтобы мы могли написать вам.':channel==='whatsapp'?'Номер, к которому привязан ваш WhatsApp.':'Позвоним по указанному номеру, чтобы обсудить работы.';
    this.setError('contact','');input.focus();
  }
  setError(field,message) {
    const error=this.$(`[data-error="${field}"]`);if(error)error.textContent=message;
    const control=this.form.elements.namedItem(field);if(control instanceof HTMLElement)control.setAttribute('aria-invalid',String(Boolean(message)));
    if(field==='services')this.$('.request-services').setAttribute('aria-invalid',String(Boolean(message)));
  }
  validate(step) {
    const errors={};
    if(step===0){if(this.form.elements.car.value.trim().length<2)errors.car='Укажите автомобиль';if(!this.selected.size)errors.services='Выберите хотя бы одну услугу';if(this.selected.has('other')&&this.form.elements.otherService.value.trim().length<3)errors.otherService='Коротко опишите, что хотите сделать';}
    if(step===2){const value=this.$('[name="contact"]').value.trim();if(this.channel==='telegram'){if(!/^(?:@|https?:\/\/t\.me\/)?[a-zA-Z][a-zA-Z0-9_]{2,63}$/.test(value))errors.contact='Укажите имя пользователя в Telegram, например @nickname';}else if(!/^7\d{10}$/.test(phoneDigits(value)))errors.contact='Введите номер полностью: +7 и ещё 10 цифр';}
    for(const field of ['car','services','otherService','contact'])if((step===0&&field!=='contact')||(step===2&&field==='contact'))this.setError(field,errors[field]||'');
    const first=Object.keys(errors)[0];if(first){const target=first==='services'?this.$('[name="services"]'):this.form.elements.namedItem(first);target?.focus();return false;}return true;
  }
  next() {if(this.validate(this.step)){this.step++;this.updateStep(true);}}
  updateStep(focus=false) {
    this.root.querySelectorAll('[data-step]').forEach(section=>section.hidden=Number(section.dataset.step)!==this.step);
    this.$('.request-step-caption').textContent=`Шаг ${this.step+1} из 3`;
    this.$('progress').value=this.step+1;
    this.root.querySelectorAll('.request-step-names li').forEach((item,index)=>{item.classList.toggle('is-current',index===this.step);item.classList.toggle('is-complete',index<this.step);item.setAttribute('aria-current',index===this.step?'step':'false');});
    this.$('[data-action="back"]').hidden=this.step===0;
    this.$('.request-next').textContent=this.step===2?'Получить расчёт':'Продолжить';
    this.$('.request-review-car').textContent=this.form.elements.car.value.trim();
    this.$('.request-review-services').textContent=SERVICES.filter(([key])=>this.selected.has(key)).map(([,name])=>name).join(' · ');
    this.$('.request-review-photos').textContent=this.photos.length?`Фото: ${this.photos.length}`:'Без фотографий';
    if(focus)this.$(`[data-step="${this.step}"] h4`).focus({preventScroll:true});
  }
  async addPhotos(files) {
    if(this.busy||this.photoBusy)return;
    this.$('[type="file"]').value='';this.setError('photos','');
    if(this.photos.length+files.length>3){this.setError('photos','Можно прикрепить до 3 фотографий. Удалите лишнее фото или выберите меньше файлов.');return;}
    this.photoBusy=true;this.toggleControls(true);this.$('.request-photo-status').textContent='Проверяем фотографии…';
    const errors=[];
    try {
      for(const file of files){
        try{await verifyImage(file);if(this.destroyed)return;if(this.photos.some(item=>item.file.name===file.name&&item.file.size===file.size&&item.file.lastModified===file.lastModified)){errors.push('Это фото уже добавлено.');continue;}this.photos.push({id:crypto.randomUUID(),file,url:URL.createObjectURL(file)});}
        catch(error){errors.push(error.message);}
      }
      this.renderPhotos();this.setError('photos',errors.join(' '));
    }finally{this.photoBusy=false;if(!this.destroyed){this.toggleControls(false);this.$('.request-photo-status').textContent=this.photos.length?`Добавлено фотографий: ${this.photos.length}`:'';}}
  }
  renderPhotos() {
    const list=this.$('.request-photo-list');list.replaceChildren();
    this.photos.forEach(photo=>{
      const figure=document.createElement('figure');const image=document.createElement('img');image.src=photo.url;image.alt=photo.file.name;
      const caption=document.createElement('figcaption');caption.textContent=photo.file.name;
      const button=document.createElement('button');button.type='button';button.dataset.removePhoto=photo.id;button.textContent='×';button.setAttribute('aria-label',`Удалить фото ${photo.file.name}`);
      figure.append(image,caption,button);list.append(figure);
    });
    this.$('.request-photo-count').textContent=`${this.photos.length} из 3`;
    this.$('.request-upload-button').hidden=this.photos.length===3;
    this.$('[type="file"]').disabled=this.photos.length===3||this.busy||this.photoBusy;
  }
  removePhoto(id) {const index=this.photos.findIndex(photo=>photo.id===id);if(index<0)return;URL.revokeObjectURL(this.photos[index].url);this.photos.splice(index,1);this.renderPhotos();this.setError('photos','');this.$('.request-photo-status').textContent=`Добавлено фотографий: ${this.photos.length}`;this.$('[type="file"]').focus();}
  toggleControls(disabled) {this.root.querySelectorAll('input,textarea,select,button').forEach(control=>control.disabled=disabled);this.$('[type="file"]').disabled=disabled||this.photos.length===3;this.root.classList.toggle('is-busy',disabled);this.form.setAttribute('aria-busy',String(disabled));}
  async submit() {
    if(this.busy||this.photoBusy)return;
    if(!this.validate(0)){this.step=0;this.updateStep();return;}if(!this.validate(2))return;
    this.busy=true;this.toggleControls(true);this.$('.request-next').textContent='Отправляем…';this.$('.request-submit-error').hidden=true;
    this.submitController=new AbortController();const timeout=setTimeout(()=>this.submitController.abort(),20000);
    try {
      const payload={car:this.form.elements.car.value.trim(),services:SERVICES.filter(([key])=>this.selected.has(key)).map(([key])=>key),otherService:this.selected.has('other')?this.form.elements.otherService.value.trim():'',comment:this.form.elements.comment.value.trim(),photos:await Promise.all(this.photos.map(async photo=>({name:photo.file.name,type:photo.file.type,data:await readBase64(photo.file)}))),contactMethod:this.channel,contact:this.$('[name="contact"]').value.trim(),pageUrl:location.href,website:this.form.elements.website.value};
      const signature=JSON.stringify(payload);
      if(!this.lastAttempt||this.lastAttempt.signature!==signature)this.lastAttempt={signature,id:crypto.randomUUID(),createdAt:new Date().toISOString()};
      payload.clientCreatedAt=this.lastAttempt.createdAt;
      const response=await this.transport(payload,{idempotencyKey:this.lastAttempt.id,signal:this.submitController.signal});
      if(this.destroyed)return;
      this.showSuccess(payload,response);
    }catch(error){
      if(this.destroyed)return;
      const fields=error.fields||{};
      for(const [key,message]of Object.entries(fields))this.setError(key,String(message));
      if(fields.car||fields.services||fields.otherService)this.step=0;else if(fields.photos||fields.comment)this.step=1;
      this.updateStep();this.$('.request-submit-error').textContent=error.message||'Не удалось отправить заявку. Попробуйте ещё раз.';this.$('.request-submit-error').hidden=false;
    }finally{clearTimeout(timeout);this.busy=false;if(!this.destroyed){this.toggleControls(false);this.$('.request-next').textContent=this.step===2?'Получить расчёт':'Продолжить';}}
  }
  showSuccess(payload) {
    this.form.hidden=true;const success=this.$('.request-success');success.hidden=false;
    const summary=this.$('.request-success-summary');summary.replaceChildren();
    const rows=[['Автомобиль',payload.car],['Услуги',SERVICES.filter(([key])=>payload.services.includes(key)).map(([,name])=>name).join(', ')],['Фото',String(payload.photos.length)],['Связаться',CHANNELS[payload.contactMethod]]];
    for(const [label,value]of rows){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;summary.append(dt,dd);}
    success.querySelector('h3').focus({preventScroll:true});
    this.photos.forEach(photo=>URL.revokeObjectURL(photo.url));
  }
  reset() {
    this.photos.forEach(photo=>URL.revokeObjectURL(photo.url));this.photos=[];this.selected.clear();this.contacts={telegram:'',whatsapp:'',phone:''};this.channel='telegram';this.step=0;this.lastAttempt=null;
    this.form.reset();this.form.hidden=false;this.$('.request-success').hidden=true;this.$('.request-other').hidden=true;this.$('[name="otherService"]').required=false;this.root.querySelectorAll('[data-error]').forEach(error=>error.textContent='');this.root.querySelectorAll('[aria-invalid]').forEach(control=>control.removeAttribute('aria-invalid'));this.$('.request-submit-error').hidden=true;this.$('.request-photo-status').textContent='';this.setChannel('telegram');this.renderPhotos();this.updateStep();
  }
  destroy() {this.destroyed=true;this.events.abort();this.submitController?.abort();this.photos.forEach(photo=>URL.revokeObjectURL(photo.url));}
}
export function mountEstimateForm(root,options) {return new EstimateForm(root,options);}
document.querySelectorAll('[data-estimate-form]').forEach(root=>mountEstimateForm(root));
