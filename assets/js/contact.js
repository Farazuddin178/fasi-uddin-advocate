/* Contact page: message form. */
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
})();
