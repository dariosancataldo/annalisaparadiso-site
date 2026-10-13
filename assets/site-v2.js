const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileNavigation = document.getElementById('mobile-navigation');

function closeMenu() {
  mobileNavigation.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Apri il menu');
}

if (menuToggle && mobileNavigation) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    mobileNavigation.hidden = isOpen;
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Apri il menu' : 'Chiudi il menu');
  });
  mobileNavigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileNavigation.hidden) {
      closeMenu();
      menuToggle.focus();
    }
  });
  window.matchMedia('(min-width: 1051px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });
}

const needCards = document.querySelectorAll('#needCards .need-card');
function activateNeedCard(card) {
  needCards.forEach(item => {
    item.classList.toggle('active', item === card);
    item.setAttribute('aria-pressed', String(item === card));
  });
  document.getElementById('dynamicTitle').textContent = card.dataset.title;
  document.getElementById('dynamicText').textContent = card.dataset.text;
  document.getElementById('dynamicCta').textContent = card.dataset.cta;
}
needCards.forEach(card => {
  card.addEventListener('click', () => activateNeedCard(card));
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activateNeedCard(card);
    }
  });
});

document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isOpen));
    button.closest('.faq-item').classList.toggle('open', !isOpen);
    document.getElementById(button.getAttribute('aria-controls')).hidden = isOpen;
  });
});

const contactForm = document.querySelector('form[name="contatto-annalisa"]');
if (contactForm) {
  const submitButton = contactForm.querySelector('[type="submit"]');
  const formStatus = document.getElementById('form-status');
  let submitting = false;

  contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || !contactForm.reportValidity()) return;
    submitting = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Invio in corso…';
    contactForm.setAttribute('aria-busy', 'true');
    formStatus.dataset.state = 'loading';
    formStatus.textContent = 'La richiesta viene inviata. Attendi qualche istante.';

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(contactForm)).toString(),
      });
      if (!response.ok) throw new Error('Invio non completato');
      contactForm.reset();
      formStatus.dataset.state = 'success';
      formStatus.textContent = 'Grazie, la tua richiesta è stata inviata. Ti ricontatterò ai recapiti indicati.';
    } catch {
      formStatus.dataset.state = 'error';
      formStatus.textContent = 'Non è stato possibile confermare l’invio. I dati sono rimasti nel modulo: puoi riprovare oppure contattarmi per telefono, WhatsApp o email.';
    } finally {
      submitting = false;
      submitButton.disabled = false;
      submitButton.textContent = 'Invia la richiesta';
      contactForm.removeAttribute('aria-busy');
    }
  });
}
