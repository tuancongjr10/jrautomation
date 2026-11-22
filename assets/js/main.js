/* Jr. Automation — main.js
   1) Menu điện thoại
   2) Chọn sẵn dịch vụ / gói trong form
*/
(function () {
  'use strict';

  /* ---------- Menu ---------- */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('menu');
  if (toggle && menu) {
    var setMenu = function (open) {
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    };
    toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- Form liên hệ: chọn sẵn dịch vụ theo ?dv= ---------- */
  var sel = document.querySelector('select[data-preselect]');
  if (sel) {
    var dv = new URLSearchParams(window.location.search).get('dv');
    if (dv) {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].getAttribute('data-key') === dv) { sel.selectedIndex = i; break; }
      }
    }
  }

  /* ---------- Nút "Chọn gói": tích sẵn lựa chọn trong form bên dưới ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-pick]') : null;
    if (!b) return;
    var want = b.getAttribute('data-pick');
    var radios = document.querySelectorAll('input[type="radio"]');
    for (var k = 0; k < radios.length; k++) {
      if (radios[k].value === want) { radios[k].checked = true; break; }
    }
  });
})();
