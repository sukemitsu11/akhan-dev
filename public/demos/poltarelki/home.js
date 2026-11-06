import './motion.js';
import { DISHES, REVIEWS } from './data.js';
import { dishCard } from './common.js';
import { bindCityCheck } from './city-check.js';
import { bindDishDialog } from './dish-dialog.js';

bindCityCheck();

const picks = ['chickpea', 'salmon', 'smoothie', 'beef'].map((id) => DISHES.find((d) => d.id === id));
const dishes = document.getElementById('dishes');
dishes.innerHTML = picks.map(dishCard).join('');
bindDishDialog(dishes);

document.getElementById('quotes').innerHTML = REVIEWS.map((r) => `
  <li><b>${r.city}</b><blockquote>${r.text}</blockquote><p>${r.who}</p></li>`).join('');
