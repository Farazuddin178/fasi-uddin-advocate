/* Contact page: message form + analytics preview charts. */
(function () {
  'use strict';

  var site = window.Site || {};

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('button[type="submit"]');
    var submitLabel = submit.innerHTML;

    form.addEventListener('input', function (e) {
      var el = e.target;
      if (el.getAttribute('aria-invalid') === 'true') site.validateFields([el]);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = Array.prototype.slice.call(form.querySelectorAll('[required], input[type=email], input[type=tel]'));
      if (!site.validateFields(fields)) return;

      var data = Object.fromEntries(new FormData(form));
      var serviceName = form.querySelector('#f-service option:checked').textContent;
      var urgencyName = form.querySelector('#f-urgency option:checked').textContent;
      var fullName = data.firstName + ' ' + data.lastName;

      submit.disabled = true;
      submit.textContent = 'Sending...';

      site.sendRequest('New Contact Form Submission - ' + serviceName, [
        'Name: ' + fullName,
        'Email: ' + data.email,
        'Phone: ' + (data.phone || '-'),
        'Service: ' + serviceName,
        'Urgency: ' + urgencyName,
        '',
        'Message:',
        data.details,
        '',
        'Consent to contact: Yes'
      ]).then(function (how) {
        status.textContent = how === 'sent'
          ? 'Thank you for your message. We will contact you within 24 hours to discuss your legal needs.'
          : 'Your email app has opened with this message addressed to ' + site.email + '. Press send there to deliver it.';
        status.classList.add('is-visible');
        if (how === 'sent') form.reset();
        submit.disabled = false;
        submit.innerHTML = submitLabel;
      });
    });
  }

  /* ---------- Charts (lazy, theme-aware) ---------- */
  var lineEl = document.getElementById('success-trends-chart');
  var pieEl = document.getElementById('practice-area-chart');
  if (!lineEl || !pieEl || !window.echarts) return;

  var charts = [];
  function token(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  function render() {
    var dark = site.currentTheme && site.currentTheme() === 'dark';
    var ink = token('--ink');
    var muted = token('--muted');
    var line = token('--line');
    var gold = '#c9a96e';
    var font = 'Manrope, system-ui, sans-serif';
    var palette = dark ? [gold, '#e6d4ad', '#7f9bd6', '#55688a'] : [gold, '#1a2332', '#6f7f99', '#e2cfa4'];

    charts.forEach(function (c) { c.dispose(); });
    charts = [echarts.init(lineEl, null, { renderer: 'svg' }), echarts.init(pieEl, null, { renderer: 'svg' })];

    charts[0].setOption({
      textStyle: { fontFamily: font },
      grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
      tooltip: { trigger: 'axis', valueFormatter: function (v) { return v + '%'; } },
      xAxis: {
        type: 'category', boundaryGap: false, data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        axisLine: { lineStyle: { color: line } }, axisTick: { show: false }, axisLabel: { color: muted }
      },
      yAxis: {
        type: 'value', min: 90, max: 100,
        splitLine: { lineStyle: { color: line } }, axisLabel: { color: muted, formatter: '{value}%' }
      },
      series: [{
        name: 'Success rate', type: 'line', smooth: true, symbolSize: 8,
        data: [94, 96, 95, 97, 98, 99],
        lineStyle: { color: gold, width: 3 }, itemStyle: { color: gold, borderColor: token('--surface'), borderWidth: 2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(201,169,110,0.35)' }, { offset: 1, color: 'rgba(201,169,110,0)' }] } }
      }]
    });

    charts[1].setOption({
      textStyle: { fontFamily: font },
      color: palette,
      tooltip: { trigger: 'item', valueFormatter: function (v) { return v + '%'; } },
      legend: { bottom: 0, icon: 'circle', itemWidth: 10, itemHeight: 10, textStyle: { color: ink } },
      series: [{
        name: 'Cases', type: 'pie', radius: ['48%', '74%'], center: ['50%', '44%'],
        itemStyle: { borderColor: token('--surface'), borderWidth: 3, borderRadius: 6 },
        label: { show: false },
        data: [
          { value: 35, name: 'Criminal Defense' },
          { value: 25, name: 'Civil Litigation' },
          { value: 20, name: 'Family Law' },
          { value: 20, name: 'Corporate Law' }
        ]
      }]
    });
  }

  var started = false;
  new IntersectionObserver(function (entries, io) {
    if (!entries[0].isIntersecting || started) return;
    started = true;
    io.disconnect();
    render();
  }, { rootMargin: '200px' }).observe(lineEl);

  window.addEventListener('themechange', function () { if (started) render(); });
  new ResizeObserver(function () { charts.forEach(function (c) { c.resize(); }); }).observe(lineEl.parentElement.parentElement);
})();
