/* Services page: category filters + case study dialog. */
(function () {
  'use strict';

  var CASE_STUDIES = {
    'criminal-defense': {
      title: 'Criminal Defense Case Study',
      overview: 'Client charged with white-collar crime facing 10+ years in prison and $500,000 in fines.',
      challenge: 'Complex financial evidence and potential witness tampering.',
      outcome: 'Charges reduced, client received probation and community service.',
      strategy: "Through meticulous evidence review and expert witness testimony, we successfully challenged the prosecution's case and negotiated a favorable plea agreement."
    },
    'civil-litigation': {
      title: 'Civil Litigation Case Study',
      overview: 'Contract dispute involving $2 million in damages between two technology companies.',
      challenge: 'Complex technical specifications and multiple contract amendments.',
      outcome: 'Favorable settlement of $1.8 million for our client.',
      strategy: 'Our thorough contract analysis and strategic negotiation resulted in a settlement that exceeded client expectations while avoiding lengthy litigation.'
    },
    'family-law': {
      title: 'Family Law Case Study',
      overview: 'Complex divorce involving child custody, significant assets, and business interests.',
      challenge: 'High-conflict situation with multiple properties and business valuations.',
      outcome: 'Fair asset division and joint custody arrangement.',
      strategy: "Through mediation and collaborative law techniques, we achieved a resolution that protected our client's interests while maintaining family relationships."
    }
  };

  var cards = Array.prototype.slice.call(document.querySelectorAll('.s-card'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-filter]'));
  var empty = document.querySelector('.s-empty');
  var site = window.Site || {};
  var animate = site.hasGsap && !site.reduce;

  function applyFilter(filter) {
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.filter === filter)); });
    var show = cards.filter(function (c) { return filter === 'all' || c.dataset.category === filter; });
    var hide = cards.filter(function (c) { return show.indexOf(c) === -1; });

    var finish = function () {
      hide.forEach(function (c) { c.hidden = true; });
      show.forEach(function (c) { c.hidden = false; });
      if (empty) empty.classList.toggle('is-visible', show.length === 0);
      if (animate) {
        gsap.fromTo(show, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06, clearProps: 'transform' });
        ScrollTrigger.refresh();
      }
    };
    var visibleHide = hide.filter(function (c) { return !c.hidden; });
    if (animate && visibleHide.length) {
      gsap.to(visibleHide, { autoAlpha: 0, y: 20, duration: 0.3, ease: 'power2.in', onComplete: finish });
    } else finish();
  }

  document.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-filter]');
    if (chip) applyFilter(chip.dataset.filter);
  });

  /* Deep links from the home page (services.html#family-law) */
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target && target.classList.contains('s-card')) {
      target.style.borderColor = 'var(--gold)';
      setTimeout(function () { target.style.borderColor = ''; }, 2600);
    }
  }

  /* Case study dialog */
  var dialog = document.getElementById('case-dialog');
  if (!dialog) return;
  var title = document.getElementById('case-title');
  var body = document.getElementById('case-body');
  var consult = document.getElementById('case-consult');

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-case]');
    if (!btn) return;
    var cs = CASE_STUDIES[btn.dataset.case];
    if (!cs) return;
    title.textContent = cs.title;
    body.innerHTML =
      '<p class="lede" style="margin-top:0.75rem">' + cs.overview + '</p>' +
      '<div class="case-grid">' +
      '<div><h4>Challenge</h4><p>' + cs.challenge + '</p></div>' +
      '<div><h4>Outcome</h4><p>' + cs.outcome + '</p></div>' +
      '</div>' +
      '<div class="case-strategy"><h4>Strategy &amp; Results</h4><p>' + cs.strategy + '</p></div>';
    consult.dataset.consult = btn.dataset.case;
    if (site.lenis) site.lenis.stop();
    dialog.showModal();
  });

  dialog.addEventListener('click', function (e) {
    if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
    if (e.target.closest('[data-consult]')) dialog.close();
  });
  dialog.addEventListener('close', function () { if (site.lenis) site.lenis.start(); });
})();
