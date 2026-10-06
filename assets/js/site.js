/* Shared runtime for every page: theme, nav, smooth scroll, reveals,
   3D tilt, counters, page curtain and the consultation dialog. */
(function () {
  'use strict';

  var CONTACT_EMAIL = 'fasiuddinadvocate@gmail.com';
  var CONTACT_PHONE = '+91 8142550969';
  var ANALYTICS_URL = 'https://fasi-law-chamber.onrender.com';

  /* Optional EmailJS delivery. Fill these in to send requests without the
     visitor's mail app; until then requests open a pre-filled email. */
  var EMAILJS = { publicKey: '', serviceId: '', templateId: '' };

  var SERVICES = [
    ['criminal-defense', 'Criminal Defense'],
    ['civil-litigation', 'Civil Litigation'],
    ['family-law', 'Family Law'],
    ['corporate-law', 'Corporate Law'],
    ['estate-planning', 'Estate Planning'],
    ['real-estate', 'Real Estate Law'],
    ['other', 'Other']
  ];

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var lenis = null;

  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Theme ---------- */
  function currentTheme() {
    return root.dataset.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function initTheme() {
    $$('[data-theme-toggle]').forEach(function (btn) {
      var sync = function () {
        btn.setAttribute('aria-label', currentTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      };
      sync();
      btn.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.dataset.theme = next;
        store('theme', next);
        sync();
        window.dispatchEvent(new CustomEvent('themechange', { detail: next }));
      });
    });
  }

  /* ---------- Smooth scroll (Lenis) ---------- */
  function initSmoothScroll() {
    if (reduce || !window.Lenis) return;
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  function scrollToTarget(target) {
    var offset = -(parseInt(getComputedStyle(root).getPropertyValue('--nav-h'), 10) || 72) - 16;
    if (lenis) lenis.scrollTo(target, { offset: offset, duration: 1.4 });
    else {
      var y = target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    }
  }
  function initAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || a.hasAttribute('data-consult')) return;
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      scrollToTarget(target);
      history.replaceState(null, '', id);
    });
    if (location.hash) {
      var t = document.getElementById(location.hash.slice(1));
      if (t) setTimeout(function () { scrollToTarget(t); }, 700);
    }
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    var nav = $('.nav');
    if (!nav) return;
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none;';
    sentinel.setAttribute('aria-hidden', 'true');
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);

    if (lenis) {
      var lastY = 0;
      lenis.on('scroll', function (l) {
        var y = l.scroll;
        if (Math.abs(y - lastY) < 6) return;
        nav.classList.toggle('is-hidden', y > lastY && y > 420 && !document.body.classList.contains('menu-open'));
        lastY = y;
      });
    }
  }

  function initMobileMenu() {
    var menu = $('.mmenu');
    var openBtn = $('.nav__burger');
    if (!menu || !openBtn) return;
    var closeBtn = $('.mmenu__close', menu);
    var setOpen = function (open) {
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', String(!open));
      menu.inert = !open;
      openBtn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
      if (lenis) open ? lenis.stop() : lenis.start();
      if (open) setTimeout(function () { closeBtn.focus(); }, 300);
      else openBtn.focus({ preventScroll: true });
    };
    openBtn.addEventListener('click', function () { setOpen(true); });
    closeBtn.addEventListener('click', function () { setOpen(false); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false);
    });
  }

  /* ---------- Curtain + page transitions ---------- */
  function initCurtain() {
    if (!root.classList.contains('motion')) return;
    var lift = function () { requestAnimationFrame(function () { root.classList.add('is-loaded'); }); };
    if (document.fonts && document.fonts.ready) {
      Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 900); })]).then(function () { setTimeout(lift, 250); });
    } else setTimeout(lift, 400);

    window.addEventListener('pageshow', function (e) { if (e.persisted) root.classList.remove('is-leaving'); });

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-consult')) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      root.classList.add('is-leaving');
      setTimeout(function () { location.href = url.href; }, 520);
    });
  }

  /* ---------- Word splitting ---------- */
  function splitWords(el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var outer = document.createElement('span');
            outer.className = 'w';
            var inner = document.createElement('span');
            inner.className = 'w__i';
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') walk(child);
      });
    };
    walk(el);
    return $$('.w__i', el);
  }

  /* ---------- Reveals ---------- */
  function initReveals() {
    if (!hasGsap || !root.classList.contains('motion')) {
      root.classList.add('motion-ready');
      $$('[data-reveal], [data-reveal-group] > *').forEach(function (el) { el.style.opacity = 1; });
      $$('[data-split]').forEach(function (el) { el.style.visibility = 'visible'; });
      return;
    }
    var introDelay = 0.75; // matches the curtain lift

    $$('[data-split]').forEach(function (el) {
      var words = splitWords(el);
      gsap.set(el, { visibility: 'visible' });
      gsap.set(words, { yPercent: 115 });
      var inHero = !!el.closest('.hero, .page-hero');
      gsap.to(words, {
        yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.055,
        delay: inHero ? introDelay : 0,
        scrollTrigger: inHero ? null : { trigger: el, start: 'top 88%', once: true }
      });
    });

    $$('[data-reveal]').forEach(function (el) {
      var inHero = !!el.closest('.hero, .page-hero');
      var delay = parseFloat(el.dataset.delay || 0) + (inHero ? introDelay + 0.35 : 0);
      if (el.dataset.reveal === 'image') {
        var img = $('img', el);
        gsap.set(el, { opacity: 1, clipPath: 'inset(100% 0% 0% 0% round 28px)' });
        var tl = gsap.timeline({ delay: delay, scrollTrigger: inHero ? null : { trigger: el, start: 'top 85%', once: true } });
        tl.to(el, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.4, ease: 'expo.inOut' });
        if (img) tl.from(img, { scale: 1.25, duration: 1.8, ease: 'expo.out' }, 0.15);
        tl.add(function () { el.style.clipPath = ''; });
        return;
      }
      gsap.fromTo(el, { autoAlpha: 0, y: 40 }, {
        autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: delay, clearProps: 'transform',
        scrollTrigger: inHero ? null : { trigger: el, start: 'top 90%', once: true }
      });
    });

    $$('[data-reveal-group]').forEach(function (group) {
      var inHero = !!group.closest('.hero, .page-hero');
      gsap.fromTo(group.children, { autoAlpha: 0, y: 48 }, {
        autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.09, clearProps: 'transform',
        delay: inHero ? introDelay + 0.45 : 0,
        scrollTrigger: inHero ? null : { trigger: group, start: 'top 85%', once: true }
      });
    });

    root.classList.add('motion-ready');
  }

  /* ---------- Scroll-linked depth ---------- */
  function initParallax() {
    if (!hasGsap || reduce) return;
    $$('[data-parallax]').forEach(function (el) {
      var amount = parseFloat(el.dataset.parallax) || 8;
      gsap.fromTo(el, { yPercent: -amount }, {
        yPercent: amount, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
    $$('[data-drift]').forEach(function (el) {
      var amount = parseFloat(el.dataset.drift) || 10;
      gsap.to(el, {
        xPercent: amount, ease: 'none',
        scrollTrigger: { trigger: el.closest('section') || el, start: 'top top', end: 'bottom top', scrub: true }
      });
    });
    var hero = $('.hero');
    if (hero) {
      window.__heroProgress = 0;
      ScrollTrigger.create({
        trigger: hero, start: 'top top', end: 'bottom top',
        onUpdate: function (s) { window.__heroProgress = s.progress; }
      });
    }
  }

  /* ---------- Counters ---------- */
  function initCounters() {
    $$('[data-count]').forEach(function (el) {
      var target = parseFloat(el.dataset.count);
      var suffix = el.dataset.suffix || '';
      var pad = el.dataset.pad ? parseInt(el.dataset.pad, 10) : 0;
      var fmt = function (v) {
        var n = Math.round(v).toLocaleString('en-IN');
        while (n.length < pad) n = '0' + n;
        return n + suffix;
      };
      if (!hasGsap || reduce) { el.textContent = fmt(target); return; }
      var obj = { v: 0 };
      el.textContent = fmt(0);
      gsap.to(obj, {
        v: target, duration: 2.2, ease: 'power3.out',
        delay: el.closest('.hero, .page-hero') ? 1.2 : 0,
        onUpdate: function () { el.textContent = fmt(obj.v); },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      });
    });
  }

  /* ---------- 3D tilt + magnetic ---------- */
  function initTilt() {
    if (!finePointer || reduce) return;
    $$('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.dataset.tilt) || 8;
      var frame = 0;
      el.classList.add('tilt');
      el.addEventListener('pointermove', function (e) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
          var r = el.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width;
          var py = (e.clientY - r.top) / r.height;
          el.style.setProperty('--ry', ((px - 0.5) * max * 2).toFixed(2) + 'deg');
          el.style.setProperty('--rx', ((0.5 - py) * max * 2).toFixed(2) + 'deg');
          el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
          el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
          el.classList.add('is-tilting');
        });
      });
      el.addEventListener('pointerleave', function () {
        cancelAnimationFrame(frame);
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }
  function initMagnetic() {
    if (!finePointer || reduce || !hasGsap) return;
    $$('[data-magnetic]').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.22);
        yTo((e.clientY - r.top - r.height / 2) * 0.32);
      });
      el.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ---------- Copy to clipboard ---------- */
  function initCopy() {
    $$('[data-copy]').forEach(function (btn) {
      var label = btn.querySelector('span');
      var original = label ? label.textContent : '';
      btn.addEventListener('click', function () {
        var done = function (text) {
          btn.classList.add('is-done');
          if (label) label.textContent = text;
          setTimeout(function () { btn.classList.remove('is-done'); if (label) label.textContent = original; }, 1600);
        };
        if (navigator.clipboard) {
          navigator.clipboard.writeText(btn.dataset.copy).then(function () { done('Copied'); }, function () { done('Select it'); });
        } else done('Select it');
      });
    });
  }

  /* ---------- Sending requests ---------- */
  function sendRequest(subject, lines) {
    var body = lines.join('\n');
    var useEmailJs = window.emailjs && EMAILJS.publicKey && EMAILJS.serviceId && EMAILJS.templateId;
    if (useEmailJs) {
      emailjs.init(EMAILJS.publicKey);
      return emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, {
        to_email: CONTACT_EMAIL, subject: subject, message: body
      }).then(function () { return 'sent'; }, function () { return openMail(subject, body); });
    }
    return Promise.resolve(openMail(subject, body));
  }
  function openMail(subject, body) {
    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    return 'mailto';
  }

  function validateFields(fields) {
    var firstBad = null;
    fields.forEach(function (input) {
      var err = document.getElementById(input.id + '-error');
      var filled = input.value.trim() !== '';
      var ok = input.type === 'checkbox'
        ? input.checked
        : input.checkValidity() && (filled || !input.required);
      input.setAttribute('aria-invalid', String(!ok));
      if (err) err.classList.toggle('is-visible', !ok);
      if (!ok && !firstBad) firstBad = input;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  /* ---------- Consultation dialog ---------- */
  var consultDialog = null;
  function serviceOptions(selected) {
    return '<option value="">Select a service</option>' + SERVICES.map(function (s) {
      return '<option value="' + s[0] + '"' + (s[0] === selected ? ' selected' : '') + '>' + s[1] + '</option>';
    }).join('');
  }
  function field(id, label, control, required, hint) {
    return '<div class="field' + (control.indexOf('textarea') > -1 ? ' full' : '') + '">' +
      '<label for="' + id + '">' + label + (required ? ' <span class="req" aria-hidden="true">*</span>' : '') + '</label>' +
      control +
      (hint ? '<p class="field__hint" id="' + id + '-hint">' + hint + '</p>' : '') +
      '<p class="field__error" id="' + id + '-error">' + (required ? 'Please complete this field.' : 'Please check this field.') + '</p></div>';
  }
  function buildConsult() {
    var today = new Date().toISOString().split('T')[0];
    var d = document.createElement('dialog');
    d.className = 'modal';
    d.id = 'consult-dialog';
    d.setAttribute('aria-labelledby', 'consult-title');
    d.setAttribute('data-lenis-prevent', '');
    d.innerHTML =
      '<div class="modal__inner">' +
      '<button type="button" class="icon-btn modal__close" data-close aria-label="Close"><i class="ph ph-x"></i></button>' +
      '<div data-consult-form>' +
      '<h2 class="modal__title" id="consult-title">Schedule Consultation</h2>' +
      '<p class="muted" style="margin:0">Three short steps. All information is kept confidential.</p>' +
      '<ol class="steps"><li class="is-active">Contact info</li><li>Case details</li><li>Schedule</li></ol>' +
      '<form novalidate>' +
      '<div class="step is-active" data-step="1"><div class="form-grid">' +
      field('c-first', 'First name', '<input class="input" id="c-first" name="firstName" autocomplete="given-name" required aria-describedby="c-first-error">', true) +
      field('c-last', 'Last name', '<input class="input" id="c-last" name="lastName" autocomplete="family-name" required aria-describedby="c-last-error">', true) +
      field('c-email', 'Email', '<input class="input" id="c-email" name="email" type="email" autocomplete="email" required aria-describedby="c-email-error">', true) +
      field('c-phone', 'Phone', '<input class="input" id="c-phone" name="phone" type="tel" autocomplete="tel" aria-describedby="c-phone-error">', false) +
      '</div><div class="step__nav"><button type="button" class="btn btn--plain" data-next>Next step</button></div></div>' +
      '<div class="step" data-step="2">' +
      field('c-service', 'Legal service needed', '<select class="input" id="c-service" name="service" required aria-describedby="c-service-error">' + serviceOptions() + '</select>', true) +
      field('c-details', 'Case details', '<textarea class="input" id="c-details" name="details" rows="4" required aria-describedby="c-details-hint c-details-error"></textarea>', true, 'A brief description is enough. Avoid sharing sensitive documents here.') +
      field('c-urgency', 'Urgency level', '<select class="input" id="c-urgency" name="urgency"><option value="standard">Standard</option><option value="urgent">Urgent</option><option value="emergency">Emergency</option></select>', false) +
      '<div class="step__nav"><button type="button" class="btn btn--ghost btn--plain" data-prev>Previous</button><button type="button" class="btn btn--plain" data-next>Next step</button></div></div>' +
      '<div class="step" data-step="3"><div class="form-grid">' +
      field('c-date', 'Preferred date', '<input class="input" id="c-date" name="date" type="date" min="' + today + '" required aria-describedby="c-date-error">', true) +
      field('c-time', 'Preferred time', '<select class="input" id="c-time" name="time" required aria-describedby="c-time-error"><option value="">Select a time</option><option>9:00 AM</option><option>10:00 AM</option><option>11:00 AM</option><option>1:00 PM</option><option>2:00 PM</option><option>3:00 PM</option><option>4:00 PM</option><option>5:00 PM</option></select>', true) +
      '</div>' +
      field('c-type', 'Consultation type', '<select class="input" id="c-type" name="type"><option value="phone">Phone Consultation</option><option value="video">Video Call</option><option value="office">Office Visit</option></select>', false) +
      '<div class="step__nav"><button type="button" class="btn btn--ghost btn--plain" data-prev>Previous</button><button type="submit" class="btn btn--plain">Request consultation</button></div></div>' +
      '</form></div>' +
      '<div class="success" data-consult-success hidden></div>' +
      '</div>';
    document.body.appendChild(d);

    var form = $('form', d);
    var steps = $$('.step', d);
    var marks = $$('.steps li', d);
    var go = function (n) {
      steps.forEach(function (s, i) { s.classList.toggle('is-active', i === n); });
      marks.forEach(function (m, i) {
        m.classList.toggle('is-active', i === n);
        m.classList.toggle('is-done', i < n);
      });
      var first = $('input, select, textarea', steps[n]);
      if (first) first.focus();
    };
    var current = function () { return steps.findIndex(function (s) { return s.classList.contains('is-active'); }); };

    d.addEventListener('click', function (e) {
      if (e.target === d || e.target.closest('[data-close]')) d.close();
      if (e.target.closest('[data-next]')) {
        var i = current();
        if (validateFields($$('[required], input[type=email], input[type=tel]', steps[i]))) go(i + 1);
      }
      if (e.target.closest('[data-prev]')) go(current() - 1);
    });
    d.addEventListener('close', function () { if (lenis) lenis.start(); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateFields($$('[required]', steps[2]))) return;
      var data = Object.fromEntries(new FormData(form));
      var serviceName = (SERVICES.find(function (s) { return s[0] === data.service; }) || ['', data.service])[1];
      var typeName = $('#c-type option:checked', d).textContent;
      var dateText = new Date(data.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      var btn = $('button[type=submit]', form);
      btn.disabled = true;
      btn.textContent = 'Preparing...';
      sendRequest('New Consultation Request - ' + serviceName, [
        'Name: ' + data.firstName + ' ' + data.lastName,
        'Email: ' + data.email,
        'Phone: ' + (data.phone || '-'),
        '',
        'Service needed: ' + serviceName,
        'Urgency: ' + data.urgency,
        '',
        'Case details:',
        data.details,
        '',
        'Preferred date: ' + dateText,
        'Preferred time: ' + data.time,
        'Consultation type: ' + typeName
      ]).then(function (how) {
        var success = $('[data-consult-success]', d);
        success.innerHTML =
          '<div class="success__icon"><i class="ph ph-check"></i></div>' +
          '<h2 class="modal__title" style="margin:0">' + (how === 'sent' ? 'Request received' : 'Almost done') + '</h2>' +
          '<p class="muted" style="margin:0;max-width:44ch">' + (how === 'sent'
            ? 'Thank you. We will contact you to confirm your appointment.'
            : 'Your email app has opened with this request addressed to ' + CONTACT_EMAIL + '. Press send there to deliver it.') + '</p>' +
          '<dl><dt>Date</dt><dd>' + escapeHtml(dateText) + '</dd><dt>Time</dt><dd>' + escapeHtml(data.time) + '</dd><dt>Type</dt><dd>' + escapeHtml(typeName) + '</dd></dl>' +
          '<p class="muted" style="margin:0">Prefer to talk? Call <a href="tel:+918142550969" style="font-weight:700;color:var(--ink)">' + CONTACT_PHONE + '</a></p>' +
          '<button type="button" class="btn btn--plain" data-close>Close</button>';
        $('[data-consult-form]', d).hidden = true;
        success.hidden = false;
        btn.disabled = false;
        btn.textContent = 'Request consultation';
      });
    });
    return d;
  }
  function openConsult(service) {
    if (!consultDialog) consultDialog = buildConsult();
    var d = consultDialog;
    var formWrap = $('[data-consult-form]', d);
    if (formWrap.hidden) {
      $('form', d).reset();
      formWrap.hidden = false;
      $('[data-consult-success]', d).hidden = true;
      $$('.step', d).forEach(function (s, i) { s.classList.toggle('is-active', i === 0); });
      $$('.steps li', d).forEach(function (m, i) { m.classList.toggle('is-active', i === 0); m.classList.remove('is-done'); });
    }
    if (service) $('#c-service', d).value = service;
    if (lenis) lenis.stop();
    d.showModal();
  }
  function initConsult() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-consult]');
      if (!t) return;
      if (typeof HTMLDialogElement !== 'function') return; // falls back to the link href
      e.preventDefault();
      openConsult(t.dataset.consult || '');
    });
  }

  /* ---------- Footer year ---------- */
  function initYear() { $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); }); }

  /* ---------- Boot ---------- */
  initTheme();
  initSmoothScroll();
  initAnchors();
  initNav();
  initMobileMenu();
  initCurtain();
  initReveals();
  initParallax();
  initCounters();
  initTilt();
  initMagnetic();
  initCopy();
  initConsult();
  initYear();

  window.Site = {
    lenis: lenis,
    reduce: reduce,
    hasGsap: hasGsap,
    openConsult: openConsult,
    sendRequest: sendRequest,
    validateFields: validateFields,
    currentTheme: currentTheme,
    email: CONTACT_EMAIL,
    phone: CONTACT_PHONE,
    analyticsUrl: ANALYTICS_URL
  };
})();
