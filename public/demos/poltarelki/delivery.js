import './motion.js';
import { TIERS } from './data.js';
import { rub } from './common.js';
import { bindCityCheck } from './city-check.js';

bindCityCheck();

const titles = ['Рядом с кухней', 'До 800 км', 'До 1 800 км', 'До 3 500 км', 'Дальше'];
document.getElementById('tiers').innerHTML = TIERS.map((t, i) => `
  <li><b>${t.cost ? rub(t.cost) : 'Бесплатно'}</b><span>${titles[i]}, ${t.days}</span></li>`).join('');
