'use strict';

/* ---------------------------------------------------------------------------
   Tema claro / oscuro
   Sin elección manual se usa prefers-color-scheme (vía CSS). La elección manual
   se guarda solo en sessionStorage y tiene prioridad durante la sesión.
--------------------------------------------------------------------------- */
const THEME_KEY = 'rec-theme';
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function storeTheme(theme) {
  try {
    sessionStorage.setItem(THEME_KEY, theme);
  } catch {
    // Almacenamiento bloqueado: el tema se aplica solo a la vista actual.
  }
}

function initTheme() {
  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  const themeMetas = document.querySelectorAll('meta[name="theme-color"]');
  if (!toggle) return;

  const currentTheme = () => root.dataset.theme || (darkQuery.matches ? 'dark' : 'light');

  const sync = () => {
    const theme = currentTheme();
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    if (root.dataset.theme) {
      themeMetas.forEach((meta) => meta.setAttribute('content', theme === 'dark' ? '#000000' : '#FFFFFF'));
    }
  };

  toggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    storeTheme(next);
    sync();
  });

  darkQuery.addEventListener('change', sync);
  sync();
}

/* ---------------------------------------------------------------------------
   Navegación móvil
--------------------------------------------------------------------------- */
function initNav() {
  const nav = document.querySelector('[data-nav]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-nav-menu]');
  if (!nav || !toggle || !menu) return;

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.toggleAttribute('data-open', open);
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (isOpen() && !nav.contains(event.target)) setOpen(false);
  });

  nav.addEventListener('focusout', (event) => {
    if (isOpen() && event.relatedTarget && !nav.contains(event.relatedTarget)) setOpen(false);
  });

  window.matchMedia('(min-width: 64em)').addEventListener('change', () => setOpen(false));
}

/* ---------------------------------------------------------------------------
   Header: línea inferior al hacer scroll y botón flotante de WhatsApp
--------------------------------------------------------------------------- */
function initScrollState() {
  if (!('IntersectionObserver' in window)) return;

  const header = document.querySelector('[data-header]');
  const sentinel = document.querySelector('[data-header-sentinel]');
  if (header && sentinel) {
    new IntersectionObserver(([entry]) => {
      header.toggleAttribute('data-scrolled', !entry.isIntersecting);
    }).observe(sentinel);
  }

  // Se oculta donde ya hay datos de contacto para no tapar el formulario.
  const waButton = document.querySelector('[data-wa-float]');
  const zones = document.querySelectorAll('#contacto, .site-footer');
  if (waButton && zones.length) {
    const visible = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      waButton.toggleAttribute('data-hidden', visible.size > 0);
    });
    zones.forEach((zone) => observer.observe(zone));
  }
}

/* ---------------------------------------------------------------------------
   Propiedades: preselecciona la propiedad en el formulario
--------------------------------------------------------------------------- */
function initPropertyInquiry() {
  const select = document.getElementById('f-property');
  if (!select) return;

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-inquire]');
    if (!trigger) return;

    const value = trigger.dataset.inquire;
    if (Array.from(select.options).some((option) => option.value === value)) {
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

/* ---------------------------------------------------------------------------
   Formulario de contacto
--------------------------------------------------------------------------- */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validators = {
  name(field) {
    return field.value.trim().length >= 2 ? '' : 'Escriba su nombre completo.';
  },
  email(field) {
    const value = field.value.trim();
    if (!value) return 'Escriba su correo electrónico.';
    return EMAIL_PATTERN.test(value) ? '' : 'Revise el formato del correo, por ejemplo: nombre@dominio.com.';
  },
  phone(field) {
    const digits = field.value.replace(/\D/g, '');
    if (!digits) return 'Escriba un teléfono de contacto.';
    return digits.length >= 10 && digits.length <= 13 ? '' : 'El teléfono debe tener 10 dígitos o incluir la lada internacional.';
  },
  property(field) {
    return field.value ? '' : 'Seleccione una propiedad o el tipo de solicitud.';
  },
  message(field) {
    return field.value.length <= 1000 ? '' : 'El mensaje admite hasta 1000 caracteres.';
  },
  consent(field) {
    return field.checked ? '' : 'Necesitamos su autorización para responder la solicitud.';
  },
};

/*
  TODO(API): sustituir la simulación por el envío real. Ejemplo:
  return fetch('/api/contacto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((response) => {
    if (!response.ok) throw new Error(`Error ${response.status}`);
  });
*/
function sendInquiry(data) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), 1200);
  });
}

function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const success = document.querySelector('[data-form-success]');
  const successTitle = document.querySelector('[data-success-title]');
  const resetButton = document.querySelector('[data-form-reset]');
  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('[data-submit]');
  const submitLabel = form.querySelector('[data-submit-label]');
  const fields = Array.from(form.elements).filter((el) => el.name && validators[el.name]);
  let touched = new WeakSet();

  const showError = (field, message) => {
    const error = document.getElementById(`${field.id}-error`);
    if (error) error.textContent = message;
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  };

  const validateField = (field) => {
    const message = validators[field.name](field);
    showError(field, message);
    return !message;
  };

  const setBusy = (busy) => {
    form.setAttribute('aria-busy', String(busy));
    submit.setAttribute('aria-disabled', String(busy));
    submitLabel.textContent = busy ? 'Enviando…' : 'Enviar solicitud';
  };

  fields.forEach((field) => {
    field.addEventListener('blur', () => {
      if (form.hidden) return;
      const hasInput = field.type !== 'checkbox' && field.value;
      if (hasInput || touched.has(field)) {
        touched.add(field);
        validateField(field);
      }
    });
    const revalidate = () => {
      if (field.hasAttribute('aria-invalid')) validateField(field);
    };
    field.addEventListener('input', revalidate);
    field.addEventListener('change', revalidate);
  });

  form.addEventListener('reset', () => {
    touched = new WeakSet();
    fields.forEach((field) => showError(field, ''));
    status.textContent = '';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (form.getAttribute('aria-busy') === 'true') return;

    fields.forEach((field) => touched.add(field));
    const invalid = fields.filter((field) => !validateField(field));

    if (invalid.length) {
      status.textContent = invalid.length === 1
        ? 'Hay 1 campo por corregir.'
        : `Hay ${invalid.length} campos por corregir.`;
      invalid[0].focus();
      return;
    }

    status.textContent = '';
    setBusy(true);

    try {
      await sendInquiry(Object.fromEntries(new FormData(form)));
      form.reset();
      form.hidden = true;
      success.hidden = false;
      successTitle.focus();
    } catch {
      status.textContent = 'No pudimos enviar su solicitud. Intente de nuevo o escríbanos por WhatsApp.';
    } finally {
      setBusy(false);
    }
  });

  resetButton?.addEventListener('click', () => {
    success.hidden = true;
    form.hidden = false;
    form.querySelector('input')?.focus();
  });
}

/* ---------------------------------------------------------------------------
   Inicio
--------------------------------------------------------------------------- */
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

initTheme();
initNav();
initScrollState();
initPropertyInquiry();
initContactForm();
