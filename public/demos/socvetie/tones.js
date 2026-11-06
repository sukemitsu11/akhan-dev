// Обычный скрипт в <head>: страница цветка или букета красится до первой отрисовки.
// [фон, текст]. Контраст каждой пары не ниже 7:1.
window.SOC_TONES = {
  peony: ['#f7d9e0', '#5b1e35'], ranunculus: ['#f3eee3', '#4a3f2a'], tulip: ['#faf0c8', '#4e4310'],
  hyacinth: ['#d9def6', '#27306b'], lilac: ['#eadff7', '#432a6e'], eustoma: ['#fbdce8', '#6b1f45'],
  chamomile: ['#f3f6d5', '#3d4614'], hydrangea: ['#cfe3f5', '#163f66'], dahlia: ['#fdd9c8', '#6b2a12'],
  chrysanthemum: ['#fbe9a9', '#4f3d05'], aster: ['#e3d9f9', '#33296e'], amaryllis: ['#fadfd9', '#66231b'],
  anemone: ['#dfd8fb', '#3a2a78'], rose: ['#ffd8cf', '#6e2418'], eucalyptus: ['#dbe8e0', '#254034'],
  fern: ['#d8ebc9', '#2a4a1a'], ruscus: ['#c9e6d3', '#103f2a'],
  pudra: ['#f9e1e6', '#5b2338'], podjezd: ['#e6dcf5', '#3d2868'], slivki: ['#f7f0dc', '#4b3f1e'],
  moloko: ['#d8e6f4', '#1c3b60'], abrikos: ['#ffdfc4', '#67300c'], dacha: ['#eef3cf', '#3b4413'],
  med: ['#fdedb8', '#513e04'], yanvar: ['#ecdcef', '#4a2352'],
};
(function () {
  try {
    var id = new URLSearchParams(location.search).get('id');
    var tone = id && window.SOC_TONES[id];
    if (tone) {
      var root = document.documentElement.style;
      root.setProperty('--tone', tone[0]);
      root.setProperty('--tone-ink', tone[1]);
    }
  } catch (e) { /* без цвета страница останется на общем фоне */ }
})();
