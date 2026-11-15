/* Jr. Automation — main.js
   1) Menu điện thoại
   2) Chọn sẵn dịch vụ / gói trong form
   3) Mô phỏng mạch khởi động - dừng tự giữ (Q0.0 = (START hoặc Q0.0) và không STOP)
      kèm băng tải đếm sản phẩm qua cảm biến I0.2. */
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

  /* ---------- Mô phỏng PLC ---------- */
  var stage = document.getElementById('stage');
  if (!stage) return;

  var $ = function (id) { return document.getElementById(id); };
  var NS = 'http://www.w3.org/2000/svg';

  var el = {
    wStart: $('w-start-out'), wQ: $('w-q-out'), wNodeR: $('w-node-r'), wJoin: $('w-join'),
    wStop: $('w-stop-out'), wCoilOut: $('w-coil-out'), n1: $('n-r1'), n2: $('n-r2'),
    bStart: $('b-start'), bQ: $('b-q'), bStop: $('b-stop'), coilL: $('coil-l'), coilR: $('coil-r'),
    boxes: $('boxes'), beltTop: $('belt-top'), beam: $('beam'), sensor: $('sensor'),
    hmi: $('hmi'), btnStart: $('btn-start'), btnStop: $('btn-stop'),
    lamp: $('lamp'), stateText: $('state-text'), count: $('count')
  };

  var BOX_W = 34, BOX_H = 26, BELT_Y = 60, SENSOR_X = 330, SPEED = 72; // đơn vị viewBox / giây
  var startPressed = false, stopPressed = false, coil = false;
  var counted = 0, dashOffset = 0, lastText = '';
  var boxes = [];

  function makeBox(x) {
    var g = document.createElementNS(NS, 'g');
    var r = document.createElementNS(NS, 'rect');
    r.setAttribute('class', 'box');
    r.setAttribute('width', BOX_W); r.setAttribute('height', BOX_H);
    r.setAttribute('y', BELT_Y - BOX_H); r.setAttribute('rx', 3);
    var t = document.createElementNS(NS, 'line');
    t.setAttribute('class', 'box-tape');
    t.setAttribute('x1', BOX_W / 2); t.setAttribute('x2', BOX_W / 2);
    t.setAttribute('y1', BELT_Y - BOX_H); t.setAttribute('y2', BELT_Y);
    g.appendChild(r); g.appendChild(t);
    el.boxes.appendChild(g);
    var b = { x: x, g: g, counted: x + BOX_W / 2 >= SENSOR_X };
    g.setAttribute('transform', 'translate(' + x + ',0)');
    return b;
  }

  boxes.push(makeBox(40));
  boxes.push(makeBox(150));

  function on(node, state) { node.classList.toggle('on', !!state); }

  /* Một vòng quét PLC: tính logic rồi hiển thị */
  function scan() {
    var q = coil;                                // trạng thái Q0.0 của vòng trước
    var join = startPressed || q;                // START song song tiếp điểm tự giữ
    var stopOut = join && !stopPressed;          // nối tiếp STOP (tiếp điểm thường đóng)
    coil = stopOut;                              // cuộn dây Q0.0

    on(el.wStart, startPressed); on(el.bStart, startPressed);
    on(el.wQ, q); on(el.bQ, q);
    on(el.wNodeR, join); on(el.wJoin, join); on(el.n1, join); on(el.n2, join);
    on(el.wStop, stopOut); on(el.bStop, stopOut);
    on(el.coilL, coil); on(el.coilR, coil); on(el.wCoilOut, coil);

    on(el.lamp, coil);
    var text = coil ? 'Đang chạy' : 'Đang dừng';
    if (text !== lastText) { el.stateText.textContent = text; lastText = text; }
  }

  /* Băng tải: chỉ chạy khi Q0.0 = 1 */
  function moveBelt(dt) {
    if (!coil) return;
    var d = SPEED * dt, i, b, left = Infinity;
    dashOffset = (dashOffset - d) % 24;
    el.beltTop.setAttribute('stroke-dashoffset', dashOffset.toFixed(1));
    for (i = boxes.length - 1; i >= 0; i--) {
      b = boxes[i];
      b.x += d;
      if (!b.counted && b.x + BOX_W / 2 >= SENSOR_X) {
        b.counted = true;
        counted = (counted + 1) % 1000;
        el.count.textContent = counted;
      }
      if (b.x > 440) { el.boxes.removeChild(b.g); boxes.splice(i, 1); continue; }
      b.g.setAttribute('transform', 'translate(' + b.x.toFixed(1) + ',0)');
      if (b.x < left) left = b.x;
    }
    if (left > 92) boxes.push(makeBox(-BOX_W));
  }

  function senseBeam() {
    var hit = false;
    for (var i = 0; i < boxes.length; i++) {
      if (boxes[i].x <= SENSOR_X && boxes[i].x + BOX_W >= SENSOR_X) { hit = true; break; }
    }
    on(el.beam, hit); on(el.sensor, hit);
  }

  /* Vòng lặp: dừng khi khung mô phỏng ra khỏi màn hình để đỡ tốn pin */
  var last = 0, running = false, visible = true;
  function frame(t) {
    if (!visible) { running = false; return; }
    var dt = last ? Math.min((t - last) / 1000, 0.1) : 0;
    last = t;
    scan(); moveBelt(dt); senseBeam();
    requestAnimationFrame(frame);
  }
  function kick() { if (!running && visible) { running = true; last = 0; requestAnimationFrame(frame); } }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) kick();
    }, { threshold: 0 }).observe(stage);
  }

  /* Nút HMI: nhấn là xung ngắn, giống nút nhấn nhả */
  var timers = {};
  function pulse(name, setter) {
    setter(true);
    scan();                                      // bắt xung ngay, không phụ thuộc nhịp vẽ
    clearTimeout(timers[name]);
    timers[name] = setTimeout(function () { setter(false); }, 380);
  }
  el.btnStart.addEventListener('click', function () { pulse('start', function (v) { startPressed = v; }); kick(); });
  el.btnStop.addEventListener('click', function () { pulse('stop', function (v) { stopPressed = v; }); kick(); });

  el.hmi.hidden = false;
  scan(); senseBeam(); kick();

  /* Một khoảnh khắc mở màn: tự nhấn START để người xem thấy mạch có điện.
     Người dùng giảm chuyển động thì để nguyên trạng thái dừng. */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    setTimeout(function () { if (!coil && !stopPressed) { pulse('start', function (v) { startPressed = v; }); kick(); } }, 1100);
  }
})();
