import { DISHES } from './data.js';
import { ASSETS } from './common.js';

/** Состав блюда открывается в окне по клику на карточку. */
export function bindDishDialog(root) {
  const dlg = document.getElementById('dlg');
  const close = () => dlg.close();
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-dish]');
    if (!button) return;
    const d = DISHES.find((x) => x.id === button.dataset.dish);
    const tags = [d.noMeat && 'без мяса', d.noGluten && 'без глютена', d.noLactose && 'без лактозы'].filter(Boolean).join(', ');
    dlg.innerHTML = `
      <div class="dlg">
        <img src="${ASSETS}${d.id}.webp" width="720" height="720" alt="${d.name}">
        <div class="dlg-body">
          <p style="font-weight:700;color:var(--green)">${d.meal}</p>
          <h2 id="dlg-h">${d.name}</h2>
          <div class="macros">
            <div><b>${d.kcal}</b>ккал</div><div><b>${d.p}</b>белки, г</div><div><b>${d.f}</b>жиры, г</div><div><b>${d.c}</b>углеводы, г</div>
          </div>
          <p><strong>Состав:</strong> ${d.parts}.</p>
          ${tags ? `<p><strong>Подходит:</strong> ${tags}.</p>` : ''}
          <p><strong>Разогрев:</strong> 5 минут в микроволновке или на сковороде.</p>
          <button class="link" type="button" data-close>Закрыть</button>
        </div>
      </div>`;
    dlg.querySelector('[data-close]').addEventListener('click', close);
    dlg.showModal();
  });
  dlg.addEventListener('click', (event) => { if (event.target === dlg) close(); });
}
